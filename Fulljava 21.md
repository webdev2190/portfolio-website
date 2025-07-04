Folder Structure (as reference)

src/
 └── main/
     └── java/
         └── com/optum/pure/
             ├── Application.java
             ├── config/PureConfig.java
             ├── notificationstore/
             │      ├── Producer.java
             │      ├── config/KafkaProducerConfig.java
             │      └── impl/KafkaProducer.java
             └── service/PUREServiceController.java
 └── test/
     └── java/
         └── com/optum/pure/
             ├── notificationstore/config/KafkaProducerConfigTest.java
             ├── notificationstore/impl/KafkaProducerTest.java
             └── service/PUREServiceControllerTest.java
build.gradle

==================================================================================================================

1. build.gradle

plugins {
    id 'java'
    id 'eclipse'
    id 'idea'
    id 'org.springframework.boot' version '3.2.6'
    id 'io.spring.dependency-management' version '1.1.5'
    id 'jacoco'
    id 'org.sonarqube' version '4.4.1.3373'
}

group = 'com.optum.pure'
version = '0.2.0'

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

bootJar {
    archiveBaseName.set('pure-service')
}

jar {
    enabled = false
}

repositories {
    maven {
        url 'https://repo1.uhc.com/artifactory/repoauth'
        credentials {
            username = System.getenv("DOCKER_USERNAME")
            password = System.getenv("DOCKER_PASSWORD")
        }
    }
    maven {
        url 'https://repo1.uhc.com/artifactory/libs-releases/'
    }
    mavenCentral()
}

dependencyManagement {
    imports {
        mavenBom 'com.amazonaws:aws-java-sdk-bom:1.12.743'
    }
}

dependencies {
    annotationProcessor "org.projectlombok:lombok:1.18.32"
    implementation 'org.projectlombok:lombok:1.18.32'

    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.kafka:spring-kafka:3.1.3'
    implementation 'com.amazonaws:aws-java-sdk-s3'
    implementation 'org.apache.logging.log4j:log4j-api:2.22.1'
    implementation 'org.apache.logging.log4j:log4j-core:2.22.1'
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.15'
    implementation 'org.elasticsearch:elasticsearch:7.17.15'
    implementation 'com.fasterxml.jackson.core:jackson-annotations:2.17.1'
    implementation 'com.fasterxml.jackson.core:jackson-core:2.17.1'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.1'
    implementation 'com.google.code.gson:gson:2.10.1'
    implementation 'org.json:json:20240303'
    implementation 'commons-io:commons-io:2.16.1'
    implementation 'org.yaml:snakeyaml:2.2'
    implementation 'org.xerial.snappy:snappy-java:1.1.10.5'
    implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mockito:mockito-junit-jupiter:5.2.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
}

test {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
}

2. src/main/java/com/optum/pure/Application.java

package com.optum.pure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

======================================================================================================================

3. src/main/java/com/optum/pure/config/PureConfig.java

package com.optum.pure.config;

import com.optum.pure.filestore.FileStore;
import com.optum.pure.filestore.factory.FileStoreFactory;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.logstore.factory.LogStoreFactory;
import com.optum.pure.trackingstore.TrackingStore;
import com.optum.pure.trackingstore.factory.TrackingStoreFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PureConfig {

    @Bean
    public TrackingStore trackingStore() {
        return TrackingStoreFactory.getTrackingStore();
    }

    @Bean
    public FileStore fileStore() {
        return FileStoreFactory.getFileStore();
    }

    @Bean
    public LogStore logStore() {
        return LogStoreFactory.getLogStore();
    }
}

========================================================================================================================

4. src/main/java/com/optum/pure/notificationstore/config/KafkaProducerConfig.java

package com.optum.pure.notificationstore.config;

import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.Utils;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Bean
    public Map<String, Object> producerConfig() {
        var props = new HashMap<String, Object>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ConfigurationManager.get("KAFKA_BROKERS"));
        props.put(ProducerConfig.CLIENT_ID_CONFIG, ConfigurationManager.get("CLIENT_ID"));
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, ConfigurationManager.get("PRODUCER_ACK_CONFIG"));
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG"));
        props.put("security.protocol", ConfigurationManager.get("SECURITY_PROTOCOL"));
        props.put("ssl.truststore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE"));
        props.put("ssl.truststore.password", ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD"));
        props.put("ssl.keystore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));
        props.put("ssl.keystore.password", ConfigurationManager.get("SSL_KEYSTORE_PASSWORD"));
        props.put("ssl.key.password", ConfigurationManager.get("SSL_KEY_PASSWORD"));
        return props;
    }

    @Bean
    public ProducerFactory<String, String> producerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfig());
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

