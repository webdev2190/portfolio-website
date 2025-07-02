package com.optum.pure.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.optum.pure.common.*;
import com.optum.pure.filestore.FileStore;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.model.requestobjects.common.*;
import com.optum.pure.model.requestobjects.v2.*;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

import static com.optum.pure.common.StatusEnum.*;
import static java.util.stream.Collectors.toSet;

@RestController
@RequiredArgsConstructor
@Log4j2
public class PUREServiceController {
    // Immutable configuration
    private static final Set<String> VALID_TOKEN_TYPES = 
        Set.of(ConfigurationManager.get("VALID_TOKEN_TYPES").split(","));
    private static final Set<String> VALID_CALLER_IDS = 
        Set.of(ConfigurationManager.get("VALID_CALLERID").split(","));
    private static final String CORRELATION_ID_HEADER = "optum-cid-ext";
    private static final int GET_TRACKING_RECORD_RETRY = 2;
    private static final Pattern PATH_PATTERN = Pattern.compile("(.*)/");

    // Injected dependencies
    private final TrackingStore trackingStore;
    private final FileStore fileStore;
    private final LogStore logStore;
    private final Producer producer;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    @GetMapping(value = "/claims-enrollments/v2/{tracking-id}", 
               produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<Object> getClaimsEnrollments(
            @PathVariable("tracking-id") String trackingId,
            HttpServletRequest request,
            @RequestHeader("Caller-Id") String callerId) {
        
        final var sanitizedId = sanitize(trackingId);
        final var stopWatch = new StopWatch().start();
        final var correlationId = request.getHeader(CORRELATION_ID_HEADER);

        return CompletableFuture.supplyAsync(() -> {
            if (!validateCallerId(callerId)) {
                return buildCallerIdValidationResponse(callerId);
            }
            return fetchTrackingRecord(sanitizedId, GET_TRACKING_RECORD_RETRY)
                .map(this::processTrackingRecord)
                .orElseGet(() -> new TrackingStatus(null, INVALID.toString(), INVALID_TRACKING_ID));
        }).whenComplete((response, ex) -> {
            insertLogRecord(
                getAbstractPath(request.getServletPath()),
                sanitizedId,
                correlationId,
                callerId,
                stopWatch.stop(),
                getStatus(response)
            );
            if (ex != null) {
                log.error("Exception processing trackingId: {}", sanitizedId, ex);
            }
        });
    }

    @PostMapping(value = "/deidentified-tokens/v2", 
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<TrackingStatus> submitDeidentifiedTokensV2(
            @RequestBody String requestBody,
            HttpServletRequest request,
            @RequestHeader("Caller-Id") String callerId) {
        
        final var trackingId = sanitize(Utils.generateTrackingId());
        final var stopWatch = new StopWatch().start();
        final var correlationId = request.getHeader(CORRELATION_ID_HEADER);
        final var receivedTimestamp = Instant.now(clock).toString();

        return parseRequest(requestBody)
            .thenCompose(postTokens -> validateRequest(postTokens)
                .map(invalid -> CompletableFuture.completedFuture(buildRequestValidationResponse(invalid)))
                .orElseGet(() -> processValidRequest(trackingId, postTokens, callerId, receivedTimestamp, request))
            ).whenComplete((response, ex) -> {
                insertLogRecord(
                    request.getServletPath(),
                    trackingId,
                    correlationId,
                    callerId,
                    stopWatch.stop(),
                    getStatus(response)
                );
                if (ex != null) {
                    onException(trackingId);
                    log.error("Error processing trackingId: {}", trackingId, ex);
                }
            });
    }

    // ========== Helper Methods ========== //

    private CompletableFuture<PostTokensV2> parseRequest(String requestBody) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return objectMapper.readValue(requestBody, PostTokensV2.class);
            } catch (JsonProcessingException e) {
                throw new InvalidRequestException("Invalid request payload");
            }
        });
    }

    private Optional<String> validateRequest(PostTokensV2 postTokens) {
        if (postTokens == null) {
            return Optional.of("Request body is empty");
        }
        if (postTokens.getDeIdentifiedTokenTuples() == null || 
            postTokens.getDeIdentifiedTokenTuples().isEmpty()) {
            return Optional.of("deIdentifiedTokenTuples cannot be empty");
        }
        return Optional.empty();
    }

    private CompletableFuture<TrackingStatus> processValidRequest(
            String trackingId, 
            PostTokensV2 postTokens,
            String callerId,
            String receivedTimestamp,
            HttpServletRequest request) {
        
        return CompletableFuture.supplyAsync(() -> {
            var inputUri = Utils.getNewInputArtifactUri(trackingId);
            fileStore.writeObject(inputUri, postTokens, false);
            
            var trackingRecord = buildTrackingRecord(
                trackingId, 
                postTokens, 
                callerId, 
                receivedTimestamp, 
                request, 
                inputUri
            );
            
            trackingStore.insertTrackingRecord(trackingRecord);
            producer.sendNotification(
                new Notification(trackingId, trackingRecord.getVersion(), inputUri),
                trackingRecord.getTimeToWriteInputToFileStore()
            );
            
            return new TrackingStatus(trackingId, null, null);
        });
    }

    private TrackingRecord buildTrackingRecord(
            String trackingId,
            PostTokensV2 postTokens,
            String callerId,
            String receivedTimestamp,
            HttpServletRequest request,
            String inputUri) {
        
        return new TrackingRecord.Builder(trackingId)
            .setTokenCountReceived(postTokens.getDeIdentifiedTokenTuples().size())
            .setStatus(NOT_YET_STARTED.toString())
            .setCallerId(callerId)
            .setVersion(Utils.VER_V2)
            .setRequestUri(request.getRequestURI())
            .setProducerUri(ServletUriComponentsBuilder.fromContextPath(request).build().toUriString())
            .setInputArtifactUri(inputUri)
            .setReceivedTimestamp(receivedTimestamp)
            .build();
    }

    private Optional<TrackingRecord> fetchTrackingRecord(String trackingId, int retries) {
        try {
            var record = trackingStore.getTrackingRecord(trackingId);
            return (record == null || record.getTrackingId() == null) && retries > 0
                ? fetchTrackingRecord(trackingId, retries - 1)
                : Optional.ofNullable(record);
        } catch (IOException e) {
            log.error("Error fetching tracking record: {}", trackingId, e);
            return Optional.empty();
        }
    }

    private Object processTrackingRecord(TrackingRecord record) {
        if (record.getStatus().equals(COMPLETED_SUCCESSFULLY.toString())) {
            try {
                var content = fileStore.readObject(record.getOutputArtifactUri());
                return ResponseEntity.ok()
                    .header("Content-Encoding", "gzip")
                    .body(content);
            } catch (IOException e) {
                log.error("Error reading file store: {}", record.getTrackingId(), e);
                return new TrackingStatus(
                    record.getTrackingId(), 
                    ERRORED.toString(), 
                    "Failed to fetch result"
                );
            }
        }
        return new TrackingStatus(
            record.getTrackingId(),
            record.getStatus(),
            record.getErrorDescription()
        );
    }

    // ========== Utility Methods ========== //

    private static String sanitize(String input) {
        return input.replace("\n", "");
    }

    private static String getAbstractPath(String servletPath) {
        var matcher = PATH_PATTERN.matcher(servletPath);
        return matcher.find() ? matcher.group(1) : servletPath;
    }

    private static boolean validateCallerId(String callerId) {
        return callerId != null && VALID_CALLER_IDS.contains(callerId);
    }

    private static String getStatus(Object response) {
        return response instanceof TrackingStatus status 
            ? status.getStatus() != null ? status.getStatus() : COMPLETED_SUCCESSFULLY.toString()
            : ERRORED.toString();
    }

    // ========== Exception Handling ========== //

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<TrackingStatus> handleInvalidRequest(InvalidRequestException ex) {
        return ResponseEntity.badRequest()
            .body(new TrackingStatus(null, INVALID.toString(), ex.getMessage()));
    }

    public static final class InvalidRequestException extends RuntimeException {
        public InvalidRequestException(String message) {
            super(message);
        }
    }
}

