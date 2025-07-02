package com.optum.pure.notificationstore;

import com.optum.pure.model.notification.Notification;

import java.util.concurrent.CompletableFuture;

/**
 * Modernized notification producer interface with Java 21 features
 * 
 * @param notification The notification to send
 * @param elapsedTimeTrackingRecordInsertion Time taken for tracking record insertion in milliseconds
 * @return CompletableFuture that completes when notification is sent
 * @throws NullPointerException if notification is null
 */
public sealed interface Producer permits KafkaProducer {

    /**
     * Asynchronously persists notification to Notification Store
     */
    CompletableFuture<Void> sendNotification(Notification notification, 
                                           long elapsedTimeTrackingRecordInsertion);
    
    /**
     * Helper record for tracking metrics
     */
    record DeliveryMetrics(
        long timeToEmitNotification,
        String emitTimestamp,
        long elapsedTimeTrackingRecordInsertion
    ) {}
}

======================================================cgt======================================================>

package com.optum.pure.notificationstore;

import com.optum.pure.model.notification.Notification;
import java.util.concurrent.CompletableFuture;

/**
 * Asynchronous Notification Producer Interface for Java 21+
 * 
 * Provides a contract to persist notifications to the Notification Store.
 */
public interface Producer {

    /**
     * Persist notification to Notification Store asynchronously.
     *
     * @param notification The notification to be sent (must not be null).
     * @param elapsedTimeTrackingRecordInsertion Time taken to insert tracking record (ms).
     * @return CompletableFuture that completes when sending and record update finish.
     *         Any error is propagated as a failed future.
     */
    CompletableFuture<Void> sendNotification(Notification notification, long elapsedTimeTrackingRecordInsertion);
}
