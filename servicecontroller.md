package com.optum.pure.service;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.StatusEnum;
import com.optum.pure.common.Utils;
import com.optum.pure.filestore.FileStore;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.model.requestobjects.common.LogRecord;
import com.optum.pure.model.requestobjects.common.TrackingRecord;
import com.optum.pure.model.requestobjects.v2.PostTokensV2;
import com.optum.pure.model.requestobjects.v2.TokenTuple;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.StopWatch;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

//import javax.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
@Log4j2
public class PUREServiceController {

    /**It allows you to log debug, info, error, and other messages throughout your class.
     * This is essential for monitoring, debugging, and troubleshooting your application.
     * Without this logger, calls like log.debug or log.error would not work.*/
    private static final org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager.getLogger(PUREServiceController.class);


    private static final String ERROR_MSG = "Unable to process the request";
    private static final String EMPTY_REQUEST_BODY_ERR_MSG = "Request body is empty";
    private static final String INVALID_ERR_MSG = "Invalid Request";
    private static final String INVALID_TRACKING_ID = "Invalid trackingId";
    private static final String CORRELATION_ID_HEADER = "optum-cid-ext";
    // Use List.of() for immutable config lists (Java 9+)
    private static final List<String> tokenTypes = List.of(ConfigurationManager.get("VALID_TOKEN_TYPES").split(","));
    private static final List<String> validCallerIds = List.of(ConfigurationManager.get("VALID_CALLERID").split(","));
    private static final int GET_TRACKING_RECORD_RETRY = 2;

    private final  TrackingStore trackingStore;
    private final FileStore fileStore;
    private final LogStore logStore;
    private final Producer producer;

    /** the constructor takes these dependencies as parameters and assigns them to the fields.
     * This is called constructor injection, a common pattern in Spring for dependency injection.*/


