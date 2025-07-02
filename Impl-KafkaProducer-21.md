package com.optum.pure.notificationstore.impl;

import com.google.gson.Gson;
import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.model.notification.Notification;
import com.optum.pure.notificationstore.Producer;
import com.optum.pure.trackingstore.TrackingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Modernized Kafka Producer implementation with Java 21 features
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class KafkaProducer implements Producer {
    // Converted to immutable Set
    private static final Set<String> METRIC_FIELDS = Set.of(
        "timeToEmitNotification",
        "notificationEmitTimestamp", 
        "timeToInsertTrackingRecord"
    );

    // Injected dependencies
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private final Clock clock;  // For testable time operations
    private final Gson gson = new Gson();  // Made final
    
    @Override
    public CompletableFuture<Void> sendNotification(Notification notification, 
                                                  long elapsedTimeTrackingRecordInsertion) {
        Objects.requireNonNull(notification, "Notification must not be null");
        log.debug("Producer called for trackingId: {}", notification::getTrackingId);

        final var startTime = System.currentTimeMillis();
        final var emitTimestamp = LocalDateTime.now(clock)
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));

        return CompletableFuture.supplyAsync(() -> {
            try {
                return kafkaTemplate.send(
                    ConfigurationManager.get("TOPIC_NAME"),
                    notification.getTrackingId(),
                    gson.toJson(notification)
                ).completable();
            } catch (Exception e) {
                throw new NotificationSendException(e);
            }
        }).thenCompose(sendResult -> {
            return sendResult.whenComplete((result, ex) -> {
                final var timeTaken = System.currentTimeMillis() - startTime;
                
                if (ex == null) {
                    log.debug("Notification sent successfully. Topic: {}, Partition: {}, Offset: {}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
                
                trackingStore.updateRecord(
                    notification.getTrackingId(),
                    METRIC_FIELDS,
                    List.of(timeTaken, emitTimestamp, elapsedTimeTrackingRecordInsertion)
                );
                
                log.debug("[Metrics] trackingId: {}, timeTaken(ms): {}",
                    notification.getTrackingId(), timeTaken);
            });
        }).exceptionally(ex -> {
            log.error("Failed to send notification for trackingId: {}", 
                notification.getTrackingId(), ex);
            throw new NotificationSendException(ex);
        });
    }

    // Custom exception for better error handling
    public static final class NotificationSendException extends RuntimeException {
        public NotificationSendException(Throwable cause) {
            super("Failed to send notification", cause);
        }
    }
}

=================================================cgt===========================================================>

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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Kafka Notification Store - Producer implementation, Java 21 version.
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class KafkaProducer implements Producer {

    private static final String TIME_TO_INSERT_TRACKING_RECORD = "timeToInsertTrackingRecord";
    private static final String TIME_TO_EMIT_NOTIFICATION = "timeToEmitNotification";
    private static final String NOTIFICATION_EMIT_TIMESTAMP = "notificationEmitTimestamp";
    // Use unmodifiable list for thread-safety and immutability
    private static final List<String> FIELD_LIST = List.of(
            TIME_TO_EMIT_NOTIFICATION,
            NOTIFICATION_EMIT_TIMESTAMP,
            TIME_TO_INSERT_TRACKING_RECORD
    );

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TrackingStore trackingStore;
    private final Gson gson = new Gson(); // Safe to use as final since Gson is thread-safe

    private static final DateTimeFormatter EMIT_TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    @Override
    public void sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion) throws Exception {
        log.debug("Producer called");
        var stopWatch = new StopWatch().start();

        if (notification == null) {
            stopWatch.stop();
            log.error("Kafka Producer - Notification is null");
            throw new IllegalArgumentException("Notification cannot be null");
        }

        try {
            var trackingId = notification.getTrackingId();
            var emitTimestamp = LocalDateTime.now().format(EMIT_TIMESTAMP_FORMAT);

            log.debug("Kafka Producer - Emitting notification with trackingId: {}, time: {}", trackingId, emitTimestamp);

            // Send the notification and wait for result (could also use async with a callback if desired)
            var result = kafkaTemplate.send(
                    ConfigurationManager.get("TOPIC_NAME"),
                    trackingId,
                    gson.toJson(notification)
            ).get();

            var meta = result.getRecordMetadata();
            log.debug("Kafka Producer - Notification sent with key: {}, to topic: {} partition: {} offset: {}",
                    trackingId, meta.topic(), meta.partition(), meta.offset());

            stopWatch.stop();
            var timeTakenToEmitNotification = stopWatch.totalTime().getMillis();
            var valueList = List.of(timeTakenToEmitNotification, emitTimestamp, elapsedTimeTrackingRecordInsertion);

            trackingStore.updateRecord(trackingId, FIELD_LIST, valueList);

            log.debug("[Metrics] Kafka Producer - trackingId: {}, timeTaken(ms): {}", trackingId, timeTakenToEmitNotification);

        } catch (Exception e) {
            log.error("Error in Kafka Producer while sending notification for trackingId - {}",
                    notification.getTrackingId(), e);
            throw e;
        }
    }
}
