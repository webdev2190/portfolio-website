org.elasticsearch.ElasticsearchStatusException: Elasticsearch exception [type=security_exception, reason=unable to authenticate user [ohhldeves] for REST request [/pure_log_store_stage/_doc?timeout=1m]]
	at org.elasticsearch.rest.BytesRestResponse.errorFromXContent(BytesRestResponse.java:178) ~[elasticsearch-7.17.18.jar:7.17.18]
	at org.elasticsearch.client.RestHighLevelClient.parseEntity(RestHighLevelClient.java:2484) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
	at org.elasticsearch.client.RestHighLevelClient.parseResponseException(RestHighLevelClient.java:2461) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
	at org.elasticsearch.client.RestHighLevelClient.internalPerformRequest(RestHighLevelClient.java:2184) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
	at org.elasticsearch.client.RestHighLevelClient.performRequest(RestHighLevelClient.java:2137) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
	at org.elasticsearch.client.RestHighLevelClient.performRequestAndParseEntity(RestHighLevelClient.java:2105) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
	at org.elasticsearch.client.RestHighLevelClient.index(RestHighLevelClient.java:1241) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
	at com.optum.pure.logstore.impl.ESLogStore.insertLogRecord(ESLogStore.java:37) ~[ohhl-pure-shared-lib-1.0-SNAPSHOT.jar:na]
	at com.optum.pure.service.PUREServiceController.insertLogRecord(PUREServiceController.java:397) ~[main/:na]
	at com.optum.pure.service.PUREServiceController.submitDeidentifiedTokensV2(PUREServiceController.java:203) ~[main/:na]
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Method.java:580) ~[na:na]
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:261) ~[spring-web-6.1.3.jar:6.1.3]
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:189) ~[spring-web-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:917) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:829) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:914) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:547) ~[jakarta.servlet-api-6.0.0.jar:6.0.0]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.3.jar:6.1.3]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:614) ~[jakarta.servlet-api-6.0.0.jar:6.0.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.3.jar:6.1.3]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.3.jar:6.1.3]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.3.jar:6.1.3]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.3.jar:6.1.3]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.springframework.web.filter.ServerHttpObservationFilter.doFilterInternal(ServerHttpObservationFilter.java:109) ~[spring-web-6.1.3.jar:6.1.3]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.3.jar:6.1.3]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.3.jar:6.1.3]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.3.jar:6.1.3]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:340) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1744) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) ~[tomcat-embed-core-10.1.18.jar:10.1.18]
	at java.base/java.lang.Thread.run(Thread.java:1583) ~[na:na]
	Suppressed: org.elasticsearch.client.ResponseException: method [POST], host [http://928ffca9127b43c4b1272389d568ad58.ece.optum.com:9200], URI [/pure_log_store_stage/_doc?timeout=1m], status line [HTTP/1.1 401 Unauthorized]
{"error":{"root_cause":[{"type":"security_exception","reason":"unable to authenticate user [ohhldeves] for REST request [/pure_log_store_stage/_doc?timeout=1m]","header":{"WWW-Authenticate":["Basic realm=\"security\", charset=\"UTF-8\"","Bearer realm=\"security\"","ApiKey"]}}],"type":"security_exception","reason":"unable to authenticate user [ohhldeves] for REST request [/pure_log_store_stage/_doc?timeout=1m]","header":{"WWW-Authenticate":["Basic realm=\"security\", charset=\"UTF-8\"","Bearer realm=\"security\"","ApiKey"]}},"status":401}
		at org.elasticsearch.client.RestClient.convertResponse(RestClient.java:347) ~[elasticsearch-rest-client-7.17.18.jar:7.17.18]
		at org.elasticsearch.client.RestClient.performRequest(RestClient.java:313) ~[elasticsearch-rest-client-7.17.18.jar:7.17.18]
		at org.elasticsearch.client.RestClient.performRequest(RestClient.java:288) ~[elasticsearch-rest-client-7.17.18.jar:7.17.18]
		at org.elasticsearch.client.RestHighLevelClient.performClientRequest(RestHighLevelClient.java:2699) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]
		at org.elasticsearch.client.RestHighLevelClient.internalPerformRequest(RestHighLevelClient.java:2171) ~[elasticsearch-rest-high-level-client-7.17.18.jar:7.17.18]



  // This is a Java class for a REST controller that handles requests related to claims enrollments and de-identified tokens.
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
//@Log4j2
public final class PUREServiceController {

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