5. src/main/java/com/optum/pure/notificationstore/Producer.java

package com.optum.pure.notificationstore;

import com.optum.pure.model.notification.Notification;

public interface Producer {
    void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception;
}

=======================================================================================================================

6. src/main/java/com/optum/pure/notificationstore/impl/KafkaProducer.java

package com.optum.pure.notificationstore.impl;

import com.google.gson.Gson;
import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.common.StopWatch;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaProducer implements Producer {

    private static final String TIME_TO_INSERT_TRACKING_RECORD = "timeToInsertTrackingRecord";
    private static final String TIME_TO_EMIT_NOTIFICATION = "timeToEmitNotification";
    private static final String NOTIFICATION_EMIT_TIMESTAMP = "notificationEmitTimestamp";
    private static final List<String> fieldList = List.of(TIME_TO_EMIT_NOTIFICATION,
            NOTIFICATION_EMIT_TIMESTAMP, TIME_TO_INSERT_TRACKING_RECORD);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private final Gson gson = new Gson();

    @Override
    public void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception {
        log.debug("Producer called");
        var stopWatch = new StopWatch().start();
        if (notification == null) {
            log.error("Kafka Producer - Notification is null");
            stopWatch.stop();
            throw new Exception("Kafka Producer - Notification is null");
        }
        try {
            var trackingId = notification.getTrackingId();
            var emitTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
            log.debug("Kafka Producer - Emitting notification with trackingId: {}, time: {}", trackingId, emitTimestamp);
            ListenableFuture<SendResult<String, String>> result = kafkaTemplate.send(ConfigurationManager.get("TOPIC_NAME"), trackingId, gson.toJson(notification));
            var sendResult = result.get();
            log.debug("Kafka Producer - Notification sent with key: {}, to topic: {} with partition: {} & offset: {}", trackingId,
                    sendResult.getRecordMetadata().topic(),
                    sendResult.getRecordMetadata().partition(),
                    sendResult.getRecordMetadata().offset());
            stopWatch.stop();
            long timeTakenToEmitNotification = stopWatch.totalTime().getMillis();
            List<Object> valueList = List.of(timeTakenToEmitNotification, emitTimestamp, elapsedTimeTrackingRecordInsertion);
            trackingStore.updateRecord(trackingId, fieldList, valueList);
            log.debug("[Metrics] Kafka Producer - trackingId: {}, timeTaken(ms): {}", notification.getTrackingId(), timeTakenToEmitNotification);
        } catch (Exception e) {
            log.error("Error occurred in Kafka Producer while sending notification for trackingId - {}", notification.getTrackingId(), e);
            throw e;
        }
    }
}

=============================================================================================================================

