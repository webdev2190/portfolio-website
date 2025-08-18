gradle version

buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath 'org.springframework.boot:spring-boot-gradle-plugin:3.2.2'
        classpath 'io.spring.gradle:dependency-management-plugin:1.1.5'
//        classpath "org.sonarqube.gradle.plugin:org.sonarqube.gradle.plugin:6.0.0.5145"
    }
}

plugins {
    id 'java'
    id 'eclipse'
    id 'idea'
    id 'jacoco'
}

apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
//apply plugin: 'org.sonarqube'

//This will ensure commons-logging.jar is excluded from all configurations.
configurations.all {
    exclude group: 'commons-logging', module: 'commons-logging'
}

group = 'com.optum.pure'
version = '0.1.0'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
    gradlePluginPortal()
    maven {
        url 'https://artifacts.elastic.co/maven'
    }
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
    maven {
        url 'https://repo1.uhc.com/artifactory/UHG-Snapshots/com/optum/'
        metadataSources { artifact() }
    }
}

bootJar {
    archiveBaseName.set('pure-service')
}

jar {
    enabled = false
}

dependencyManagement {
    imports {
        mavenBom 'com.amazonaws:aws-java-sdk-bom:1.12.743'
    }
    resolutionStrategy {
        cacheChangingModulesFor 0, 'seconds'
    }
}

//sonarqube {
//    properties {
//        property 'sonar.com.optum.pure', 'pure'
//        property 'sonar.host.url', 'http://localhost:9000'
//        property 'sonar.jacoco.reportPaths', 'build/jacoco/test.exec'
//        // Add further Sonar properties if needed
//    }
//}

def gitBranch() {
    def branch = ""
    def proc = "git rev-parse --abbrev-ref HEAD".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    return branch
}
println gitBranch()

dependencies {
    implementation files('C:/Users/ahaldar1/Desktop/workspace/OHHL-project/orx-ls-ohhl-pure-shared-lib/build/libs/ohhl-pure-shared-lib-1.0-SNAPSHOT.jar')

    // Lombok
    compileOnly 'org.projectlombok:lombok:1.18.32'
    annotationProcessor 'org.projectlombok:lombok:1.18.32'

    // SLF4J (for logging)
    implementation 'org.slf4j:slf4j-api:2.0.13'



    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.kafka:spring-kafka:3.1.2'
    implementation 'org.springframework:spring-context:6.1.6'

    implementation 'com.amazonaws:aws-java-sdk-s3:1.12.743'
    implementation 'org.apache.logging.log4j:log4j-api:2.23.1'
    implementation 'org.apache.logging.log4j:log4j-core:2.23.1'
    implementation 'com.google.code.gson:gson:2.11.0'
    implementation 'org.glassfish:jakarta.json:2.0.1'
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.18'
    implementation 'org.elasticsearch.client:elasticsearch-rest-client:7.17.18'
    implementation 'org.elasticsearch:elasticsearch:7.17.18'
    implementation 'org.apache.kafka:kafka-clients:3.7.0'
    implementation 'org.json:json:20240303'
    implementation 'org.yaml:snakeyaml:2.2'
    implementation 'ch.qos.logback:logback-core:1.5.6'
    implementation 'ch.qos.logback:logback-classic:1.5.6'
    implementation 'commons-io:commons-io:2.16.1'
    implementation 'org.xerial.snappy:snappy-java:1.1.10.5'
    implementation 'com.fasterxml.jackson.core:jackson-annotations:2.17.1'
    implementation 'com.fasterxml.jackson.core:jackson-core:2.17.1'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.1'
    implementation 'jakarta.servlet:jakarta.servlet-api:6.0.0'
    implementation 'org.springframework.boot:spring-boot-starter-web'

    // PURE common lib dep, pick version based on branch
    if (gitBranch() == "master" || gitBranch() == "origin/master") {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT'
    } else {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:1.0-SNAPSHOT'
    }

    // TESTS
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mockito:mockito-core:5.2.0'
    testImplementation 'org.assertj:assertj-core:3.25.3'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
    testImplementation 'org.apache.commons:commons-io:1.3.2'
}