    /**This is a constructor for the PUREServiceController class.
     * It takes four dependencies (TrackingStore, FileStore, LogStore, and Producer)
     * as parameters and assigns them to the class's final fields.*/

//    public PUREServiceController(
//            TrackingStore trackingStore,
//            FileStore fileStore,
//            LogStore logStore,
//            Producer producer
//    ) {
//        this.trackingStore = trackingStore;
//        this.fileStore = fileStore;
//        this.logStore = logStore;
//        this.producer = producer;
//
//        /**The class has final fields, which must be initialized when the object is created.
//         This constructor enables constructor-based dependency injection in Spring, allowing
//         the framework to inject the required beans when creating the controller.*/
//    }


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
//        } catch (Exception e) {
//            log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}", trackingRecord.getTrackingId(), e);
//            throw e;
//        }
        } catch (Exception e) {
            String id = (trackingRecord != null) ? trackingRecord.getTrackingId() : "null";
            log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}", id, e);
//            throw e;
            throw new Exception("Error occurred while emitting notification for trackingId: " + id, e);
        }

        log.debug("Notification sent successfully for request with trackingId: {}", trackingRecord.getTrackingId());
    }

//    private void processSubmitTokens(String trackingId, Object postTokens, String version, int tokenCount,
//                                     String callerId, String receivedTimestamp, HttpServletRequest request)
//            throws Exception {
//
//        String requestURI = request.getRequestURI();
//        String producerUri = ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
//        StopWatch stopWatch = new StopWatch();
//        stopWatch.start();
//        StopWatch esStopWatch = new StopWatch();
//        String inputArtifactUri = Utils.getNewInputArtifactUri(trackingId);
//        try {
//            fileStore.writeObject(inputArtifactUri, postTokens, false);
//        } catch (Exception e) {
//            log.error("Failed to write input artifact to the FileStore for trackingId -> {}", trackingId.replace("\n", ""), e);
//            throw e;
//        }
//        stopWatch.stop();
//        log.debug("Request stored in file store for trackingId - {}", trackingId.replace("\n", ""));
//        TrackingRecord trackingRecord = new TrackingRecord.Builder(trackingId)
//                .setTokenCountReceived(tokenCount)
//                .setStatus(StatusEnum.NOT_YET_STARTED.toString())
//                .setCallerId(callerId)
//                .setVersion(version)
//                .setRequestUri(requestURI)
//                .setProducerUri(producerUri)
//                .setInputArtifactUri(inputArtifactUri)
//                .setReceivedTimestamp(receivedTimestamp)
//                .setTimeToWriteInputToFileStore(stopWatch.getTotalTimeMillis()).build();
//
//        esStopWatch.start();
//        insertTrackingRecord(trackingRecord);
//        esStopWatch.stop();
//
//        emitNotification(trackingRecord, esStopWatch.getTotalTimeMillis());
//    }


    private void processSubmitTokens(String trackingId, Object postTokens, String version, int tokenCount,
                                     String callerId, String receivedTimestamp, HttpServletRequest request)
            throws Exception {
        String requestURI = request.getRequestURI();
        String producerUri = ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        StopWatch esStopWatch = new StopWatch();
        String inputArtifactUri = Utils.getNewInputArtifactUri(trackingId);
//        try {
//            fileStore.writeObject(inputArtifactUri, postTokens, false);
//        } catch (InterruptedException e) {
//            Thread.currentThread().interrupt(); // Restore interrupt status
//            log.error("Thread interrupted while writing input artifact for trackingId -> {}", trackingId.replace("\n", ""), e);
//            throw e;
//        } catch (Exception e) {
//            log.error("Failed to write input artifact to the FileStore for trackingId -> {}", trackingId.replace("\n", ""), e);
//            throw e;
//        }


        try {
            fileStore.writeObject(inputArtifactUri, postTokens, false);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Thread interrupted while writing input artifact for trackingId -> {}", trackingId.replace("\n", ""), e);
            // Optionally, return or handle gracefully instead of throw e;
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
//    private boolean validateCallerId(String callerId) {
//        return !StringUtils.isEmpty(callerId) && callerId.trim().length() > 0 && validCallerIds.contains(callerId);
//    }

    private boolean validateCallerId(String callerId) {
        return StringUtils.hasText(callerId) && validCallerIds.contains(callerId);
    }//The method returns true only if both conditions are met, meaning the callerId is non-empty and authorized.


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


		... 58 common frames omitted
