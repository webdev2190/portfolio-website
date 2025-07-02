package com.optum.pure.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.optum.pure.common.*;
import com.optum.pure.filestore.FileStore;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.requestobjects.common.*;
import com.optum.pure.model.requestobjects.v2.*;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static com.optum.pure.common.StatusEnum.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PUREServiceControllerTest {

    private static final String CALLER_ID = "devut";
    private static final Set<String> VALID_CALLER_IDS = Set.of(CALLER_ID);
    private static final String TRACKING_ID = "test-tracking-id";

    @Mock private TrackingStore trackingStore;
    @Mock private FileStore fileStore;
    @Mock private LogStore logStore;
    @Mock private Producer producer;
    @Mock private ObjectMapper objectMapper;
    @Mock private Clock clock;

    @InjectMocks
    private PUREServiceController controller;

    private final MockHttpServletRequest request = new MockHttpServletRequest();
    private PostTokensV2 validPostTokens;

    @BeforeEach
    void setUp() throws IOException {
        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(80);
        request.setContextPath("/requestData");

        validPostTokens = new PostTokensV2(List.of(
            new TokenTuple("valid1", "valid2"),
            new TokenTuple("valid3", "valid4")
        ));

        when(clock.instant()).thenReturn(Instant.now());
        doNothing().when(logStore).insertLogRecord(any());
    }

    // ========== GET Claims Enrollments Tests ========== //

    @Test
    @DisplayName("GET - Should return tracking status for valid tracking ID")
    void getClaimsEnrollments_ValidTrackingId() throws Exception {
        var record = new TrackingRecord(TRACKING_ID, IN_PROGRESS.toString());
        when(trackingStore.getTrackingRecord(TRACKING_ID)).thenReturn(record);

        var result = controller.getClaimsEnrollments(TRACKING_ID, request, CALLER_ID);

        assertInstanceOf(TrackingStatus.class, result);
        assertEquals(TRACKING_ID, ((TrackingStatus) result).getTrackingId());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("GET - Should reject invalid caller IDs")
    void getClaimsEnrollments_InvalidCallerIds(String invalidCallerId) throws Exception {
        var result = controller.getClaimsEnrollments(TRACKING_ID, request, invalidCallerId);
        
        assertAll(
            () -> assertNull(((TrackingStatus) result).getTrackingId()),
            () -> assertEquals(INVALID.toString(), ((TrackingStatus) result).getStatus())
        );
    }

    @Test
    @DisplayName("GET - Should handle completed status with file response")
    void getClaimsEnrollments_CompletedStatus() throws Exception {
        var record = new TrackingRecord(TRACKING_ID, COMPLETED_SUCCESSFULLY.toString());
        record.setOutputArtifactUri("test-path");
        when(trackingStore.getTrackingRecord(TRACKING_ID)).thenReturn(record);
        when(fileStore.readObject("test-path")).thenReturn(new byte[]{});

        var result = controller.getClaimsEnrollments(TRACKING_ID, request, CALLER_ID);

        assertInstanceOf(ResponseEntity.class, result);
    }

    // ========== POST Tokens Tests ========== //

    @Test
    @DisplayName("POST - Should accept valid token submission")
    void submitDeidentifiedTokensV2_ValidRequest() throws Exception {
        var response = controller.submitDeidentifiedTokensV2(
            "valid-json", 
            request, 
            CALLER_ID
        );

        assertAll(
            () -> assertNotNull(response.getTrackingId()),
            () -> assertNull(response.getStatus()),
            () -> assertNull(response.getErrorDescription())
        );
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("POST - Should reject empty/null request bodies")
    void submitDeidentifiedTokensV2_EmptyRequestBody(String emptyBody) {
        var response = controller.submitDeidentifiedTokensV2(
            emptyBody, 
            request, 
            CALLER_ID
        );

        assertEquals(INVALID.toString(), response.getStatus());
    }

    @Test
    @DisplayName("POST - Should handle file store failures")
    void submitDeidentifiedTokensV2_FileStoreFailure() throws Exception {
        doThrow(IOException.class)
            .when(fileStore).writeObject(any(), any(), anyBoolean());

        var response = controller.submitDeidentifiedTokensV2(
            "valid-json", 
            request, 
            CALLER_ID
        );

        assertEquals(ERRORED.toString(), response.getStatus());
    }

    // ========== Common Test Utilities ========== //

    @Test
    @DisplayName("Should properly track metrics on success")
    void verifyMetricTracking() throws Exception {
        controller.submitDeidentifiedTokensV2("valid-json", request, CALLER_ID);

        verify(trackingStore).updateRecord(
            anyString(),
            any(),
            argThat(metrics -> metrics.size() == 3)
        );
    }

    @Test
    @DisplayName("Should log all requests")
    void verifyRequestLogging() throws Exception {
        controller.getClaimsEnrollments(TRACKING_ID, request, CALLER_ID);
        verify(logStore).insertLogRecord(any());
    }

    // ========== Exception Handler Tests ========== //

    @Test
    @DisplayName("Should handle invalid JSON gracefully")
    void handleJsonProcessingException() throws Exception {
        when(objectMapper.readValue(anyString(), eq(PostTokensV2.class)))
            .thenThrow(JsonProcessingException.class);

        var response = controller.submitDeidentifiedTokensV2(
            "invalid-json", 
            request, 
            CALLER_ID
        );

        assertEquals(INVALID.toString(), response.getStatus());
    }
}

==================================================cgt============================================================>
package com.optum.pure.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.optum.pure.common.StatusEnum;
import com.optum.pure.filestore.FileStore;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.model.dto.v2.ResponseV2;
import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.requestobjects.common.LogRecord;
import com.optum.pure.model.requestobjects.common.TrackingRecord;
import com.optum.pure.model.requestobjects.v2.PostTokensV2;
import com.optum.pure.model.requestobjects.v2.TokenTuple;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.io.IOException;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

class PUREServiceControllerTest {

    private static final String ERROR_MSG = "Unable to process the request";
    private static final String EMPTY_REQUEST_BODY_ERR_MSG = "Request body is empty";
    private static final String INVALID_TRACKING_ID = "Invalid trackingId";
    private static final String CALLER_ID = "devut";

    @InjectMocks
    private PUREServiceController pureServiceController;
    @Mock
    private TrackingStore mockTrackingStore;
    @Mock
    private FileStore mockFileStore;
    @Mock
    private LogStore mockLogStore;
    @Mock
    private Producer mockNotificationStore;

    private TrackingRecord trackingRecord;
    private LogRecord logRecord;
    private ResponseV2 responseV2;
    private PostTokensV2 postTokensV2;
    private MockHttpServletRequest mockHttpServletRequest;

    @BeforeEach
    void setUp() throws IOException {
        MockitoAnnotations.openMocks(this);
        postTokensV2 = new PostTokensV2();
        trackingRecord = new TrackingRecord();
        trackingRecord.setTrackingId("test-tracking-id");
        trackingRecord.setStatus(StatusEnum.IN_PROGRESS.toString());
        logRecord = new LogRecord();
        responseV2 = new ResponseV2();
        postTokensV2.setDeIdentifiedTokenTuples(Arrays.asList(new TokenTuple("tt1", "tt2"),
                new TokenTuple("test-token1", "test-token2")));
        mockHttpServletRequest = new MockHttpServletRequest();
        mockHttpServletRequest.setScheme("http");
        mockHttpServletRequest.setServerName("localhost");
        mockHttpServletRequest.setServerPort(80);
        mockHttpServletRequest.setContextPath("/requestData");
        doNothing().when(mockLogStore).insertLogRecord(any());
    }

    @Test
    void getClaimsEnrollments_shouldReturnResponse() throws Exception {
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        var result = pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(result).isNotNull();
    }

    @Test
    void getClaimsEnrollments_invalidCallerId_returnsStatus() throws Exception {
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus status = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isEqualTo("test-tracking-id");
        assertThat(status.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(status.getErrorDescription()).isNull();
    }

    @Test
    void getClaimsEnrollments_invalidTrackingId_returnsInvalidStatus() throws Exception {
        trackingRecord.setTrackingId(null);
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus status = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo(INVALID_TRACKING_ID);
    }

    @Test
    void getClaimsEnrollments_emptyBody_returnsInvalidStatus() throws Exception {
        trackingRecord = null;
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus status = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo(INVALID_TRACKING_ID);
    }

    @Test
    void getClaimsEnrollments_trackingStoreFails_returnsErroredStatus() throws Exception {
        when(mockTrackingStore.getTrackingRecord(anyString())).thenThrow(new IOException("test error"));
        TrackingStatus status = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void getClaimsEnrollments_statusCompleted_returnsOk() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        when(mockFileStore.readObject(anyString()))
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(responseV2))));
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(responseEntity).isNotNull();
        assertThat(responseEntity.getStatusCodeValue()).isEqualTo(200);
    }

    @Test
    void getClaimsEnrollments_updateTimeThrowsException_stillReturnsResponse() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        when(mockFileStore.readObject(anyString()))
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(responseV2))));
        doThrow(new IOException("test")).when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        var result = pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(result).isNotNull();
    }

    @Test
    void submitTokens_success() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNotNull();
        assertThat(status.getStatus()).isNull();
        assertThat(status.getErrorDescription()).isNull();
    }

    @Test
    void submitTokens_emptyRequest() throws Exception {
        postTokensV2 = null;
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo("Invalid/Missing values - " + EMPTY_REQUEST_BODY_ERR_MSG);
    }

    @Test
    void submitTokens_emptyCallerId() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, "");
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo("Invalid Caller-Id - ");
    }

    @Test
    void submitTokens_nullTokens() throws Exception {
        List<Object> list = new ArrayList<>();
        list.add(new Object());
        postTokensV2.setDeIdentifiedTokenTuples(list);
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty");
    }

    @Test
    void submitTokens_emptyTokens() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(new ArrayList<>());
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo("Invalid/Missing values - deIdentifiedTokenTuples");
    }

    @Test
    void submitTokens_invalidTokenTuple() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(Collections.singletonList(new TokenTuple("abc", "")));
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("INVALID");
        assertThat(status.getErrorDescription()).isEqualTo("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty");
    }

    @Test
    void submitTokens_trackingStoreFails_returnsErrored() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doThrow(new IOException("test-exception")).when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void submitTokens_fileStoreFails_returnsErrored() throws Exception {
        doThrow(new InterruptedException("test")).when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void submitTokens_trackingStoreGetFails_returnsErrored() throws Exception {
        doThrow(new InterruptedException("test")).when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status).isNotNull();
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void submitTokens_emitNotificationFails_returnsErrored() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void getClaimsEnrollments_fileStoreFails_returnsErrored() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        when(mockFileStore.readObject(anyString())).thenThrow(IOException.class);
        TrackingStatus status = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void submitTokens_logRecordInsertFails_returnsErrored() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        when(mockTrackingStore.getTrackingRecord(anyString())).thenThrow(IOException.class);
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        doThrow(new IOException()).when(mockLogStore).insertLogRecord(any());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void submitTokens_onExceptionStatusUpdate_succeeds() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }

    @Test
    void submitTokens_onExceptionStatusUpdateFails_returnsErrored() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        when(mockTrackingStore.getTrackingRecord(anyString())).thenThrow(IOException.class);
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertThat(status.getTrackingId()).isNull();
        assertThat(status.getStatus()).isEqualTo("ERRORED");
        assertThat(status.getErrorDescription()).isEqualTo(ERROR_MSG);
    }
}