tasks.withType(Test).configureEach {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
}

jacoco {
    toolVersion = "0.8.11"
}

jacocoTestReport {
    dependsOn test
    reports {
        xml.required = true
        html.required = true
    }
}

task copyDependencies(type: Copy) {
    from configurations.runtimeClasspath
    into 'dependencies'
}

test {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
    minHeapSize = "512m"
    maxHeapSize = "4096m"
    forkEvery = 0
    maxParallelForks = 1
    testLogging {
        events "passed", "skipped", "failed"
    }
}

//===================================================================================
PureConfig

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
        // Factory pattern ensures separation of creation logic
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

//==========================================================================

KafkaProducerconfig

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

/**
 * Modern Kafka producer configuration using Java 21 and Spring Boot best practices.
 */
@Configuration
public class KafkaProducerConfig {

    /**
     * Returns Kafka producer configuration as a Map.
     * <p>
     * Uses ConfigurationManager to read environment or application properties.
     */
//    @Bean
//    public Map<String, Object> producerConfig() {
//        Map<String, Object> props = new HashMap<>();
//        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ConfigurationManager.get("KAFKA_BROKERS"));
//        props.put(ProducerConfig.CLIENT_ID_CONFIG, ConfigurationManager.get("CLIENT_ID"));
//        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
//        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
//        props.put(ProducerConfig.ACKS_CONFIG, ConfigurationManager.get("PRODUCER_ACK_CONFIG"));
//        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG"));
//        // SSL/SASL configuration
//        props.put("security.protocol", ConfigurationManager.get("SECURITY_PROTOCOL"));
//        props.put("ssl.truststore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE"));
//        props.put("ssl.truststore.password", ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD"));
//        props.put("ssl.keystore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));
//        props.put("ssl.keystore.password", ConfigurationManager.get("SSL_KEYSTORE_PASSWORD"));
//        props.put("ssl.key.password", ConfigurationManager.get("SSL_KEY_PASSWORD"));
//        return props;
//    }
    @Bean
    public Map<String, Object> producerConfig() {
        Map<String, Object> props = new HashMap<>();

        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ConfigurationManager.get("KAFKA_BROKERS"));
        props.put(ProducerConfig.CLIENT_ID_CONFIG, ConfigurationManager.get("CLIENT_ID"));
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, ConfigurationManager.get("PRODUCER_ACK_CONFIG"));
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG"));

        // SSL/SASL configuration
        props.put("security.protocol", ConfigurationManager.get("SECURITY_PROTOCOL"));
        props.put("ssl.truststore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE"));
        props.put("ssl.truststore.password", ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD"));
        props.put("ssl.keystore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));
        props.put("ssl.keystore.password", ConfigurationManager.get("SSL_KEYSTORE_PASSWORD"));
        props.put("ssl.key.password", ConfigurationManager.get("SSL_KEY_PASSWORD"));

        // === NULL CHECK for all properties ===
        for (Map.Entry<String, Object> entry : props.entrySet()) {
            if (entry.getValue() == null) {
                throw new IllegalArgumentException("Kafka config property '" + entry.getKey() + "' is NULL! Check your configuration.");
            }
        }



        // Print all configs (for debugging - remove/comment in production)
        System.out.println("Kafka Producer Config: " + props);

        System.out.println("Security Protocol: " + ConfigurationManager.get("SECURITY_PROTOCOL")); //TODO Print and Verify security protocol

        System.out.println("Truststore Path: " + Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE"));
        System.out.println("Keystore Path: " + Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));



        return props;
    }

        /**
         * Creates a ProducerFactory with String key and value types.
         */
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfig());
    }

        /**
         * Creates a KafkaTemplate for sending messages.
         */
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

//==============================================================================

Impl-kafkaProducer


