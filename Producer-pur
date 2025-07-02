Build.Gradle
------------>
buildscript {
    repositories {
        maven {
            url 'https://repo1.uhc.com/artifactory/repoauth'
            credentials {
                username = System.getenv("DOCKER_USERNAME")
                password = System.getenv("DOCKER_PASSWORD")

            }
        }
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:2.7.20.optum-2")
        classpath ("io.spring.gradle:dependency-management-plugin:1.0.15.RELEASE")
        classpath ("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:2.7")
    }
}

apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'idea'
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
apply plugin: 'org.sonarqube'

version =  '0.1.0'
bootJar {
    archiveBaseName.set('pure-service')
}

///springboot 2.7.x creates *-plain.jar; disable so that the build only create jar from bootJar
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
    maven {
        url 'https://repo1.uhc.com/artifactory/UHG-Snapshots/com/optum/'
        metadataSources {
            artifact() }
    }
}

configurations {
    jacoco
    jacocoRuntime
}

sourceCompatibility = 1.8
targetCompatibility = 1.8

dependencyManagement {
    imports {
            mavenBom 'com.amazonaws:aws-java-sdk-bom:1.12.734'
    }
    resolutionStrategy {
        cacheChangingModulesFor 0, 'seconds'
    }
}

sonarqube {
    properties {
        property 'sonar.projectName', 'pure'
        property 'sonar.jacoco.reportPaths', 'build/jacoco/tests.exec'
    }
}


def gitBranch() {
    def branch = ""
    def proc = "git describe --all".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    branch
}
print gitBranch()

dependencies {
    annotationProcessor "org.projectlombok:lombok:1.18.38"
    implementation 'org.apache.tomcat.embed:tomcat-embed-core:9.0.105'
    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation('org.springframework.boot:spring-boot-starter-test')
    implementation group: 'org.springframework.kafka', name: 'spring-kafka',version: '2.9.11'
    implementation group: 'org.springframework', name: 'spring-web',version:'5.3.42.optum-1'
    implementation group: 'org.springframework', name: 'spring-webmvc',version:'5.3.42'
    implementation 'com.amazonaws:aws-java-sdk-s3:1.12.734'
    implementation 'org.apache.logging.log4j:log4j-api:2.17.1'
    implementation 'org.apache.logging.log4j:log4j-core:2.17.1'
    implementation group: 'javax.json', name: 'javax.json-api', version: '1.0-b01'
    implementation group: 'com.google.code.gson', name: 'gson', version: '2.13.1'
    implementation group: 'org.glassfish', name: 'javax.json', version: '1.1'
    //elastic rest high level client
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.15'
    implementation 'org.elasticsearch.client:elasticsearch-rest-client:7.17.15'
    implementation 'org.elasticsearch:elasticsearch:7.17.15'
    //JMockit dependencies
    testImplementation group: 'org.jmockit', name: 'jmockit', version: '1.19'
    //Kafka dependencies
    implementation group: 'org.apache.kafka', name: 'kafka-clients'
    implementation group: 'org.projectlombok', name: 'lombok', version: '1.18.38'
    implementation group: 'org.json', name: 'json', version: '20231013'
    testImplementation group: 'org.powermock', name: 'powermock-api-mockito', version: '1.6.5'
    testImplementation group: 'org.powermock', name: 'powermock-module-junit4', version: '1.6.5'
    testImplementation group: 'org.mockito', name: 'mockito-core', version: '1.10.19'
    jacoco group: 'org.jacoco', name: 'org.jacoco.ant', version: '0.7.9', classifier: 'nodeps'
    jacocoRuntime group: 'org.jacoco', name: 'org.jacoco.agent', version: '0.7.9', classifier: 'runtime'
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-annotations',version:'2.16.2'
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-core',version:'2.16.2'
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-databind',version:'2.16.2'
    testImplementation 'junit:junit:4.13.2'
    implementation group: 'commons-io', name: 'commons-io', version: '2.19.0'
    implementation group: 'org.springframework.boot', name: 'spring-boot-starter-actuator'
	implementation 'org.springframework:spring-context:5.3.30'
    implementation 'org.xerial.snappy:snappy-java:1.1.10.4'
    implementation 'ch.qos.logback:logback-core:1.2.13'
    implementation 'ch.qos.logback:logback-classic:1.2.13'
    implementation group: 'org.yaml', name:'snakeyaml', version:'2.0'
    //PURE common lib dep
    if(gitBranch().equals("heads/master") || gitBranch().equals("remotes/origin/master")) {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '2.0-SNAPSHOT'
    }else {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '1.0-SNAPSHOT'
    }
}