7. src/main/java/com/optum/pure/service/PUREServiceController.java

    Note: Make sure you are using jakarta.servlet.http.HttpServletRequest with Spring Boot 3.

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
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.common.StopWatch;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PUREServiceController {

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

    @GetMapping(value = {"/claims-enrollments/v2/{tracking-id}"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public Object getClaimsEnrollments(@PathVariable("tracking-id") String trackingId,
                                      HttpServletRequest request,
                                      @RequestHeader("Caller-Id") String callerId) {
        var stopWatch = new StopWatch().start();
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
            insertLogRecord(getAbstractPathfromServletPath(request.getServletPath()), trackingId, correlationId, callerId, stopWatch, getStatus(response));
        }
        return response;
    }

    private TrackingRecord fetchTrackingRecord(String trackingId, int retries) throws IOException {
        TrackingRecord trackingRecord = trackingStore.getTrackingRecord(trackingId);
        return (trackingRecord == null || trackingRecord.getTrackingId() == null) && (retries > 0) ? fetchTrackingRecord(trackingId, retries - 1) : trackingRecord;
    }

    private Object getResponse(TrackingRecord trackingRecord) throws IOException {
        if (trackingRecord.getStatus().equals(StatusEnum.COMPLETED_SUCCESSFULLY.toString())) {
            try {
                var stopWatch = new StopWatch().start();
                Object response = fileStore.readObject(trackingRecord.getOutputArtifactUri());
                stopWatch.stop();
                updateRecord(trackingRecord, stopWatch);
                return ResponseEntity.ok().header("Content-Encoding", "gzip").body(response);
            } catch (IOException e) {
                log.error("claims-enrollments API - Failed to fetch result from FileStore for trackingId - {}", trackingRecord.getTrackingId());
                throw e;
            }
        } else {
            var trackingStatus = new TrackingStatus(trackingRecord.getTrackingId(), trackingRecord.getStatus());
            trackingStatus.setErrorDescription(trackingRecord.getErrorDescription());
            return trackingStatus;
        }
    }

    private void updateRecord(TrackingRecord trackingRecord, StopWatch stopWatch) {
        try {
            trackingStore.updateRecord(trackingRecord.getTrackingId(),
                    Collections.singletonList("timeToReadOutputFromFileStore"),
                    Collections.singletonList(stopWatch.totalTime().getMillis()));
        } catch (Exception e) {
            log.error("claims-enrollments API - Failed to update TrackingStore for trackingId - {}", trackingRecord.getTrackingId(), e);
        }
    }

    @PostMapping(value = "/deidentified-tokens/v2", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public TrackingStatus submitDeidentifiedTokensV2(@RequestBody String requestObject,
                                                     HttpServletRequest request,
                                                     @RequestHeader("Caller-Id") String callerId) {
        var totalTimeStopWatch = new StopWatch().start();
        TrackingStatus response = null;
        String receivedTimestamp = Utils.getCurrentTimestamp();
        String trackingId = Utils.generateTrackingId();
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        log.debug("TrackingId generated for request - {}", trackingId.replace("\n", ""));
        try {
            var postTokensV2 = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION).readValue(requestObject, PostTokensV2.class);
            boolean validCallerId = validateCallerId(callerId);
            String requestValidationResponse = validateRequestV2(postTokensV2);
            if (!validCallerId) {
                response = buildCallerIdValidationResponse(callerId);
            } else if (!requestValidationResponse.isEmpty()) {
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
            insertLogRecord(request.getServletPath(), trackingId, correlationId, callerId, totalTimeStopWatch, getStatus(response));
        }
        return response;
    }

    private void emitNotification(TrackingRecord trackingRecord, long timeToWriteTrackingRecord) throws Exception {
        var notification = new Notification(trackingRecord.getTrackingId(), trackingRecord.getVersion(), trackingRecord.getInputArtifactUri());
        try {
            producer.sendNotification(notification, timeToWriteTrackingRecord);
        } catch (Exception e) {
            log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}", trackingRecord.getTrackingId(), e);
            throw e;
        }
        log.debug("Notification sent successfully for request with trackingId: {}", trackingRecord.getTrackingId());
    }

    private void processSubmitTokens(String trackingId, Object postTokens, String version, int tokenCount, String callerId, String receivedTimestamp, HttpServletRequest request) throws Exception {
        String requestURI = request.getRequestURI();
        String producerUri = ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        var stopWatch = new StopWatch().start();
        var esStopWatch = new StopWatch();
        String inputArtifactUri = Utils.getNewInputArtifactUri(trackingId);
        try {
            fileStore.writeObject(inputArtifactUri, postTokens, false);
        } catch (Exception e) {
            log.error("Failed to write input artifact to the FileStore for trackingId -> {}", trackingId.replace("\n", ""), e);
            throw e;
        }
        stopWatch.stop();
        log.debug("Request stored in file store for trackingId - {}", trackingId.replace("\n", ""));
        var trackingRecord = new TrackingRecord.Builder(trackingId)
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
        insertTrackingRecord(trackingRecord);
        esStopWatch.stop();

        emitNotification(trackingRecord, esStopWatch.totalTime().getMillis());
    }

    private void onException(String trackingId) {
        try {
            var trackingRecord = trackingStore.getTrackingRecord(trackingId);
            if (trackingRecord != null && trackingRecord.getTrackingId() != null && !trackingRecord.getTrackingId().isEmpty()) {
                trackingStore.updateRecord(trackingId, List.of("status", "errorDescription"),
                        List.of(StatusEnum.ERRORED.toString(), "Internal error occurred while processing request"));
            }
        } catch (IOException e) {
            log.error("deidentified-tokens API - Error while updating status to ERRORED in tracking store for trackingId: {}", trackingId.replace("\n", ""), e);
        }
    }

    private void insertTrackingRecord(TrackingRecord trackingRecord) throws IOException {
        try {
            trackingStore.insertTrackingRecord(trackingRecord);
        } catch (IOException e) {
            log.error("Failed to insert Tracking Record for Tracking Id -> {}", trackingRecord.getTrackingId(), e);
            throw e;
        }
        log.debug("Tracking record created & stored in tracking store for trackingId - {}", trackingRecord.getTrackingId());
    }

    private String validateRequestV2(PostTokensV2 postTokensV2) {
        var sbValidationFailedFields = new StringBuilder();
        if (Objects.isNull(postTokensV2)) {
            sbValidationFailedFields.append(EMPTY_REQUEST_BODY_ERR_MSG);
            return sbValidationFailedFields.toString();
        }
        if (Objects.isNull(postTokensV2.getDeIdentifiedTokenTuples()) || postTokensV2.getDeIdentifiedTokenTuples().isEmpty()) {
            sbValidationFailedFields.append("deIdentifiedTokenTuples");
        } else {
            for (TokenTuple tokenTuple : postTokensV2.getDeIdentifiedTokenTuples()) {
                if (tokenTuple == null || tokenTuple.getTokenType1() == null || tokenTuple.getTokenType2() == null ||
                        tokenTuple.getTokenType1().isEmpty() || tokenTuple.getTokenType2().isEmpty()) {
                    sbValidationFailedFields.append("Token(s) in a Tuple cannot be null/empty");
                    break;
                }
            }
        }
        return sbValidationFailedFields.toString();
    }

    private boolean validateCallerId(String callerId) {
        return !StringUtils.isEmpty(callerId) && callerId.trim().length() > 0 && validCallerIds.contains(callerId);
    }

    private String getStatus(Object response) {
        if (response instanceof TrackingStatus trackingStatus && trackingStatus.getStatus() != null) {
            return trackingStatus.getStatus();
        } else if (response != null) {
            return StatusEnum.COMPLETED_SUCCESSFULLY.toString();
        } else {
            return StatusEnum.ERRORED.toString();
        }
    }

    private void insertLogRecord(String serviceName, String trackingId, String correlationId, String callerId, StopWatch stopWatch, String status) {
        stopWatch.stop();
        var logRecord = new LogRecord(trackingId, correlationId, callerId, serviceName, status, Utils.getCurrentTimestamp(), stopWatch.totalTime().getMillis());
        try {
            logStore.insertLogRecord(logRecord);
        } catch (IOException e) {
            log.error("{} - Failed to insert log record into log store -> {}", serviceName.replace("\n", ""), logRecord, e);
        }
    }

    private TrackingStatus buildCallerIdValidationResponse(String callerId) {
        String validationResponse = "Invalid Caller-Id - " + callerId;
        log.error("deidentified-tokens API Caller-Id validation failed: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    private TrackingStatus buildRequestValidationResponse(String validationResponse) {
        validationResponse = "Invalid/Missing values - " + validationResponse;
        log.error("deidentified-tokens API input payload validation failed for fields: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    private TrackingStatus handleMissingRequestBody(Exception ex) {
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), EMPTY_REQUEST_BODY_ERR_MSG);
    }

    private String getAbstractPathfromServletPath(String path) {
        var pattern = Pattern.compile("(.*)/");
        var matcher = pattern.matcher(path);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return path;
    }
}
=====================================================================================================================
8. Test Classes (src/test/java/...)

    (You may have to adjust package names or imports depending on your actual project structure.)

notificationstore/config/KafkaProducerConfigTest.java

package com.optum.pure.notificationstore.config;

import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.Utils;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KafkaProducerConfigTest {

    @Spy
    @InjectMocks
    KafkaProducerConfig notificationProducerConfig;

    @BeforeEach
    void setUp() {}

    @Test
    void getProducerConfigTest() {
        List<String> properties = Arrays.asList(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                ProducerConfig.CLIENT_ID_CONFIG,
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                ProducerConfig.ACKS_CONFIG,
                ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG,
                "security.protocol",
                "ssl.truststore.location",
                "ssl.truststore.password",
                "ssl.keystore.location",
                "ssl.keystore.password",
                "ssl.key.password"
        );
        Map<String, Object> config = notificationProducerConfig.producerConfig();
        properties.forEach(property -> assertTrue(config.containsKey(property)));
    }

    @Test
    void producerFactoryTest() {
        KafkaProducerConfig config = spy(new KafkaProducerConfig());
        doReturn(getProps()).when(config).producerConfig();

        ProducerFactory<String, String> defaultKafkaProducerFactory = config.producerFactory();
        assertEquals(DefaultKafkaProducerFactory.class, defaultKafkaProducerFactory.getClass());
    }

    @Test
    void kafkaTemplateTest() {
        KafkaProducerConfig config = spy(new KafkaProducerConfig());
        doReturn(getProps()).when(config).producerConfig();

        KafkaTemplate<String, String> kafkaTemplate = config.kafkaTemplate();
        assertEquals(KafkaTemplate.class, kafkaTemplate.getClass());
    }

    private Map<String, Object> getProps() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ConfigurationManager.get("KAFKA_BROKERS"));
        props.put(ProducerConfig.CLIENT_ID_CONFIG, ConfigurationManager.get("CLIENT_ID"));
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, ConfigurationManager.get("PRODUCER_ACK_CONFIG"));
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG"));
        props.put("security.protocol", ConfigurationManager.get("SECURITY_PROTOCOL"));
        props.put("ssl.truststore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE"));
        props.put("ssl.keystore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));
        return props;
    }
}
==================================================================================================================
notificationstore/impl/KafkaProducerTest.java