    @GetMapping(value = {"/claims-enrollments/v2/{tracking-id}"},
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Object getClaimsEnrollments(@PathVariable("tracking-id") String trackingId,
                                       HttpServletRequest request,
                                       @RequestHeader("Caller-Id") String callerId) {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        TrackingRecord trackingRecord = null;
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        Object response = null;
        try {
            boolean validCallerId = validateCallerId(callerId);
            if (!validCallerId) {
                response = buildCallerIdValidationResponse(callerId);
            } else {
                try {
                    trackingRecord = fetchTrackingRecord(trackingId, GET_TRACKING_RECORD_RETRY);
                    if (trackingRecord != null && trackingRecord.getTrackingId() != null) {
                        response = getResponse(trackingRecord);
                        log.debug("claims-enrollments API - Response fetched for trackingId - {}", trackingId.replace("\n", ""));
                    } else {
                        response = new TrackingStatus(null, StatusEnum.INVALID.toString(), INVALID_TRACKING_ID);
                        log.error("Invalid trackingId - {}", trackingId.replace("\n", ""));
                    }
                } catch (Exception e) {
                    log.error("claims-enrollments API - Exception occurred while fetching response for " +
                            "trackingId -> {}", trackingId.replace("\n", ""), e);
                    response = new TrackingStatus(null, StatusEnum.ERRORED.toString(), ERROR_MSG);
                }
            }
        } finally {
            insertLogRecord(getAbstractPathfromServletPath(request.getServletPath()), trackingId, correlationId,
                    callerId, stopWatch, getStatus(response));
        }
        return response;
    }

    private TrackingRecord fetchTrackingRecord(String trackingId, int retries) throws IOException {
        TrackingRecord trackingRecord = trackingStore.getTrackingRecord(trackingId);
        return (trackingRecord == null || trackingRecord.getTrackingId() == null) && (retries > 0) ?
                fetchTrackingRecord(trackingId, retries - 1) : trackingRecord;
    }

    private Object getResponse(TrackingRecord trackingRecord) throws IOException {
        Object response = null;
        if (trackingRecord.getStatus().equals(StatusEnum.COMPLETED_SUCCESSFULLY.toString())) {
            try {
                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                response = fileStore.readObject(trackingRecord.getOutputArtifactUri());
                stopWatch.stop();
                updateRecord(trackingRecord, stopWatch);
            } catch (IOException e) {
                log.error("claims-enrollments API - Failed to fetch result from FileStore for trackingId - {}",
                        trackingRecord.getTrackingId());
                throw e;
            }
        } else {
            TrackingStatus trackingStatus = new TrackingStatus(trackingRecord.getTrackingId(),
                    trackingRecord.getStatus());
            trackingStatus.setErrorDescription(trackingRecord.getErrorDescription());
            return trackingStatus;
        }
        return ResponseEntity.ok().header("Content-Encoding", "gzip").body(response);
    }

    private void updateRecord(TrackingRecord trackingRecord, StopWatch stopWatch) {
        try {
            trackingStore.updateRecord(trackingRecord.getTrackingId(),
                    Collections.singletonList("timeToReadOutputFromFileStore"),
                    Collections.singletonList(stopWatch.getTotalTimeMillis()));
        } catch (Exception e) {
            log.error("claims-enrollments API - Failed to update TrackingStore for trackingId - {}",
                    trackingRecord.getTrackingId(), e);
        }
    }

    @PostMapping(value = "/deidentified-tokens/v2", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public TrackingStatus submitDeidentifiedTokensV2(@RequestBody String requestObject,
                                                     HttpServletRequest request,
                                                     @RequestHeader("Caller-Id") String callerId) {
        StopWatch totalTimeStopWatch = new StopWatch();
        totalTimeStopWatch.start();
        TrackingStatus response = null;
        String receivedTimestamp = Utils.getCurrentTimestamp();
        String trackingId = Utils.generateTrackingId();
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        log.debug("TrackingId generated for request - {}", trackingId.replace("\n", ""));
        try {
            PostTokensV2 postTokensV2 = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                    .readValue(requestObject, PostTokensV2.class);
            boolean validCallerId = validateCallerId(callerId);
            String requestValidationResponse = validateRequestV2(postTokensV2);
            if (!validCallerId) {
                response = buildCallerIdValidationResponse(callerId);
            } else if (requestValidationResponse.length() > 0) {
                response = buildRequestValidationResponse(requestValidationResponse);
            } else {
                log.debug("Request validation successful for trackingId - {}", trackingId.replace("\n", ""));
                String version = Utils.VER_V2;
                int tokenCountReceived = postTokensV2.getDeIdentifiedTokenTuples().size();

                processSubmitTokens(trackingId, postTokensV2, version, tokenCountReceived, callerId, receivedTimestamp, request);

                response = new TrackingStatus(trackingId, null, null);
            }
        } catch (JsonMappingException | JsonParseException e) {
            log.error("Failed to Map Request Object to PostTokensV2");
            response = new TrackingStatus(null, StatusEnum.INVALID.toString(), INVALID_ERR_MSG);
        } catch (Exception e) {
            onException(trackingId);
            log.error("Error while processing the request {}", trackingId.replace("\n", ""), e);
            response = new TrackingStatus(null, StatusEnum.ERRORED.toString(), ERROR_MSG);
        } finally {
            insertLogRecord(request.getServletPath(), trackingId, correlationId, callerId, totalTimeStopWatch,
                    getStatus(response));
        }
        return response;
    }

    private void emitNotification(TrackingRecord trackingRecord, long timeToWriteTrackingRecord) throws Exception {
        Notification notification = new Notification(trackingRecord.getTrackingId(), trackingRecord.getVersion(),
                trackingRecord.getInputArtifactUri());
        try {
            producer.sendNotification(notification, timeToWriteTrackingRecord);
        } catch (Exception e) {
            log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}",
                    trackingRecord.getTrackingId(), e);
            throw e;
        }
        log.debug("Notification sent successfully for request with trackingId: {}", trackingRecord.getTrackingId());
    }

