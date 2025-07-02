package com.optum.pure.notificationstore.impl;

import com.optum.pure.model.notification.Notification;
import com.optum.pure.trackingstore.TrackingStore;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFuture;

import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Modernized unit tests for KafkaProducer with Java 21 features
 */
@ExtendWith(MockitoExtension.class)
class KafkaProducerTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private TrackingStore trackingStore;

    @Mock
    private ListenableFuture<SendResult<String, String>> listenableFuture;

    @Mock
    private SendResult<String, String> sendResult;

    @Mock
    private RecordMetadata recordMetadata;

    @InjectMocks
    private KafkaProducer kafkaProducer;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = new Notification("12345", "pure/test", "v1");
        when(kafkaTemplate.send(anyString(), anyString(), anyString()))
            .thenReturn(listenableFuture);
    }

    @Test
    @DisplayName("Should successfully send notification")
    void sendNotification_Success() throws Exception {
        // Given
        when(listenableFuture.completable()).thenReturn(CompletableFuture.completedFuture(sendResult));
        when(sendResult.getRecordMetadata()).thenReturn(recordMetadata);
        when(recordMetadata.offset()).thenReturn(1L);
        when(recordMetadata.partition()).thenReturn(1);

        // When
        kafkaProducer.sendNotification(notification, 11L);

        // Then
        verify(trackingStore).updateRecord(
            eq("12345"),
            any(),
            any()
        );
    }

    @Test
    @DisplayName("Should throw exception when Kafka send fails")
    void sendNotification_KafkaFailure() throws Exception {
        // Given
        when(listenableFuture.completable())
            .thenReturn(CompletableFuture.failedFuture(new RuntimeException("Kafka error")));

        // When & Then
        assertThrows(Exception.class, () -> 
            kafkaProducer.sendNotification(notification, 11L)
        );
    }

    @Test
    @DisplayName("Should throw exception when notification is null")
    void sendNotification_NullNotification() {
        assertThrows(NullPointerException.class, () -> 
            kafkaProducer.sendNotification(null, 11L)
        );
    }

    @Test
    @DisplayName("Should track metrics even when Kafka succeeds")
    void sendNotification_TracksMetricsOnSuccess() throws Exception {
        // Given
        when(listenableFuture.completable()).thenReturn(CompletableFuture.completedFuture(sendResult));
        when(sendResult.getRecordMetadata()).thenReturn(recordMetadata);

        // When
        kafkaProducer.sendNotification(notification, 11L);

        // Then
        verify(trackingStore).updateRecord(
            eq(notification.getTrackingId()),
            any(),
            argThat(values -> values.size() == 3)
        );
    }

    @Test
    @DisplayName("Should include correct timing metrics")
    void sendNotification_IncludesCorrectMetrics() throws Exception {
        // Given
        when(listenableFuture.completable()).thenReturn(CompletableFuture.completedFuture(sendResult));

        // When
        long startTime = System.currentTimeMillis();
        kafkaProducer.sendNotification(notification, 11L);
        long duration = System.currentTimeMillis() - startTime;

        // Then
        verify(trackingStore).updateRecord(
            eq(notification.getTrackingId()),
            any(),
            argThat(values -> 
                (long)values.get(0) <= duration && // timeToEmitNotification
                values.get(1) instanceof String &&  // emitTimestamp
                (long)values.get(2) == 11L         // timeToInsertTrackingRecord
            )
        );
    }
}
------------------------------------------Another test case try------------------------------------------------

   package com.optum.pure.notificationstore.impl;

import com.optum.pure.model.notification.Notification;
import com.optum.pure.trackingstore.TrackingStore;
import mockit.Expectations;
import mockit.Injectable;
import mockit.Mocked;
import mockit.Tested;
import mockit.integration.junit5.JMockitExtension;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFuture;

import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Modernized unit tests for KafkaProducer using Java 21 and JMockit
 */
@ExtendWith(JMockitExtension.class)
public class KafkaProducerTest {

    @Tested
    private KafkaProducer notificationStore;

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

    private Notification notification;
    private final long timeToInsertTrackingRecord = 11L;

    @BeforeEach
    public void setup() {
        notification = new Notification("12345", "pure/test", "v1");
    }

    @Test
    public void sendNotificationFailureTest2() {
        assertThrows(NullPointerException.class, () -> 
            notificationStore.sendNotification(null, timeToInsertTrackingRecord)
        );
    }

    @Test
    public void sendNotificationSuccessTest() throws Exception {
        new Expectations() {{
            mockKafkaTemplate.send(anyString, anyString, anyString);
            result = mockResult;

            mockResult.get();
            result = mockSendResult;

            mockSendResult.getRecordMetadata();
            result = mockRecordMetadata;
        }};

        notificationStore.sendNotification(notification, timeToInsertTrackingRecord);
    }

    @Test
    public void sendNotificationFailureTest1() throws Exception {
        new Expectations() {{
            mockKafkaTemplate.send(anyString, anyString, anyString);
            result = new Exception("Kafka error");
        }};

        assertThrows(Exception.class, () ->
            notificationStore.sendNotification(notification, timeToInsertTrackingRecord)
        );
    }
}



=====================================================cgt=======================================================>

package com.optum.pure.notificationstore.impl;

import com.optum.pure.model.notification.Notification;
import com.optum.pure.trackingstore.TrackingStore;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Modern unit tests for KafkaProducer class (Java 21+, JUnit 5, Mockito)
 */
class KafkaProducerTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;
    @Mock
    private TrackingStore trackingStore;

    @InjectMocks
    private KafkaProducer kafkaProducer;

    private Notification notification;
    private final long timeToInsertTrackingRecord = 11L;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        notification = new Notification("12345", "pure/test", "v1");
    }

    @Test
    void sendNotification_success() throws Exception {
        // Arrange
        var sendResult = mock(SendResult.class);
        var recordMetadata = mock(RecordMetadata.class);
        when(recordMetadata.offset()).thenReturn(1L);
        when(recordMetadata.partition()).thenReturn(1);
        when(sendResult.getRecordMetadata()).thenReturn(recordMetadata);

        CompletableFuture<SendResult<String, String>> kafkaFuture = CompletableFuture.completedFuture(sendResult);
        when(kafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(kafkaFuture);

        // Act & Assert
        assertThatCode(() -> kafkaProducer.sendNotification(notification, timeToInsertTrackingRecord).get())
                .doesNotThrowAnyException();

        verify(kafkaTemplate).send(anyString(), anyString(), anyString());
        verify(trackingStore).updateRecord(eq(notification.getTrackingId()), anyList(), anyList());
    }

    @Test
    void sendNotification_failureOnKafkaSend() {
        // Arrange
        CompletableFuture<SendResult<String, String>> kafkaFuture = new CompletableFuture<>();
        kafkaFuture.completeExceptionally(new RuntimeException("Kafka error"));
        when(kafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(kafkaFuture);

        // Act & Assert
        assertThatThrownBy(() -> kafkaProducer.sendNotification(notification, timeToInsertTrackingRecord).get())
                .hasCauseInstanceOf(RuntimeException.class)
                .hasMessageContaining("Kafka error");

        verify(kafkaTemplate).send(anyString(), anyString(), anyString());
    }

    @Test
    void sendNotification_nullNotification_throwsException() {
        // Act & Assert
        assertThatThrownBy(() -> kafkaProducer.sendNotification(null, timeToInsertTrackingRecord).get())
                .isInstanceOf(ExecutionException.class)
                .hasCauseInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Notification cannot be null");
    }
}