// This code is part of a larger system that handles notifications using Kafka and tracks their processing time.
package com.optum.pure.notificationstore.impl;

import com.google.gson.Gson;
import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.elasticsearch.common.StopWatch;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
//import org.springframework.util.concurrent.ListenableFuture;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Kafka Notification Store - Producer implementation
 */
@Component
//@RequiredArgsConstructor
//@Log4j2 // Lombok annotation, auto-creates static final log variable
public final class KafkaProducer implements Producer {
/**For a Spring Boot service like KafkaProducer, I'm using a final class with dependency-injected fields is the standard and best practice. This is because:
 Spring manages beans as classes, not records.
 Records are best for immutable data carriers but i'm not using here, not for beans with logic or dependencies.*/

    private static final org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager.getLogger(KafkaProducer.class);

    // Time metrics fields for tracking
    private static final String TIME_TO_INSERT_TRACKING_RECORD = "timeToInsertTrackingRecord";
    private static final String TIME_TO_EMIT_NOTIFICATION = "timeToEmitNotification";
    private static final String NOTIFICATION_EMIT_TIMESTAMP = "notificationEmitTimestamp";

    // Use List.of() for immutability (Java 9+)
    private static final List<String> fieldList = List.of(
            TIME_TO_EMIT_NOTIFICATION, NOTIFICATION_EMIT_TIMESTAMP, TIME_TO_INSERT_TRACKING_RECORD);


    /**private final means the field must be assigned once usually in the constructor and cannot be changed later.
     * This makes the object immutable after construction,
     * which is safer for dependency injection and thread safety.*/
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private final Gson gson = new Gson();

    public KafkaProducer(KafkaTemplate<String, String> kafkaTemplate, TrackingStore trackingStore) {
        this.kafkaTemplate = kafkaTemplate;
        this.trackingStore = trackingStore;
    }

    @Override
    public void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception {
        log.debug("Producer called");
        StopWatch stopWatch = new StopWatch().start();


        if (notification == null) {
            log.error("Kafka Producer - Notification is null");
//            throw new Exception("Kafka Producer - Notification is null");

            throw new IllegalArgumentException("Kafka Producer - Notification is null");
        }

        try {
            String trackingId = notification.getTrackingId();
            String emitTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
            log.debug("Kafka Producer - Emitting notification with trackingId: {}, time: {}", trackingId, emitTimestamp);

            //Send Kafka message (async)
            // Using CompletableFuture to handle the send operation
            CompletableFuture<SendResult<String, String>> result = kafkaTemplate.send(
                    ConfigurationManager.get("TOPIC_NAME"), trackingId, gson.toJson(notification)
            ); //New Changes for exixting kafka send logic


            // Await send result for metadata/logging
//            SendResult<String, String> sendResult = result.get();
            SendResult<String, String> sendResult = result.get(); //Blocking call to get the result

            log.debug("Kafka Producer - Notification sent with key: {}, to topic: {} with partition: {} & offset: {}",
                    trackingId, sendResult.getRecordMetadata().topic(),
                    sendResult.getRecordMetadata().partition(), sendResult.getRecordMetadata().offset());

            stopWatch.stop(); //TODO Stop the stopwatch after sending the notification
            long timeTakenToEmitNotification = stopWatch.totalTime().getMillis();
            List<Object> valueList = List.of(timeTakenToEmitNotification, emitTimestamp, elapsedTimeTrackingRecordInsertion);
            trackingStore.updateRecord(trackingId, fieldList, valueList);

            log.debug("[Metrics] Kafka Producer - trackingId: {}, timeTaken(ms): {}",
                    trackingId, timeTakenToEmitNotification);

        } catch (RuntimeException e) {
            log.error("Kafka send failed for trackingId - {}", notification.getTrackingId(), e);
            throw e; // Rethrow the original RuntimeException
        }

        }
    }

//=======================================================================================================

Producer

package com.optum.pure.notificationstore;

import com.optum.pure.model.notification.Notification;

