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
import org.springframework.util.concurrent.ListenableFuture;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Kafka Notification Store - Producer implementation
 */
@Component
@RequiredArgsConstructor
@Log4j2 // Lombok annotation, auto-creates static final log variable
public final class KafkaProducer implements Producer {

    // Time metrics fields for tracking
    private static final String TIME_TO_INSERT_TRACKING_RECORD = "timeToInsertTrackingRecord";
    private static final String TIME_TO_EMIT_NOTIFICATION = "timeToEmitNotification";
    private static final String NOTIFICATION_EMIT_TIMESTAMP = "notificationEmitTimestamp";

    // Use List.of() for immutability (Java 9+)
    private static final List<String> fieldList = List.of(
            TIME_TO_EMIT_NOTIFICATION, NOTIFICATION_EMIT_TIMESTAMP, TIME_TO_INSERT_TRACKING_RECORD);

    
    /**private final ... means the field must be assigned once (usually in the constructor) and cannot be changed later.
 * This makes the object immutable after construction,
 * which is safer for dependency injection and thread safety.*/
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private final Gson gson = new Gson();

//TODO without final key
    /**private ... (without final) allows the field to be reassigned after construction,
     * which can lead to bugs if the reference is changed unintentionally.*/
//    private  KafkaTemplate<String, String> kafkaTemplate;
//    private  TrackingStore trackingStore;
//    private  Gson gson = new Gson();

    
    
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
//            ListenableFuture<SendResult<String, String>> result = kafkaTemplate.send(
//                    ConfigurationManager.get("TOPIC_NAME"), trackingId, gson.toJson(notification));

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