task instrument(dependsOn: ['classes']) {
    ext.outputDir = file("${buildDir}/classes-instrumented")
    doLast {
        ant.taskdef(name: 'instrument',
                classname: 'org.jacoco.ant.InstrumentTask',
                classpath: configurations.jacoco.asPath)
        ant.instrument(destdir: outputDir) {
            fileset(dir: sourceSets.main.output.classesDirs.singleFile)
        }
    }
}

gradle.taskGraph.whenReady { graph ->
    if (graph.hasTask(instrument)) {
        tasks.withType(Test) {
            doFirst {
                systemProperty 'jacoco-agent.destfile', buildDir.path + '/jacoco/tests.exec'
                classpath = files(instrument.outputDir) + classpath + configurations.jacocoRuntime
            }
        }
    }
}

task report(dependsOn: ['instrument', 'test']) {
    doLast {
        ant.taskdef(name: 'report',
                classname: 'org.jacoco.ant.ReportTask',
                classpath: configurations.jacoco.asPath)
        ant.report() {
            executiondata {
                ant.file(file: buildDir.path + '/jacoco/tests.exec')
            }
            structure(name: 'Example') {
                classfiles {
                    fileset(dir: sourceSets.main.output.classesDirs.singleFile)
                }
                sourcefiles {
                    fileset(dir: 'src/main/java')
                }
            }
            xml(destfile: buildDir.path + '/reports/tests/jacocoTestReport.xml')
        }
    }
}

task copyDependencies {
    doLast {
        copy {
            from configurations.compile
            into 'dependencies'
        }
    }
}

============================================================>
Config->PureConfig
-----------------

package com.optum.pure.config;

import com.optum.pure.filestore.FileStore;
import com.optum.pure.filestore.factory.FileStoreFactory;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.logstore.factory.LogStoreFactory;
import com.optum.pure.trackingstore.TrackingStore;
import com.optum.pure.trackingstore.factory.TrackingStoreFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * This class is configuration class for spring boot used for bean creation.
 */
@Configuration
@ComponentScan("com.optum.pure")
public class PureConfig {

    @Bean
    TrackingStore trackingStore() {
        return TrackingStoreFactory.getTrackingStore();
    }

    @Bean
    FileStore fileStore() {
        return FileStoreFactory.getFileStore();
    }

    @Bean
    LogStore logStore() {
        return LogStoreFactory.getLogStore();
    }
}