===========================================================cgt====================================================

package com.optum.pure.service;

import com.fasterxml.jackson.core.JsonParseException;
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
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.time.Clock;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
@Log4j2
public class PUREServiceController {

    private static final String ERROR_MSG = "Unable to process the request";
    private static final String EMPTY_REQUEST_BODY_ERR_MSG = "Request body is empty";
    private static final String INVALID_ERR_MSG = "Invalid Request";
    private static final String INVALID_TRACKING_ID = "Invalid trackingId";
    private static final String CORRELATION_ID_HEADER = "optum-cid-ext";
    private static final List<String> TOKEN_TYPES = List.of(ConfigurationManager.get("VALID_TOKEN_TYPES").split(","));
    private static final Set<String> VALID_CALLER_IDS = Set.of(ConfigurationManager.get("VALID_CALLERID").split(","));
    private static final int GET_TRACKING_RECORD_RETRY = 2;
    private final TrackingStore trackingStore;
    private final FileStore fileStore;
    private final LogStore logStore;
    private final Producer producer;
    private final Clock clock = Clock.systemDefaultZone();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping(value = "/claims-enrollments/v2/{tracking-id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getClaimsEnrollments(@PathVariable("tracking-id") String trackingId,
                                                  HttpServletRequest request,
                                                  @RequestHeader("Caller-Id") String callerId) {
        final var stopWatch = new org.elasticsearch.common.StopWatch().start();
        final var correlationId = request.getHeader(CORRELATION_ID_HEADER);
        Object response;

        try {
            if (!isValidCallerId(callerId)) {
                response = buildCallerIdValidationResponse(callerId);
            } else {
                try {
                    var trackingRecord = fetchTrackingRecord(trackingId, GET_TRACKING_RECORD_RETRY);
                    if (trackingRecord != null && trackingRecord.getTrackingId() != null) {
                        response = buildResponse(trackingRecord);
                        log.debug("claims-enrollments API - Response fetched for trackingId - {}", trackingId.strip());
                    } else {
                        response = new TrackingStatus(null, StatusEnum.INVALID.toString(), INVALID_TRACKING_ID);
                        log.error("Invalid trackingId - {}", trackingId.strip());
                    }
                } catch (Exception e) {
                    log.error("claims-enrollments API - Exception occurred while fetching response for trackingId -> {}",
                            trackingId.strip(), e);
                    response = new TrackingStatus(null, StatusEnum.ERRORED.toString(), ERROR_MSG);
                }
            }
        } finally {
            insertLogRecord(getAbstractPath(request.getServletPath()), trackingId, correlationId,
                    callerId, stopWatch, getStatus(response));
        }
        return ResponseEntity.ok(response);
    }