    private void processSubmitTokens(String trackingId, Object postTokens, String version, int tokenCount,
                                     String callerId, String receivedTimestamp, HttpServletRequest request)
            throws Exception {

        String requestURI = request.getRequestURI();
        String producerUri = ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        StopWatch esStopWatch = new StopWatch();
        String inputArtifactUri = Utils.getNewInputArtifactUri(trackingId);
        try {
            fileStore.writeObject(inputArtifactUri, postTokens, false);
        } catch (Exception e) {
            log.error("Failed to write input artifact to the FileStore for trackingId -> {}", trackingId.replace("\n", ""), e);
            throw e;
        }
        stopWatch.stop();
        log.debug("Request stored in file store for trackingId - {}", trackingId.replace("\n", ""));
        TrackingRecord trackingRecord = new TrackingRecord.Builder(trackingId)
                .setTokenCountReceived(tokenCount)
                .setStatus(StatusEnum.NOT_YET_STARTED.toString())
                .setCallerId(callerId)
                .setVersion(version)
                .setRequestUri(requestURI)
                .setProducerUri(producerUri)
                .setInputArtifactUri(inputArtifactUri)
                .setReceivedTimestamp(receivedTimestamp)
                .setTimeToWriteInputToFileStore(stopWatch.getTotalTimeMillis()).build();

        esStopWatch.start();
        insertTrackingRecord(trackingRecord);
        esStopWatch.stop();

        emitNotification(trackingRecord, esStopWatch.getTotalTimeMillis());
    }

    private void onException(String trackingId) {
        try {
            TrackingRecord trackingRecord = trackingStore.getTrackingRecord(trackingId);
            if (trackingRecord != null && trackingRecord.getTrackingId() != null && !trackingRecord.getTrackingId().isEmpty()) {
                trackingStore.updateRecord(trackingId, List.of("status", "errorDescription"),
                        List.of(StatusEnum.ERRORED.toString(),
                                "Internal error occurred while processing request"));
            }
        } catch (IOException e) {
            log.error("deidentified-tokens API - Error while updating status to ERRORED in " +
                    "tracking store for trackingId: {}", trackingId.replace("\n", ""), e);
        }
    }

    private void insertTrackingRecord(TrackingRecord trackingRecord) throws IOException {
        try {
            trackingStore.insertTrackingRecord(trackingRecord);
        } catch (IOException e) {
            log.error("Failed to insert Tracking Record for Tracking Id -> {}", trackingRecord.getTrackingId(), e);
            throw e;
        }
        log.debug("Tracking record created & stored in tracking store for trackingId - {}",
                trackingRecord.getTrackingId());
    }

    private String validateRequestV2(PostTokensV2 postTokensV2) {
        StringBuilder sbValidationFailedFields = new StringBuilder();
        if (Objects.isNull(postTokensV2)) {
            sbValidationFailedFields.append(EMPTY_REQUEST_BODY_ERR_MSG);
            return sbValidationFailedFields.toString();
        }
        if (Objects.isNull(postTokensV2.getDeIdentifiedTokenTuples()) || postTokensV2.getDeIdentifiedTokenTuples().isEmpty()) {
            sbValidationFailedFields.append("deIdentifiedTokenTuples");
        } else {
            for (TokenTuple tokenTuple : postTokensV2.getDeIdentifiedTokenTuples()) {
                if (tokenTuple.getTokenType1() == null || tokenTuple.getTokenType2() == null ||
                        tokenTuple.getTokenType1().isEmpty() || tokenTuple.getTokenType2().isEmpty()) {
                    sbValidationFailedFields.append("Token(s) in a Tuple cannot be null/empty");
                    break;
                }
            }
        }
        return sbValidationFailedFields.toString();
    }

    /**
     * Performs the input request validation for getData API
     */
    private boolean validateCallerId(String callerId) {
        return !StringUtils.isEmpty(callerId) && callerId.trim().length() > 0 && validCallerIds.contains(callerId);
    }

    /**
     * Returns the status based on response object
     */
    private String getStatus(Object response) {
        if (response != null) {
            if (response instanceof TrackingStatus && ((TrackingStatus) response).getStatus() != null) {
                return ((TrackingStatus) response).getStatus();
            } else
                return StatusEnum.COMPLETED_SUCCESSFULLY.toString();
        } else
            return StatusEnum.ERRORED.toString();
    }

    /**
     * Method to construct & insert LogRecord into logstore
     */
    private void insertLogRecord(String serviceName, String trackingId, String correlationId, String callerId, StopWatch stopWatch, String status) {
        stopWatch.stop();
        LogRecord logRecord = new LogRecord(trackingId, correlationId, callerId, serviceName, status,
                Utils.getCurrentTimestamp(), stopWatch.getTotalTimeMillis());
        try {
            logStore.insertLogRecord(logRecord);
        } catch (IOException e) {
            log.error(serviceName.replace("\n", "") + " - Failed to insert log record into log store -> {}", logRecord, e);
        }
    }