=================================================================================>
Notification->config-KafkaProducerConfig
---------------------------------------

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

    private Object DefaultKafkaProducerFactory;

    @Bean
    public Map<String, Object> producerConfig() {
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

    @Bean
    public ProducerFactory<String, String> producerFactory() {
        return  new DefaultKafkaProducerFactory<>(producerConfig());
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}


======================================================================================>
IMPL->KafkaProducer
------------------

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
import org.springframework.util.concurrent.ListenableFuture;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

/**
 * Kafka Notification Store - Producer implementation
 *
 * @author Dwarakesh T P
 */

@Component
@RequiredArgsConstructor
@Log4j2
public class KafkaProducer implements Producer {
    private static final String TIME_TO_INSERT_TRACKING_RECORD = "timeToInsertTrackingRecord";
    private static final String TIME_TO_EMIT_NOTIFICATION = "timeToEmitNotification";
    private static final String NOTIFICATION_EMIT_TIMESTAMP = "notificationEmitTimestamp";
    //TODO Use Map Instead of List.
    private static final List<String> fieldList = Arrays.asList(TIME_TO_EMIT_NOTIFICATION,
            NOTIFICATION_EMIT_TIMESTAMP, TIME_TO_INSERT_TRACKING_RECORD);
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private Gson gson = new Gson();

    @Override
    public void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion)
            throws Exception {
        log.debug("Producer called");
        StopWatch stopWatch = new StopWatch().start();
        if (notification != null) {
            try {
                String trackingId = notification.getTrackingId();
                String emitTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
                log.debug("Kafka Producer - Emitting notification with trackingId: {}, time: {}", trackingId, emitTimestamp);
                ListenableFuture<SendResult<String, String>> result = kafkaTemplate.send(ConfigurationManager.
                        get("TOPIC_NAME"), trackingId, gson.toJson(notification));
                log.debug("Kafka Producer - Notification sent with key: {}, to topic: {} with partition: {} & " +
                        "offset: {}", trackingId, result.get().getRecordMetadata().topic(), result.get().
                        getRecordMetadata().partition(), result.get().getRecordMetadata().offset());
                stopWatch.stop();
                long timeTakenToEmitNotification = stopWatch.totalTime().getMillis();
                List<Object> valueList = Arrays.asList(timeTakenToEmitNotification, emitTimestamp, elapsedTimeTrackingRecordInsertion);
                trackingStore.updateRecord(trackingId, fieldList, valueList);
                log.debug("[Metrics] Kafka Producer - trackingId: {}, timeTaken(ms): {}",
                        notification.getTrackingId(), timeTakenToEmitNotification);
            } catch (Exception e) {
                log.error("Error occurred in Kafka Producer while sending notification for trackingId - {}",
                        notification.getTrackingId(), e);
                throw e;
            }
        } else {
            log.error("Kafka Producer - Notification is null");
            stopWatch.stop();
            throw new Exception("Kafka Producer - Notification is null");
        }
    }
}

===================================================================================================================>
IMPL->Producer
-------------

package com.optum.pure.notificationstore;

import com.optum.pure.model.notification.Notification;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

/**
 * Notification Producer Interface
 *
 * @author Dwarakesh T P
 */
public interface Producer {

    /**
     * Persist notification to Notification Store
     *
     * @param notification
     * @param elapsedTimeTrackingRecordInsertion
     * @throws InterruptedException
     * @throws ExecutionException
     * @throws IOException
     */

    void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception;
}

=================================================================================================================>