    private TrackingRecord fetchTrackingRecord(String trackingId, int retries) throws IOException {
        var trackingRecord = trackingStore.getTrackingRecord(trackingId);
        if ((trackingRecord == null || trackingRecord.getTrackingId() == null) && retries > 0) {
            return fetchTrackingRecord(trackingId, retries - 1);
        }
        return trackingRecord;
    }

    private Object buildResponse(TrackingRecord trackingRecord) throws IOException {
        if (StatusEnum.COMPLETED_SUCCESSFULLY.toString().equals(trackingRecord.getStatus())) {
            var stopWatch = new org.elasticsearch.common.StopWatch().start();
            Object response;
            try {
                response = fileStore.readObject(trackingRecord.getOutputArtifactUri());
            } catch (IOException e) {
                log.error("claims-enrollments API - Failed to fetch result from FileStore for trackingId - {}",
                        trackingRecord.getTrackingId());
                throw e;
            } finally {
                stopWatch.stop();
                trackingStore.updateRecord(trackingRecord.getTrackingId(),
                        List.of("timeToReadOutputFromFileStore"),
                        List.of(stopWatch.totalTime().getMillis()));
            }
            return ResponseEntity.ok().header("Content-Encoding", "gzip").body(response);
        } else {
            var trackingStatus = new TrackingStatus(trackingRecord.getTrackingId(), trackingRecord.getStatus());
            trackingStatus.setErrorDescription(trackingRecord.getErrorDescription());
            return trackingStatus;
        }
    }