package com.optum.pure.notificationstore.impl;

import com.optum.pure.model.notification.Notification;
import com.optum.pure.trackingstore.TrackingStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KafkaProducerTest {

    @Mock
    private KafkaTemplate<String, String> mockKafkaTemplate;
    @Mock
    private TrackingStore mockTrackingStore;

    @InjectMocks
    private KafkaProducer notificationStore;

    private Notification notification;
    private long timeToInsertTrackingRecord = 11L;

    @BeforeEach
    void setup() {
        notification = new Notification("12345", "pure/test", "v1");
    }

    @Test
    void sendNotificationFailure_NullNotification() {
        Exception exception = assertThrows(Exception.class,
                () -> notificationStore.sendNotification(null, timeToInsertTrackingRecord));
        assertEquals("Kafka Producer - Notification is null", exception.getMessage());
    }

    @Test
    void sendNotificationSuccess() throws Exception {
        SendResult<String, String> sendResult = mock(SendResult.class);
        when(sendResult.getRecordMetadata()).thenReturn(null);

        ListenableFuture<SendResult<String, String>> listenableFuture = mock(ListenableFuture.class);
        when(listenableFuture.get()).thenReturn(sendResult);

        when(mockKafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(listenableFuture);

        Notification testNotification = new Notification("12345", "test", "v1");
        assertDoesNotThrow(() -> notificationStore.sendNotification(testNotification, timeToInsertTrackingRecord));
    }

    @Test
    void sendNotificationFailure_KafkaError() throws Exception {
        when(mockKafkaTemplate.send(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Kafka error"));

        Notification testNotification = new Notification("12345", "test", "v1");
        assertThrows(Exception.class, () -> notificationStore.sendNotification(testNotification, timeToInsertTrackingRecord));
    }
}
========================================================================================================================
service/PUREServiceControllerTest.java

package com.optum.pure.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.optum.pure.common.StatusEnum;
import com.optum.pure.filestore.FileStore;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.model.requestobjects.common.TrackingRecord;
import com.optum.pure.model.requestobjects.v2.PostTokensV2;
import com.optum.pure.model.requestobjects.v2.TokenTuple;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class)
class PUREServiceControllerTest {

    private static final String ERROR_MSG = "Unable to process the request";
    private static final String EMPTY_REQUEST_BODY_ERR_MSG = "Request body is empty";
    private static final String INVALID_TRACKING_ID = "Invalid trackingId";
    private static final String CALLER_ID = "devut";

    @InjectMocks
    PUREServiceController pureServiceController;

    @Mock
    private TrackingStore mockTrackingStore;
    @Mock
    private FileStore mockFileStore;
    @Mock
    private LogStore mockLogStore;
    @Mock
    private Producer mockNotificationStore;

    private TrackingRecord trackingRecord;
    private PostTokensV2 postTokensV2;
    private MockHttpServletRequest mockHttpServletRequest;

    @BeforeEach
    void setUp() throws IOException {
        postTokensV2 = new PostTokensV2();
        trackingRecord = new TrackingRecord();
        trackingRecord.setTrackingId("test-tracking-id");
        trackingRecord.setStatus(StatusEnum.IN_PROGRESS.toString());
        mockHttpServletRequest = new MockHttpServletRequest();
        mockHttpServletRequest.setScheme("http");
        mockHttpServletRequest.setServerName("localhost");
        mockHttpServletRequest.setServerPort(80);
        mockHttpServletRequest.setContextPath("/requestData");
        Mockito.doNothing().when(mockLogStore).insertLogRecord(any());
        postTokensV2.setDeIdentifiedTokenTuples(Arrays.asList(new TokenTuple("tt1", "tt2"), new TokenTuple("test-token1", "test-token2")));
    }

    @Test
    void getClaimsEnrollmentsTest_Success() throws Exception {
        Mockito.when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        Object result = pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNotNull(result);
    }

    @Test
    void getClaimsEnrollmentsTest_InvalidCallerId() throws Exception {
        Mockito.when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus result = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, "");
        assertEquals("INVALID", result.getStatus());
    }

    @Test
    void getClaimsEnrollmentsTest_InvalidTrackingId() throws Exception {
        trackingRecord.setTrackingId(null);
        Mockito.when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus result = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertEquals("INVALID", result.getStatus());
        assertEquals(INVALID_TRACKING_ID, result.getErrorDescription());
    }

    @Test
    void getClaimsEnrollmentsTest_TrackingStoreFail() throws Exception {
        Mockito.when(mockTrackingStore.getTrackingRecord(anyString())).thenThrow(new IOException("test error"));
        TrackingStatus result = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertEquals("ERRORED", result.getStatus());
        assertEquals(ERROR_MSG, result.getErrorDescription());
    }

    @Test
    void getClaimsEnrollmentsTest_StatusCompleted() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        Mockito.when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        Mockito.when(mockFileStore.readObject(anyString()))
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(new Object()))));
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    void submitTokensTestV2_Success() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        Mockito.doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());

        String requestBody = new Gson().toJson(postTokensV2);
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(requestBody, mockHttpServletRequest, CALLER_ID);
        assertNotNull(status.getTrackingId());
        assertNull(status.getStatus());
        assertNull(status.getErrorDescription());
    }

    @Test
    void submitTokensTestV2_EmptyRequest() throws Exception {
        String requestBody = new Gson().toJson(null);
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(requestBody, mockHttpServletRequest, CALLER_ID);
        assertEquals("INVALID", status.getStatus());
        assertEquals("Invalid/Missing values - " + EMPTY_REQUEST_BODY_ERR_MSG, status.getErrorDescription());
    }

    @Test
    void submitTokensTestV2_EmptyCallerId() throws Exception {
        String requestBody = new Gson().toJson(postTokensV2);
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(requestBody, mockHttpServletRequest, "");
        assertEquals("INVALID", status.getStatus());
        assertEquals("Invalid Caller-Id - ", status.getErrorDescription());
    }

    @Test
    void submitTokensTestV2_InvalidTokenTuple() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(Collections.singletonList(new TokenTuple("abc", "")));
        String requestBody = new Gson().toJson(postTokensV2);
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(requestBody, mockHttpServletRequest, CALLER_ID);
        assertEquals("INVALID", status.getStatus());
        assertEquals("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty", status.getErrorDescription());
    }

    @Test
    void submitTokensTestV2_TrackingStoreInsertFail() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        Mockito.doThrow(new IOException("test-exception")).when(mockTrackingStore).insertTrackingRecord(any());
        String requestBody = new Gson().toJson(postTokensV2);
        TrackingStatus status = pureServiceController.submitDeidentifiedTokensV2(requestBody, mockHttpServletRequest, CALLER_ID);
        assertEquals("ERRORED", status.getStatus());
        assertEquals(ERROR_MSG, status.getErrorDescription());
    }
}