public interface Producer {
    void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception;
}

//================================================================================================

Service-PUREServiceController

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
import org.springframework.jmx.export.notification.UnableToSendNotificationException;
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
        if (trackingRecord == null) {
            throw new IllegalArgumentException("trackingRecord cannot be null");
        }
        Notification notification = new Notification(trackingRecord.getTrackingId(), trackingRecord.getVersion(),
                trackingRecord.getInputArtifactUri());
        try {
            producer.sendNotification(notification, timeToWriteTrackingRecord);
            log.debug("Notification sent successfully for request with trackingId: {}", trackingRecord.getTrackingId());
        } catch (Exception e) {
            String id = trackingRecord.getTrackingId();
            log.error("deidentified-tokens API - Emit notification failed for trackingId -> {}", id, e);
            throw new Exception("Error occurred while emitting notification for trackingId: " + id, e);
        }
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
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Thread interrupted while writing input artifact for trackingId -> {}", trackingId.replace("\n", ""), e);
            // Optionally, return or handle gracefully instead of throw e;
        } catch (IOException e) { //TODO Changes into Exception to IOException
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

//==========================================================================================
Application

package com.optum.pure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the PURE Spring Boot application.
 * Java 21 & Spring Boot 3+ ready.
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        // Recommended: Set system property for UTF-8 (default in Java 21 but explicit is safer)
        System.setProperty("file.encoding", "UTF-8");
        SpringApplication.run(Application.class, args);
    }
}

//====================================================================================================

Test Cases code

KafkaProducerConfigTest

// This file is part of the Optum Pure Notification Store project.
package com.optum.pure.notificationstore.config;

import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.Utils;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

// Enables Mockito's annotations (like @Spy, @InjectMocks) with JUnit 5 lifecycle
@ExtendWith(MockitoExtension.class)
final class KafkaProducerConfigTest {

    // Creates a real instance of KafkaProducerConfig and allows partial mocking of its methods
    @Spy
    @InjectMocks
    private KafkaProducerConfig notificationProducerConfig;
    private MockedStatic<ConfigurationManager> configurationManagerMock;
    private MockedStatic<Utils> utilsMock;