    /**
     * Method to build callerId validation response
     */
    private TrackingStatus buildCallerIdValidationResponse(String callerId) {
        String validationResponse = "Invalid Caller-Id - " + callerId;
        log.error("deidentified-tokens API Caller-Id validation failed: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    /**
     * Method to build request validation response
     */
    private TrackingStatus buildRequestValidationResponse(String validationResponse) {
        validationResponse = "Invalid/Missing values - " + validationResponse;
        log.error("deidentified-tokens API input payload validation failed for fields: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    /**
     * Method to handle exception when the POST request body is empty
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public TrackingStatus handleMissingRequestBody(Exception ex) {
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), EMPTY_REQUEST_BODY_ERR_MSG);
    }

    private String getAbstractPathfromServletPath(String path) {
        Pattern pattern = Pattern.compile("(.*)/");
        Matcher matcher = pattern.matcher(path);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return path;
    }
}

====================================This is KafkaProducer code=====================================================

package com.optum.pure.notificationstore.impl;

import com.google.gson.Gson;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.common.StopWatch;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor // Lombok will generate the constructor for the final fields
@Log4j2
public final class KafkaProducer implements Producer {

    private static final String TIME_TO_INSERT_TRACKING_RECORD = "timeToInsertTrackingRecord";
    private static final String TIME_TO_EMIT_NOTIFICATION = "timeToEmitNotification";
    private static final String NOTIFICATION_EMIT_TIMESTAMP = "notificationEmitTimestamp";
    
    // Use List.of() for immutability (Java 9+)
    private static final List<String> fieldList = List.of(
            TIME_TO_EMIT_NOTIFICATION, NOTIFICATION_EMIT_TIMESTAMP, TIME_TO_INSERT_TRACKING_RECORD);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private final Gson gson = new Gson();

    @Override
    public void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception {
        log.debug("Producer called");
        StopWatch stopWatch = new StopWatch().start();

        if (notification == null) {
            log.error("Kafka Producer - Notification is null");
            stopWatch.stop();
            throw new IllegalArgumentException("Kafka Producer - Notification is null");
        }

        try {
            String trackingId = notification.getTrackingId();
            String emitTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
            log.debug("Kafka Producer - Emitting notification with trackingId: {}, time: {}", trackingId, emitTimestamp);

            // Send Kafka message (async)
            CompletableFuture<SendResult<String, String>> result = kafkaTemplate.send(
                    ConfigurationManager.get("TOPIC_NAME"), trackingId, gson.toJson(notification)
            );

            // Await send result for metadata/logging
            SendResult<String, String> sendResult = result.get();
            log.debug("Kafka Producer - Notification sent with key: {}, to topic: {} with partition: {} & offset: {}",
                    trackingId, sendResult.getRecordMetadata().topic(),
                    sendResult.getRecordMetadata().partition(), sendResult.getRecordMetadata().offset());

            stopWatch.stop();
            long timeTakenToEmitNotification = stopWatch.totalTime().getMillis();
            List<Object> valueList = List.of(timeTakenToEmitNotification, emitTimestamp, elapsedTimeTrackingRecordInsertion);
            trackingStore.updateRecord(trackingId, fieldList, valueList);

            log.debug("[Metrics] Kafka Producer - trackingId: {}, timeTaken(ms): {}",
                    trackingId, timeTakenToEmitNotification);

        } catch (Exception e) {
            log.error("Error occurred in Kafka Producer while sending notification for trackingId - {}",
                    notification.getTrackingId(), e);
            throw e; // Re-throw for caller to handle
        }
    }
}
===============================================PUREServiceController latest code=============================================

package com.optum.pure.service;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.StatusEnum;
import com.optum.pure.common.Utils;
import com.optum.pure.filestore.FileStore;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.model.requestobjects.common.LogRecord;
import com.optum.pure.model.requestobjects.common.TrackingRecord;
import com.optum.pure.model.requestobjects.v2.PostTokensV2;
import com.optum.pure.model.requestobjects.v2.TokenTuple;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.StopWatch;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
@Log4j2
public class PUREServiceController {

    // Logger for logging errors and other logs
    private static final org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager.getLogger(PUREServiceController.class);

    private static final String ERROR_MSG = "Unable to process the request";
    private static final String EMPTY_REQUEST_BODY_ERR_MSG = "Request body is empty";
    private static final String INVALID_ERR_MSG = "Invalid Request";
    private static final String INVALID_TRACKING_ID = "Invalid trackingId";
    private static final String CORRELATION_ID_HEADER = "optum-cid-ext";
    private static final List<String> tokenTypes = List.of(ConfigurationManager.get("VALID_TOKEN_TYPES").split(","));
    private static final List<String> validCallerIds = List.of(ConfigurationManager.get("VALID_CALLERID").split(","));
    private static final int GET_TRACKING_RECORD_RETRY = 2;

    private final TrackingStore trackingStore;
    private final FileStore fileStore;
    private final LogStore logStore;
    private final Producer producer;

    // Constructor is auto-generated by Lombok's @RequiredArgsConstructor

    @GetMapping(value = {"/claims-enrollments/v2/{tracking-id}"},
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Object getClaimsEnrollments(@PathVariable("tracking-id") String trackingId,
                                       HttpServletRequest request,
                                       @RequestHeader("Caller-Id") String callerId) {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        TrackingRecord trackingRecord = null;
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        Object response = null;

        try {
            boolean validCallerId = validateCallerId(callerId);
            if (!validCallerId) {
                response = buildCallerIdValidationResponse(callerId);
            } else {
                try {
                    trackingRecord = fetchTrackingRecord(trackingId, GET_TRACKING_RECORD_RETRY);
                    if (trackingRecord != null && trackingRecord.getTrackingId() != null) {
                        response = getResponse(trackingRecord);
                        log.debug("claims-enrollments API - Response fetched for trackingId - {}", trackingId.replace("\n", ""));
                    } else {
                        response = new TrackingStatus(null, StatusEnum.INVALID.toString(), INVALID_TRACKING_ID);
                        log.error("Invalid trackingId - {}", trackingId.replace("\n", ""));
                    }
                } catch (Exception e) {
                    log.error("claims-enrollments API - Exception occurred while fetching response for trackingId -> {}", trackingId.replace("\n", ""), e);
                    response = new TrackingStatus(null, StatusEnum.ERRORED.toString(), ERROR_MSG);
                }
            }
        } finally {
            insertLogRecord(request.getServletPath(), trackingId, correlationId, callerId, stopWatch, getStatus(response));
        }
        return response;
    }

    private TrackingRecord fetchTrackingRecord(String trackingId, int retries) throws IOException {
        TrackingRecord trackingRecord = trackingStore.getTrackingRecord(trackingId);
        return (trackingRecord == null || trackingRecord.getTrackingId() == null) && (retries > 0)
                ? fetchTrackingRecord(trackingId, retries - 1) : trackingRecord;
    }

    private Object getResponse(TrackingRecord trackingRecord) throws IOException {
        Object response = null;
        if (trackingRecord.getStatus().equals(StatusEnum.COMPLETED_SUCCESSFULLY.toString())) {
            try {
                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                response = fileStore.readObject(trackingRecord.getOutputArtifactUri());
                stopWatch.stop();
                updateRecord(trackingRecord, stopWatch);
            } catch (IOException e) {
                log.error("claims-enrollments API - Failed to fetch result from FileStore for trackingId - {}", trackingRecord.getTrackingId());
                throw e;
            }
        } else {
            TrackingStatus trackingStatus = new TrackingStatus(trackingRecord.getTrackingId(),
                    trackingRecord.getStatus());
            trackingStatus.setErrorDescription(trackingRecord.getErrorDescription());
            return trackingStatus;
        }
        return ResponseEntity.ok().header("Content-Encoding", "gzip").body(response);
    }

    private void updateRecord(TrackingRecord trackingRecord, StopWatch stopWatch) {
        try {
            trackingStore.updateRecord(trackingRecord.getTrackingId(),
                    Collections.singletonList("timeToReadOutputFromFileStore"),
                    Collections.singletonList(stopWatch.getTotalTimeMillis()));
        } catch (Exception e) {
            log.error("claims-enrollments API - Failed to update TrackingStore for trackingId - {}", trackingRecord.getTrackingId(), e);
        }
    }

    @PostMapping(value = "/deidentified-tokens/v2", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public TrackingStatus submitDeidentifiedTokensV2(@RequestBody String requestObject,
                                                     HttpServletRequest request,
                                                     @RequestHeader("Caller-Id") String callerId) {
        StopWatch totalTimeStopWatch = new StopWatch();
        totalTimeStopWatch.start();
        TrackingStatus response = null;
        String receivedTimestamp = Utils.getCurrentTimestamp();
        String trackingId = Utils.generateTrackingId();
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        log.debug("TrackingId generated for request - {}", trackingId.replace("\n", ""));
        try {
            PostTokensV2 postTokensV2 = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                    .readValue(requestObject, PostTokensV2.class);
            boolean validCallerId = validateCallerId(callerId);
            String requestValidationResponse = validateRequestV2(postTokensV2);
            if (!validCallerId) {
                response = buildCallerIdValidationResponse(callerId);
            } else if (requestValidationResponse.length() > 0) {
                response = buildRequestValidationResponse(requestValidationResponse);
            } else {
                log.debug("Request validation successful for trackingId - {}", trackingId.replace("\n", ""));
                String version = Utils.VER_V2;
                int tokenCountReceived = postTokensV2.getDeIdentifiedTokenTuples().size();

                processSubmitTokens(trackingId, postTokensV2, version, tokenCountReceived, callerId, receivedTimestamp, request);

                response = new TrackingStatus(trackingId, null, null);
            }
        } catch (JsonMappingException | JsonParseException e) {
            log.error("Failed to Map Request Object to PostTokensV2");
            response = new TrackingStatus(null, StatusEnum.INVALID.toString(), INVALID_ERR_MSG);
        } catch (Exception e) {
            onException(trackingId);
            log.error("Error while processing the request {}", trackingId.replace("\n", ""), e);
            response = new TrackingStatus(null, StatusEnum.ERRORED.toString(), ERROR_MSG);
        } finally {
            insertLogRecord(request.getServletPath(), trackingId, correlationId, callerId, totalTimeStopWatch,
                    getStatus(response));
        }
        return response;
    }

    private void emitNotification(TrackingRecord trackingRecord, long timeToWriteTrackingRecord) throws Exception {
        Notification notification = new Notification(trackingRecord.getTrackingId(), trackingRecord.getVersion(),
                trackingRecord.getInputArtifactUri());
        try {
            producer.sendNotification(notification, timeToWriteTrackingRecord);
        } catch (Exception e) {
            log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}", trackingRecord.getTrackingId(), e);
            throw e;
        }
        log.debug("Notification sent successfully for request with trackingId: {}", trackingRecord.getTrackingId());
    }

    private void processSubmitTokens(String trackingId, Object postTokens, String version, int tokenCount,
                                     String callerId, String receivedTimestamp, HttpServletRequest request)
            throws Exception {

        String requestURI = request.getRequestURI();
        String producerUri = ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        StopWatch esStopWatch = new StopWatch();
        String inputArtifactUri = Utils.getNewInputArtifactUri(trackingId);
        try {
            fileStore.writeObject(inputArtifactUri, postTokens, false);
        } catch (Exception e) {
            log.error("Failed to write input artifact to the FileStore for trackingId -> {}", trackingId.replace("\n", ""), e);
            throw e;
        }
        stopWatch.stop();
        log.debug("Request stored in file store for trackingId - {}", trackingId.replace("\n", ""));
        TrackingRecord trackingRecord = new TrackingRecord.Builder(trackingId)
                .setTokenCountReceived(tokenCount)
                .setStatus(StatusEnum.NOT_YET_STARTED.toString())
                .setCallerId(callerId)
                .setVersion(version)
                .setRequestUri(requestURI)
                .setProducerUri(producerUri)
                .setInputArtifactUri(inputArtifactUri)
                .setReceivedTimestamp(receivedTimestamp)
                .setTimeToWriteInputToFileStore(stopWatch.getTotalTimeMillis()).build();

        esStopWatch.start();
        insertTrackingRecord(trackingRecord);
        esStopWatch.stop();

        emitNotification(trackingRecord, esStopWatch.getTotalTimeMillis());
    }

    private void onException(String trackingId) {
        try {
            TrackingRecord trackingRecord = trackingStore.getTrackingRecord(trackingId);
            if (trackingRecord != null && trackingRecord.getTrackingId() != null && !trackingRecord.getTrackingId().isEmpty()) {
                trackingStore.updateRecord(trackingId, List.of("status", "errorDescription"),
                        List.of(StatusEnum.ERRORED.toString(),
                                "Internal error occurred while processing request"));
            }
        } catch (IOException e) {
            log.error("deidentified-tokens API - Error while updating status to ERRORED in " +
                    "tracking store for trackingId: {}", trackingId.replace("\n", ""), e);
        }
    }

    private void insertTrackingRecord(TrackingRecord trackingRecord) throws IOException {
        try {
            trackingStore.insertTrackingRecord(trackingRecord);
        } catch (IOException e) {
            log.error("Failed to insert Tracking Record for Tracking Id -> {}", trackingRecord.getTrackingId(), e);
            throw e;
        }
        log.debug("Tracking record created & stored in tracking store for trackingId - {}",
                trackingRecord.getTrackingId());
    }

    private String validateRequestV2(PostTokensV2 postTokensV2) {
        StringBuilder sbValidationFailedFields = new StringBuilder();
        if (Objects.isNull(postTokensV2)) {
            sbValidationFailedFields.append(EMPTY_REQUEST_BODY_ERR_MSG);
            return sbValidationFailedFields.toString();
        }
        if (Objects.isNull(postTokensV2.getDeIdentifiedTokenTuples()) || postTokensV2.getDeIdentifiedTokenTuples().isEmpty()) {
            sbValidationFailedFields.append("deIdentifiedTokenTuples");
        } else {
            for (TokenTuple tokenTuple : postTokensV2.getDeIdentifiedTokenTuples()) {
                if (tokenTuple.getTokenType1() == null || tokenTuple.getTokenType2() == null ||
                        tokenTuple.getTokenType1().isEmpty() || tokenTuple.getTokenType2().isEmpty()) {
                    sbValidationFailedFields.append("Token(s) in a Tuple cannot be null/empty");
                    break;
                }
            }
        }
        return sbValidationFailedFields.toString();
    }

    /**
     * Performs the input request validation for getData API
     */
    private boolean validateCallerId(String callerId) {
        return !StringUtils.isEmpty(callerId) && callerId.trim().length() > 0 && validCallerIds.contains(callerId);
    }

    /**
     * Returns the status based on response object
     */
    private String getStatus(Object response) {
        if (response != null) {
            if (response instanceof TrackingStatus && ((TrackingStatus) response).getStatus() != null) {
                return ((TrackingStatus) response).getStatus();
            } else
                return StatusEnum.COMPLETED_SUCCESSFULLY.toString();
        } else
            return StatusEnum.ERRORED.toString();
    }

    /**
     * Method to construct & insert LogRecord into logstore
     */
    private void insertLogRecord(String serviceName, String trackingId, String correlationId, String callerId, StopWatch stopWatch, String status) {
        stopWatch.stop();
        LogRecord logRecord = new LogRecord(trackingId, correlationId, callerId, serviceName, status,
                Utils.getCurrentTimestamp(), stopWatch.getTotalTimeMillis());
        try {
            logStore.insertLogRecord(logRecord);
        } catch (IOException e) {
            log.error(serviceName.replace("\n", "") + " - Failed to insert log record into log store -> {}", logRecord, e);
        }
    }

    /**
     * Method to build callerId validation response
     */
    private TrackingStatus buildCallerIdValidationResponse(String callerId) {
        String validationResponse = "Invalid Caller-Id - " + callerId;
        log.error("deidentified-tokens API Caller-Id validation failed: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    /**
     * Method to build request validation response
     */
    private TrackingStatus buildRequestValidationResponse(String validationResponse) {
        validationResponse = "Invalid/Missing values - " + validationResponse;
        log.error("deidentified-tokens API input payload validation failed for fields: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    /**
     * Method to handle exception when the POST request body is empty
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public TrackingStatus handleMissingRequestBody(Exception ex) {
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), EMPTY_REQUEST_BODY_ERR_MSG);
    }

    private String getAbstractPathfromServletPath(String path) {
        Pattern pattern = Pattern.compile("(.*)/");
        Matcher matcher = pattern.matcher(path);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return path;
    }
}