    @PostMapping(value = "/deidentified-tokens/v2", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TrackingStatus> submitDeidentifiedTokensV2(@RequestBody String requestObject,
                                                                     HttpServletRequest request,
                                                                     @RequestHeader("Caller-Id") String callerId) {
        final var totalTimeStopWatch = new org.elasticsearch.common.StopWatch().start();
        TrackingStatus response;
        final var receivedTimestamp = Utils.getCurrentTimestamp();
        final var trackingId = Utils.generateTrackingId();
        final var correlationId = request.getHeader(CORRELATION_ID_HEADER);
        log.debug("TrackingId generated for request - {}", trackingId.strip());

        try {
            var postTokensV2 = objectMapper.readValue(requestObject, PostTokensV2.class);
            if (!isValidCallerId(callerId)) {
                response = buildCallerIdValidationResponse(callerId);
            } else {
                var validation = validateRequestV2(postTokensV2);
                if (!validation.isEmpty()) {
                    response = buildRequestValidationResponse(validation);
                } else {
                    log.debug("Request validation successful for trackingId - {}", trackingId.strip());
                    final var version = Utils.VER_V2;
                    final var tokenCountReceived = postTokensV2.getDeIdentifiedTokenTuples().size();

                    processSubmitTokens(trackingId, postTokensV2, version, tokenCountReceived, callerId, receivedTimestamp, request);

                    response = new TrackingStatus(trackingId, null, null);
                }
            }
        } catch (JsonMappingException | JsonParseException e) {
            log.error("Failed to Map Request Object to PostTokensV2", e);
            response = new TrackingStatus(null, StatusEnum.INVALID.toString(), INVALID_ERR_MSG);
        } catch (Exception e) {
            handleProcessingException(trackingId);
            log.error("Error while processing the request {}", trackingId.strip(), e);
            response = new TrackingStatus(null, StatusEnum.ERRORED.toString(), ERROR_MSG);
        } finally {
            insertLogRecord(request.getServletPath(), trackingId, correlationId, callerId, totalTimeStopWatch,
                    getStatus(response));
        }
        return ResponseEntity.ok(response);
    }

    private void processSubmitTokens(String trackingId, Object postTokens, String version, int tokenCount,
                                     String callerId, String receivedTimestamp, HttpServletRequest request) throws Exception {
        final var requestURI = request.getRequestURI();
        final var producerUri = ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        final var stopWatch = new org.elasticsearch.common.StopWatch().start();
        final var esStopWatch = new org.elasticsearch.common.StopWatch();
        final var inputArtifactUri = Utils.getNewInputArtifactUri(trackingId);

        fileStore.writeObject(inputArtifactUri, postTokens, false);
        stopWatch.stop();

        log.debug("Request stored in file store for trackingId - {}", trackingId.strip());

        final var trackingRecord = new TrackingRecord.Builder(trackingId)
                .setTokenCountReceived(tokenCount)
                .setStatus(StatusEnum.NOT_YET_STARTED.toString())
                .setCallerId(callerId)
                .setVersion(version)
                .setRequestUri(requestURI)
                .setProducerUri(producerUri)
                .setInputArtifactUri(inputArtifactUri)
                .setReceivedTimestamp(receivedTimestamp)
                .setTimeToWriteInputToFileStore(stopWatch.totalTime().getMillis()).build();

        esStopWatch.start();
        trackingStore.insertTrackingRecord(trackingRecord);
        esStopWatch.stop();

        emitNotificationAsync(trackingRecord, esStopWatch.totalTime().getMillis());
    }

    /**
     * Asynchronously emits a notification after tracking record is inserted.
     */
    private void emitNotificationAsync(TrackingRecord trackingRecord, long timeToWriteTrackingRecord) {
        final var notification = new Notification(trackingRecord.getTrackingId(),
                trackingRecord.getVersion(), trackingRecord.getInputArtifactUri());

        producer.sendNotification(notification, timeToWriteTrackingRecord)
                .thenRun(() -> log.debug("Notification sent successfully for trackingId: {}", trackingRecord.getTrackingId()))
                .exceptionally(ex -> {
                    log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}", trackingRecord.getTrackingId(), ex);
                    return null;
                });
    }