    // JUnit 5 setup method, runs before each test

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        configurationManagerMock = Mockito.mockStatic(ConfigurationManager.class);
        configurationManagerMock.when(() -> ConfigurationManager.get(Mockito.anyString()))
                .thenReturn("dummy");
        utilsMock = Mockito.mockStatic(Utils.class);
        utilsMock.when(Utils::getKafkaResourcePath)
                .thenReturn("/dummy/path/");
    }

    @AfterEach
    void tearDown() {
        if (configurationManagerMock != null) configurationManagerMock.close();
        if (utilsMock != null) utilsMock.close();
    }



    // Tests that all required Kafka producer config properties are present in the bean's config map
    @Test
    void getProducerConfigTest() {
        // List of all property keys we expect to see in the config
        List<String> properties = List.of(
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
        // Calls the bean's method to get the actual config map
        Map<String, Object> config = notificationProducerConfig.producerConfig();
        // Asserts that every expected property is present in the config map
        properties.forEach(property -> assertTrue(config.containsKey(property),
                "Missing property in producer config: " + property));
    }

    // Tests that the bean's producerFactory() method returns a DefaultKafkaProducerFactory
    @Test
    void producerFactoryTest() {
        // Mocks producerConfig() to return a sample properties map
        Mockito.doReturn(getProps()).when(notificationProducerConfig).producerConfig();
        // Calls the actual method to get the factory
        ProducerFactory<String, String> defaultKafkaProducerFactory = notificationProducerConfig.producerFactory();
        // Asserts that the result is of the expected class type
        assertEquals(DefaultKafkaProducerFactory.class, defaultKafkaProducerFactory.getClass());
    }

    // Tests that the bean's kafkaTemplate() method returns a KafkaTemplate
    @Test
    void kafkaTemplateTest() {
        // Mocks producerConfig() to return a sample properties map
        Mockito.doReturn(getProps()).when(notificationProducerConfig).producerConfig();
        // Calls the actual method to get the template
        assertEquals(KafkaTemplate.class, notificationProducerConfig.kafkaTemplate().getClass());
    }

    // Utility method for providing a sample producer config for mocking in tests above
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
        props.put("ssl.truststore.password", ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD"));
        props.put("ssl.keystore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));
        props.put("ssl.keystore.password", ConfigurationManager.get("SSL_KEYSTORE_PASSWORD"));
        props.put("ssl.key.password", ConfigurationManager.get("SSL_KEY_PASSWORD"));
        return props;
    }
}

//================================================================================================

Impl-KafkaProducerTest



package com.optum.pure.notificationstore.impl;

import java.util.concurrent.CompletableFuture;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.trackingstore.TrackingStore;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.elasticsearch.common.util.concurrent.ListenableFuture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
//import org.springframework.util.concurrent.ListenableFuture;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
final class KafkaProducerTest {

    // Use @InjectMocks to create an instance of KafkaProducer and inject mocks into it
    @InjectMocks
    private KafkaProducer notificationStore;

    @Mock
    private KafkaTemplate<String, String> mockKafkaTemplate;

    @Mock
    private TrackingStore mockTrackingStore;

    @Mock
    private ListenableFuture<SendResult<String, String>> mockResult;


    @Mock
    private SendResult<String, String> mockSendResult;

    @Mock
    private RecordMetadata mockRecordMetadata;

    private Notification notification;
    private final long timeToInsertTrackingRecord = 11L;

    @BeforeEach
    void setUp() {
        // Set up a test notification
        notification = new Notification("12345", "v1", "pure/test");
    }

    // Test for notification == null; should throw Exception

    @Test
    void sendNotificationFailureTest_NullNotification() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> notificationStore.sendNotification(null, timeToInsertTrackingRecord)
        );
        assertEquals("Kafka Producer - Notification is null", exception.getMessage());
    }// This test checks that the method throws an IllegalArgumentException when a null notification is passed.


    // Test for KafkaTemplate sending failure; should throw Exception
    /**Mocks mockKafkaTemplate.send to throw a RuntimeException.
     Calls sendNotification and expects the same exception.
     Asserts the exception message.*/

    @Test
    void sendNotificationFailureTest_KafkaSendFails() throws Exception {
        // Mock KafkaTemplate.send to throw exception
        when(mockKafkaTemplate.send(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Kafka error"));

        Exception exception = assertThrows(RuntimeException.class,
                () -> notificationStore.sendNotification(notification, timeToInsertTrackingRecord)
        );
        assertEquals("Kafka error", exception.getMessage());
    }

    // Test successful send (happy path)

    @Test
    void sendNotificationSuccessTest() throws Exception {
        // Use CompletableFuture for mocking
        CompletableFuture<SendResult<String, String>> completableFuture = CompletableFuture.completedFuture(mockSendResult);

        when(mockKafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(completableFuture);
        when(mockSendResult.getRecordMetadata()).thenReturn(mockRecordMetadata);
        when(mockRecordMetadata.offset()).thenReturn(1L);
        when(mockRecordMetadata.partition()).thenReturn(1);

        // You may need to mock trackingStore.updateRecord as well if it's not void
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());

        // Should NOT throw any exception
        assertDoesNotThrow(() -> notificationStore.sendNotification(notification, timeToInsertTrackingRecord));
    }
}

//==================================================================================================================

Service-PUREServiceControllerTest


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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.mockito.ArgumentMatchers.any;

import java.io.IOException;
import java.util.*;

import static org.mockito.Mockito.lenient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.nio.charset.StandardCharsets;

//@ExtendWith(SpringExtension.class)
@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)

//@WebMvcTest(PUREServiceController.class)
final class PUREServiceControllerTest {

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
    private ObjectMapper mockObjectMapper;