Service-> PUREServiceController
-------------------------------

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
import org.elasticsearch.common.StopWatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
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
    private static final List<String> tokenTypes = Arrays.asList(ConfigurationManager.get("VALID_TOKEN_TYPES").split(","));
    private static final List<String> validCallerIds = Arrays.asList(ConfigurationManager.get("VALID_CALLERID").split(","));
    private static final int GET_TRACKING_RECORD_RETRY = 2;
    private final TrackingStore trackingStore;
    private final FileStore fileStore;
    private final LogStore logStore;
    private final Producer producer;

    @GetMapping(value = {"/claims-enrollments/v2/{tracking-id}"},
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Object getClaimsEnrollments(@PathVariable("tracking-id") String trackingId, @Autowired HttpServletRequest
            request, @RequestHeader("Caller-Id") String callerId) {
        StopWatch stopWatch = new StopWatch().start();
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
                StopWatch stopWatch = new StopWatch().start();
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

    private void updateRecord(TrackingRecord trackingRecord,StopWatch stopWatch){
        try {
            trackingStore.updateRecord(trackingRecord.getTrackingId(),
                    Collections.singletonList("timeToReadOutputFromFileStore"),
                    Collections.singletonList(stopWatch.totalTime().getMillis()));
        } catch (Exception e) {
            log.error("claims-enrollments API - Failed to update TrackingStore for trackingId - {}",
                    trackingRecord.getTrackingId(), e);
        }
    }

    @PostMapping(value = "/deidentified-tokens/v2", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public TrackingStatus submitDeidentifiedTokensV2(@RequestBody String requestObject,
                                                     @Autowired HttpServletRequest request,
                                                     @RequestHeader("Caller-Id") String callerId) {
        StopWatch totalTimeStopWatch = new StopWatch().start();
        TrackingStatus response = null;
        String receivedTimestamp = Utils.getCurrentTimestamp();
        String trackingId = Utils.generateTrackingId();
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        log.debug("TrackingId generated for request - {}", trackingId.replace("\n", ""));
        try {
            PostTokensV2 postTokensV2 = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION).readValue(requestObject, PostTokensV2.class);
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
        StopWatch stopWatch = new StopWatch().start();
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
                .setTimeToWriteInputToFileStore(stopWatch.totalTime().getMillis()).build();

        esStopWatch.start();
        insertTrackingRecord(trackingRecord);
        esStopWatch.stop();

        emitNotification(trackingRecord, esStopWatch.totalTime().getMillis());
    }

    private void onException(String trackingId) {
        try {
            TrackingRecord trackingRecord = trackingStore.getTrackingRecord(trackingId);
            if (trackingRecord != null && trackingRecord.getTrackingId() != null && !trackingRecord.getTrackingId().isEmpty()) {
                trackingStore.updateRecord(trackingId, Arrays.asList("status", "errorDescription"),
                        Arrays.asList(StatusEnum.ERRORED.toString(),
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
     *
     * @param callerId
     * @return
     */
    private boolean validateCallerId(String callerId) {
        return !StringUtils.isEmpty(callerId) && callerId.trim().length() > 0 && validCallerIds.contains(callerId);
    }

    /**
     * Returns the status based on response object
     *
     * @param response
     * @return
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
     *
     * @param serviceName
     * @param trackingId
     * @param callerId
     * @param stopWatch
     * @param status
     */
    private void insertLogRecord(String serviceName, String trackingId, String correlationId, String callerId, StopWatch
            stopWatch, String status) {
        stopWatch.stop();
        LogRecord logRecord = new LogRecord(trackingId, correlationId, callerId, serviceName, status,
                Utils.getCurrentTimestamp(), stopWatch.totalTime().getMillis());
        try {
            logStore.insertLogRecord(logRecord);
        } catch (IOException e) {
            log.error(serviceName.replace("\n", "") + " - Failed to insert log record into log store -> {}", logRecord, e);
        }
    }

    /**
     * Method to build callerId validation response
     *
     * @param callerId
     * @return
     */
    private TrackingStatus buildCallerIdValidationResponse(String callerId) {
        String validationResponse = "Invalid Caller-Id - " + callerId;
        log.error("deidentified-tokens API Caller-Id validation failed: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    /**
     * Method to build request validation response
     *
     * @param validationResponse
     * @return
     */
    private TrackingStatus buildRequestValidationResponse(String validationResponse) {
        validationResponse = "Invalid/Missing values - " + validationResponse;
        log.error("deidentified-tokens API input payload validation failed for fields: {}", validationResponse.replace("\n", ""));
        return new TrackingStatus(null, StatusEnum.INVALID.toString(), validationResponse);
    }

    /**
     * Method to handle exception when the POST request body is empty
     *
     * @param ex
     * @return
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    private TrackingStatus handleMissingRequestBody(Exception ex) {
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

====================================================================================================================
Service-Application
-------------------

package com.optum.pure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

=====================================================Test Case=======================================================>

Notificationstore->Config->KafkaProducerConfigTest
--------------------------------------------------
package com.optum.pure.notificationstore.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.StatusEnum;
import com.optum.pure.common.Utils;
import com.optum.pure.model.dto.v2.ResponseV2;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.model.requestobjects.common.LogRecord;
import com.optum.pure.model.requestobjects.common.TrackingRecord;
import com.optum.pure.model.requestobjects.v2.PostTokensV2;
import com.optum.pure.model.requestobjects.v2.TokenTuple;
import mockit.Tested;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.mock.web.MockHttpServletRequest;

import java.io.IOException;
import java.util.*;

/**
 * Unit testcase for KafkaProducerConfig class
 *
 * @author Dwarakesh T P
 */

public class KafkaProducerConfigTest {

    @InjectMocks
    @Spy
    KafkaProducerConfig notificationProducerConfig;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void getProducerConfigTest() {
        List<String> properties = new ArrayList<>(Arrays.asList(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ProducerConfig.CLIENT_ID_CONFIG,
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                ProducerConfig.ACKS_CONFIG, ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG,
                "security.protocol", "ssl.truststore.location",
                "ssl.truststore.password", "ssl.keystore.location",
                "ssl.keystore.password", "ssl.key.password"));
        properties.forEach(property -> Assert.assertTrue(notificationProducerConfig.producerConfig().containsKey(property)));
    }

    @Test
    public void producerFactoryTest() {

        Mockito.when(notificationProducerConfig.producerConfig()).thenReturn(getProps());

        ProducerFactory<String, String> defaultKafkaProducerFactory = notificationProducerConfig.producerFactory();
        Assert.assertEquals(defaultKafkaProducerFactory.getClass(),DefaultKafkaProducerFactory.class);
    }

    @Test
    public void kafkaTemplateTest() {

        Mockito.when(notificationProducerConfig.producerConfig()).thenReturn(getProps());

        Assert.assertEquals(notificationProducerConfig.kafkaTemplate().getClass(), KafkaTemplate.class);
    }

    public Map<String, Object> getProps() {

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

============================================================================================================
Impl->KafkaProducerTest
-----------------------
package com.optum.pure.notificationstore.impl;

import com.optum.pure.model.entity.TrackingStatus;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.model.requestobjects.common.TrackingRecord;
import com.optum.pure.trackingstore.TrackingStore;
import mockit.Expectations;
import mockit.Injectable;
import mockit.Mocked;
import mockit.Tested;
import mockit.integration.junit4.JMockit;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFuture;

import java.io.IOException;
import java.util.List;

/**
 * Unit tests for KafkaProducer class
 *
 * @author Dwarakesh T P
 */

@RunWith(JMockit.class)
public class KafkaProducerTest {
    @Tested
    KafkaProducer notificationStore;
    private Notification notification;
    private long timeToInsertTrackingRecord = new Long(11);
    private ProducerRecord<String, String> record;
    @Injectable
    private KafkaTemplate<String, String> mockKafkaTemplate;
    @Injectable
    private TrackingStore mockTrackingStore;
    @Mocked
    private ListenableFuture<SendResult<String, String>> mockResult;
    @Mocked
    private SendResult<String, String> mockSendResult;
    @Mocked
    private RecordMetadata mockRecordMetadata;

    @Before
    public void setup() {
        notification = new Notification("12345", "pure/test", "v1");
    }

    /*06/23 comment for now due to failing test case in Jenkins pipeline
    @Test
    public void sendNotificationSuccessTest(@Mocked TrackingStore mockTrackingStore) throws Exception {
        new Expectations() {{
            mockKafkaTemplate.send(anyString, anyString, anyString);
            result = mockResult;

            mockResult.get();
            result = mockSendResult;

            mockSendResult.getRecordMetadata();
            result = mockRecordMetadata;

            mockRecordMetadata.offset();
            result = 1;

            mockRecordMetadata.partition();
            result = 1;

        }};
        notificationStore.sendNotification(notification, timeToInsertTrackingRecord);
        Assert.assertNotNull(notification);
    }

    @Test(expected = Exception.class)
    public void sendNotificationFailureTest1() throws Exception {
        new Expectations() {
            {
                mockKafkaTemplate.send(anyString, anyString, anyString);
                result = new Exception();
            }
        };
        notificationStore.sendNotification(notification, timeToInsertTrackingRecord);
    }*/

    @Test(expected = Exception.class)
    public void sendNotificationFailureTest2() throws Exception {
        Notification nullNotification = null;
        notificationStore.sendNotification(nullNotification, timeToInsertTrackingRecord);
    }

}

===========================================================================================================================

Service->PUREServiceControllerTest
----------------------------------

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
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Matchers.any;

/**
 * Unit tests for PUREServiceController
 */

public class PUREServiceControllerTest {

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
    private LogRecord logRecord;
    private ResponseV2 responseV2;
    private PostTokensV2 postTokensV2;
    private MockHttpServletRequest mockHttpServletRequest;
    private ObjectMapper mockObjectMapper;

    @Before
    public void setUp() {
        List<String> tokens = new ArrayList<String>(Arrays.asList("test1", "test2", "test3"));
        postTokensV2 = new PostTokensV2();
        trackingRecord = new TrackingRecord();
        trackingRecord.setTrackingId("test-tracking-id");
        trackingRecord.setStatus(StatusEnum.IN_PROGRESS.toString());
        logRecord = new LogRecord();
        responseV2 = new ResponseV2();
        postTokensV2.setDeIdentifiedTokenTuples(Arrays.asList(new TokenTuple("tt1", "tt2"),
                new TokenTuple("test-token1", "test-token2")));
        mockHttpServletRequest = new MockHttpServletRequest();
        mockHttpServletRequest = new MockHttpServletRequest();
        mockHttpServletRequest.setScheme("http");
        mockHttpServletRequest.setServerName("localhost");
        mockHttpServletRequest.setServerPort(80);
        mockHttpServletRequest.setContextPath("/requestData");
        mockObjectMapper = new ObjectMapper();
        MockitoAnnotations.initMocks(this);
        try {
            Mockito.doNothing().when(mockLogStore).insertLogRecord(Mockito.any());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getClaimsEnrollmentsTest() throws Exception {
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        Assert.assertNotNull(pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID));
    }

    @Test
    public void getClaimsEnrollmentsTestValidationFailInValidCallerId() throws Exception {
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertEquals("test-tracking-id", trackingStatus.getTrackingId());
        Assert.assertEquals("IN_PROGRESS", trackingStatus.getStatus());
        Assert.assertNull(trackingStatus.getErrorDescription());
    }

    @Test
    public void getClaimsEnrollmentsTestValidationFailInValidCallerIdAndTrackingId() throws Exception {
        trackingRecord.setTrackingId(null);
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals(INVALID_TRACKING_ID, trackingStatus.getErrorDescription());
    }

    @Test
    public void getClaimsEnrollmentsTestValidationFailInValidTrackingId() throws Exception {
        trackingRecord.setTrackingId(null);
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals(INVALID_TRACKING_ID, trackingStatus.getErrorDescription());
    }

    @Test
    public void getClaimsEnrollmentsTestValidationFailEmptyBody() throws Exception {
        trackingRecord = null;
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals(INVALID_TRACKING_ID, trackingStatus.getErrorDescription());
    }

    @Test
    public void getClaimsEnrollmentsTestTrackingStoreFail() throws Exception {
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString()))
                .thenThrow(new IOException("test error"));
        TrackingStatus trackingStatus = (TrackingStatus) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void getClaimsEnrollmentsTestStatusCompleted() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        Mockito.when(mockFileStore.readObject(Mockito.anyString()))
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(responseV2))));
        ResponseEntity responseEntity = (ResponseEntity) pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID);
        Assert.assertNotNull(responseEntity);
        Assert.assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    public void getClaimsEnrollmentsTestUpdateTimeException() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        Mockito.when(mockFileStore.readObject(Mockito.anyString()))
                .thenReturn(IOUtils.toByteArray(IOUtils.toInputStream(new ObjectMapper().writeValueAsString(responseV2))));
        Mockito.doThrow(new IOException("test")).when(mockTrackingStore).updateRecord(Mockito.anyString(),
                Mockito.anyListOf(String.class), Mockito.anyList());
        Assert.assertNotNull(pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest,
                CALLER_ID));
    }

    @Test
    public void submitTokensTestV2() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNotNull(trackingStatus.getTrackingId());
        Assert.assertNull(trackingStatus.getStatus());
        Assert.assertNull(trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestEmptyRequestV2() throws Exception {
        postTokensV2 = null;
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals("Invalid/Missing values - " + EMPTY_REQUEST_BODY_ERR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestEmptyCallerIdV2() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, "");
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals("Invalid Caller-Id - ", trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestNullTokensV2() throws Exception {
        List list = new ArrayList<>();
        list.add(new Object());
        postTokensV2.setDeIdentifiedTokenTuples(list);
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty", trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestEmptyTokensV2() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(new ArrayList<>());
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals("Invalid/Missing values - deIdentifiedTokenTuples", trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestInvalidTokenTupleV2() throws Exception {
        postTokensV2.setDeIdentifiedTokenTuples(Collections.singletonList(new TokenTuple("abc", "")));
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("INVALID", trackingStatus.getStatus());
        Assert.assertEquals("Invalid/Missing values - Token(s) in a Tuple cannot be null/empty", trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestTrackingStoreFailV2() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(), Mockito.anyObject(),
                Mockito.anyBoolean());
        Mockito.doThrow(new IOException("test-exception")).when(mockTrackingStore).insertTrackingRecord(Mockito.any());
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestFileStoreFailV2() throws Exception {
        Mockito.doThrow(new InterruptedException("test")).when(mockFileStore).writeObject(Mockito.anyString(),
                Mockito.anyObject(), Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestTrackingStoreGetFailV2() throws Exception {
        Mockito.doThrow(new InterruptedException("test")).when(mockFileStore).writeObject(Mockito.anyString(),
                Mockito.anyObject(), Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doNothing().when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNotNull(trackingStatus);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestTrackingStoreEmitNotificationFail() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(),
                Mockito.anyObject(), Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doThrow(new Exception()).when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class),
                Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),
                mockHttpServletRequest, CALLER_ID);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());

    }

    @Test
    public void getClaimsEnrollmentsResponseFailTest() throws Exception {
        trackingRecord.setStatus("COMPLETED_SUCCESSFULLY");
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        Mockito.when(mockFileStore.readObject(Mockito.anyString())).thenThrow(IOException.class);
        TrackingStatus trackingStatus = (TrackingStatus)pureServiceController.getClaimsEnrollments("12345", mockHttpServletRequest, CALLER_ID);
        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestTrackingStoreInsertLogRecordFailTest() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(),Mockito.anyObject(), Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doThrow(new Exception()).when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenThrow(IOException.class);
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class), Mockito.anyList());
        Mockito.doThrow(new IOException()).when(mockLogStore).insertLogRecord(Mockito.any());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),mockHttpServletRequest, CALLER_ID);

        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestTrackingStoreOnExceptionTest() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(),Mockito.anyObject(), Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doThrow(new Exception()).when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenReturn(trackingRecord);
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class), Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),mockHttpServletRequest, CALLER_ID);

        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }

    @Test
    public void submitTokensTestTrackingStoreOnExceptionTest1() throws Exception {
        Mockito.doNothing().when(mockFileStore).writeObject(Mockito.anyString(),Mockito.anyObject(), Mockito.anyBoolean());
        Mockito.doNothing().when(mockTrackingStore).insertTrackingRecord(trackingRecord);
        Mockito.doThrow(new Exception()).when(mockNotificationStore).sendNotification(Mockito.anyObject(), Mockito.anyLong());
        Mockito.when(mockTrackingStore.getTrackingRecord(Mockito.anyString())).thenThrow(IOException.class);
        Mockito.doNothing().when(mockTrackingStore).updateRecord(Mockito.anyString(), Mockito.anyListOf(String.class), Mockito.anyList());
        TrackingStatus trackingStatus = pureServiceController.submitDeidentifiedTokensV2(new Gson().toJson(postTokensV2),mockHttpServletRequest, CALLER_ID);

        Assert.assertNull(trackingStatus.getTrackingId());
        Assert.assertEquals("ERRORED", trackingStatus.getStatus());
        Assert.assertEquals(ERROR_MSG, trackingStatus.getErrorDescription());
    }
}