    /**
     * Handles status update in case of processing exception.
     */
    private void handleProcessingException(String trackingId) {
        try {
            final var trackingRecord = trackingStore.getTrackingRecord(trackingId);
            if (trackingRecord != null && trackingRecord.getTrackingId() != null && !trackingRecord.getTrackingId().isEmpty()) {
                trackingStore.updateRecord(trackingId, List.of("status", "errorDescription"),
                        List.of(StatusEnum.ERRORED.toString(), "Internal error occurred while processing request"));
            }
        } catch (IOException e) {
            log.error("deidentified-tokens API - Error while updating status to ERRORED in tracking store for trackingId: {}",
                    trackingId.strip(), e);
        }
    }

    private boolean isValidCallerId(String callerId) {
        return StringUtils.hasText(callerId) && VALID_CALLER_IDS.contains(callerId.trim());
    }

    private String validateRequestV2(PostTokensV2 postTokensV2) {
        if (postTokensV2 == null) return EMPTY_REQUEST_BODY_ERR_MSG;
        if (postTokensV2.getDeIdentifiedTokenTuples() == null || postTokensV2.getDeIdentifiedTokenTuples().isEmpty()) {
            return "deIdentifiedTokenTuples";
        }
        for (var tokenTuple : postTokensV2.getDeIdentifiedTokenTuples()) {
            if (tokenTuple.getTokenType1() == null || tokenTuple.getTokenType2() == null ||
                tokenTuple.getTokenType1().isEmpty() || tokenTuple.getTokenType2().isEmpty()) {
                return "Token(s) in a Tuple cannot be null/empty";
            }
        }
        return "";
    }

    private String getStatus(Object response) {
        if (response instanceof TrackingStatus trackingStatus && trackingStatus.getStatus() != null) {
            return trackingStatus.getStatus();
        } else if (response != null) {
            return StatusEnum.COMPLETED_SUCCESSFULLY.toString();
        }
        return StatusEnum.ERRORED.toString();
    }

    private void insertLogRecord(String serviceName, String trackingId, String correlationId, String callerId,
                                org.elasticsearch.common.StopWatch stopWatch, String status) {
        stopWatch.stop();
        var logRecord = new LogRecord(trackingId, correlationId, callerId, serviceName, status,
                Utils.getCurrentTimestamp(), stopWatch.totalTime().getMillis());
        try {
            logStore.insertLogRecord(logRecord);
        } catch (IOException e) {
            log.error("{} - Failed to insert log record into log store -> {}", serviceName.strip(), logRecord, e);
        }
    }

    private TrackingStatus buildCallerIdValidationResponse(String callerId) {
        var validationResponse = "Invalid Caller-Id - " + callerId;
        log.error("Caller-Id validation failed: {}", validationResponse.strip());
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    private TrackingStatus buildRequestValidationResponse(String validationResponse) {
        var errorMsg = "Invalid/Missing values - " + validationResponse;
        log.error("Input payload validation failed: {}", errorMsg.strip());
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), errorMsg);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    private ResponseEntity<TrackingStatus> handleMissingRequestBody(Exception ex) {
        return ResponseEntity.badRequest().body(
                new TrackingStatus(null, StatusEnum.INVALID.toString(), EMPTY_REQUEST_BODY_ERR_MSG)
        );
    }

    private String getAbstractPath(String path) {
        var matcher = Pattern.compile("(.*)/").matcher(path);
        return matcher.find() ? matcher.group(1) : path;
    }
}