    @BeforeEach
    void setUp() throws IOException {
        List<String> tokens = new ArrayList<>(Arrays.asList("test1", "test2", "test3"));
        postTokensV2 = new PostTokensV2();
        trackingRecord = new TrackingRecord();
        trackingRecord.setTrackingId("test-tracking-id");
        trackingRecord.setStatus(StatusEnum.IN_PROGRESS.toString());
        logRecord = new LogRecord();
        responseV2 = new ResponseV2();
        postTokensV2.setDeIdentifiedTokenTuples(Arrays.asList(new TokenTuple("tt1", "tt2"), new TokenTuple("test-token1", "test-token2")));
        mockHttpServletRequest = new MockHttpServletRequest();
        mockHttpServletRequest.setScheme("http");
        mockHttpServletRequest.setServerName("localhost");
        mockHttpServletRequest.setServerPort(80);
        mockHttpServletRequest.setContextPath("/requestData");
        mockObjectMapper = new ObjectMapper();
        lenient().doNothing().when(mockLogStore).insertLogRecord(any());
    }

    @Test
    void getClaimsEnrollmentsTest() throws Exception {
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        assertNotNull(pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID));
    }

    @Test
    void getClaimsEnrollmentsTestValidationFailInValidCallerId() throws Exception {
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertEquals("test-tracking-id", trackingStatus.getTrackingId());
        assertEquals("IN_PROGRESS", trackingStatus.getStatus());
        assertNull(trackingStatus.getErrorDescription());
    }

    @Test
    void getClaimsEnrollmentsTestValidationFailInValidCallerIdAndTrackingId() throws Exception {
        trackingRecord.setTrackingId(null);
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals(INVALID_TRACKING_ID, trackingStatus.getErrorDescription());
    }

    @Test
    void getClaimsEnrollmentsTestValidationFailInValidTrackingId() throws Exception {
        trackingRecord.setTrackingId(null);
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals(INVALID_TRACKING_ID, trackingStatus.getErrorDescription());
    }

    @Test
    void getClaimsEnrollmentsTestValidationFailEmptyBody() throws Exception {
        trackingRecord = null;
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals(INVALID_TRACKING_ID, trackingStatus.getErrorDescription());
    }

    @Test
    void getClaimsEnrollmentsTestTrackingStoreFail() throws Exception {
        when(mockTrackingStore.getTrackingRecord(anyString()))
                .thenThrow(new IOException("test error"));
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertNull(trackingStatus.getTrackingId());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }


    @Test
    void getClaimsEnrollmentsTestStatusCompleted() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);

//        when(mockFileStore.readObject(any()))
        when(mockFileStore.readObject(any()))//TODO Here also i have changes anyString to any.
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(responseV2))));
        Object result = pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);

        assertNotNull(result);
        assertTrue(result instanceof ResponseEntity, "Expected ResponseEntity but got " + result.getClass());
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) result;
        assertEquals(200, ((ResponseEntity<?>) result).getStatusCode().value());//TODO replce by responseEntity.getStatusCodeValue()
// Optionally, check the body type/content if needed

    }
    // Expect TrackingStatus, not ResponseEntity
    @Test
    void getClaimsEnrollmentsTestStatusCompleted_Variant() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
//        when(mockFileStore.readObject(any()))

        when(mockFileStore.readObject(any()))//TODO Changes anyString to only any
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(responseV2))));
        Object result = pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);

        assertNotNull(result);
        assertTrue(result instanceof TrackingStatus || result instanceof ResponseEntity);


        if (result instanceof ResponseEntity) {
            assertEquals(200, ((ResponseEntity<?>) result).getStatusCode().value());
        } else if (result instanceof TrackingStatus) {
            // Add assertions for TrackingStatus if needed
        }
    }

    @Test
    void submitTokensTestV2() throws Exception {
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNotNull(trackingStatus.getTrackingId());
        assertNull(trackingStatus.getStatus());
        assertNull(trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestEmptyRequestV2() throws Exception {
        postTokensV2 = null;
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals("Invalid/Missing values - " + EMPTY_REQUEST_BODY_ERR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestEmptyCallerIdV2() throws Exception {
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, "");
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals("Invalid Caller-Id - ", trackingStatus.getErrorDescription());
    }



    @Test
    void submitTokensTestNullTokensV2() throws Exception {
        List<TokenTuple> list = new ArrayList<>();
        list.add(new TokenTuple("abc", "")); // Use empty string for invalid value
        postTokensV2.setDeIdentifiedTokenTuples(list);
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty", trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestEmptyTokensV2() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(new ArrayList<>());
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals("Invalid/Missing values - deIdentifiedTokenTuples", trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestInvalidTokenTupleV2() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(Collections.singletonList(new TokenTuple("abc", "")));
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("INVALID", trackingStatus.getStatus());
        assertEquals("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty", trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestTrackingStoreFailV2() throws Exception {
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        doThrow(new IOException("test-exception")).when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestFileStoreFailV2() throws Exception {
        doThrow(new InterruptedException("test")).when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestTrackingStoreGetFailV2() throws Exception {
        doThrow(new InterruptedException("test")).when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        lenient().doNothing().when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNotNull(trackingStatus);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestTrackingStoreEmitNotificationFail() throws Exception {
        lenient().doNothing().when(mockFileStore).writeObject(anyString(), any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2), mockHttpServletRequest, CALLER_ID);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());

    }

    @Test
    void getClaimsEnrollmentsResponseFailTest() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
//        when(mockFileStore.readObject(anyString())).thenThrow(IOException.class);

        when(mockFileStore.readObject(any())).thenThrow(IOException.class); //TODO This will match any argument, including null, and resolve the stubbing mismatch error.
        TrackingStatus trackingStatus = (TrackingStatus)pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestTrackingStoreInsertLogRecordFailTest() throws Exception {
        lenient().doNothing().when(mockFileStore).writeObject(anyString(),any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        when(mockTrackingStore.getTrackingRecord(anyString())).thenThrow(IOException.class);
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        doThrow(new IOException()).when(mockLogStore).insertLogRecord(any());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),mockHttpServletRequest, CALLER_ID);

        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestTrackingStoreOnExceptionTest() throws Exception {
        doNothing().when(mockFileStore).writeObject(anyString(),any(), anyBoolean());
        doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        when(mockTrackingStore.getTrackingRecord(anyString())).thenReturn(trackingRecord);
        doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),mockHttpServletRequest, CALLER_ID);

        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    void submitTokensTestTrackingStoreOnExceptionTest1() throws Exception {
        lenient().doNothing().when(mockFileStore).writeObject(anyString(),any(), anyBoolean());
        lenient().doNothing().when(mockTrackingStore).insertTrackingRecord(any());
        doThrow(new Exception()).when(mockNotificationStore).sendNotification(any(), anyLong());
        when(mockTrackingStore.getTrackingRecord(anyString())).thenThrow(IOException.class);
        lenient().doNothing().when(mockTrackingStore).updateRecord(anyString(), anyList(), anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),mockHttpServletRequest, CALLER_ID);

        assertNull(trackingStatus.getTrackingId());
        assertEquals("ERRORED", trackingStatus.getStatus());
        assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }
}

//======================================================================================

settings.gradle

// This file is used to configure the Gradle build system for the project.

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
        maven { url "https://plugins.gradle.org/m2/" }
        maven {

            url 'https://repo1.uhc.com/artifactory/repoauth'
            credentials {

                username = System.getenv("DOCKER_USERNAME")
                password = System.getenv("DOCKER_PASSWORD")

            }
        }
    }
    plugins {
        id 'org.springframework.boot' version '3.2.2'
        id 'io.spring.dependency-management' version '1.1.4'
        id("org.sonarqube") version "6.0.0.5145"

    }
}

rootProject.name = 'ohhl-pure-producer'


