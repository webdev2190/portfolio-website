package com.optum.pure.notificationstore.config;

import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.Utils;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KafkaProducerConfigTest {

    private static final Set<String> REQUIRED_PROPERTIES = Set.of(
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

    @InjectMocks
    private KafkaProducerConfig kafkaProducerConfig;

    @Mock
    private ConfigurationManager configManager;

    @Mock
    private Utils utils;

    @BeforeEach
    void setup() {
        // Common stubs
        when(utils.getKafkaResourcePath()).thenReturn("/test/path/");
        when(configManager.get(anyString())).thenReturn("mock-value");
    }

    @Test
    @DisplayName("Producer config should contain all required properties")
    void producerConfig_ContainsAllRequiredProperties() {
        Map<String, Object> config = kafkaProducerConfig.producerConfig();
        
        assertAll(
            REQUIRED_PROPERTIES.stream()
                .map(prop -> () -> assertTrue(
                    config.containsKey(prop),
                    "Missing property: " + prop
                ))
        );
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "KAFKA_BROKERS",
        "CLIENT_ID",
        "SECURITY_PROTOCOL",
        "SSL_TRUSTSTORE_FILE"
    })
    @DisplayName("Should load specified configurations")
    void producerConfig_LoadsConfigurationValues(String configKey) {
        when(configManager.get(configKey)).thenReturn("test-value");
        
        Map<String, Object> config = kafkaProducerConfig.producerConfig();
        
        assertNotNull(config.values().stream()
            .filter("test-value"::equals)
            .findFirst()
            .orElse(null));
    }

    @Test
    @DisplayName("SSL paths should be properly constructed")
    void producerConfig_BuildsCorrectSSLPaths() {
        when(configManager.get("SSL_TRUSTSTORE_FILE")).thenReturn("truststore.jks");
        when(configManager.get("SSL_KEYSTORE_FILE")).thenReturn("keystore.jks");
        
        Map<String, Object> config = kafkaProducerConfig.producerConfig();
        
        assertEquals(
            Paths.get("/test/path/", "truststore.jks").toString(),
            config.get("ssl.truststore.location")
        );
        assertEquals(
            Paths.get("/test/path/", "keystore.jks").toString(),
            config.get("ssl.keystore.location")
        );
    }

    @Test
    @DisplayName("Should create DefaultKafkaProducerFactory")
    void producerFactory_CreatesCorrectFactoryType() {
        // Given
        when(kafkaProducerConfig.producerConfig()).thenReturn(Map.of());
        
        // When
        ProducerFactory<String, String> factory = kafkaProducerConfig.producerFactory();
        
        // Then
        assertInstanceOf(DefaultKafkaProducerFactory.class, factory);
    }

    @Test
    @DisplayName("Should create KafkaTemplate with producer factory")
    void kafkaTemplate_CreatesTemplateWithFactory() {
        // Given
        ProducerFactory<String, String> mockFactory = mock();
        when(kafkaProducerConfig.producerFactory()).thenReturn(mockFactory);
        
        // When
        KafkaTemplate<String, String> template = kafkaProducerConfig.kafkaTemplate();
        
        // Then
        assertNotNull(template);
        verify(kafkaProducerConfig).producerFactory();
    }

    @Test
    @DisplayName("Should use StringSerializer for key and value")
    void producerConfig_ContainsCorrectSerializers() {
        Map<String, Object> config = kafkaProducerConfig.producerConfig();
        
        assertEquals(
            StringSerializer.class.getName(),
            config.get(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG)
        );
        assertEquals(
            StringSerializer.class.getName(),
            config.get(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG)
        );
    }
}

===================================================Cgt=======================================================

package com.optum.pure.notificationstore.config;

import com.optum.pure.common.ConfigurationManager;
import com.optum.pure.common.Utils;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class KafkaProducerConfigTest {

    @InjectMocks
    private KafkaProducerConfig kafkaProducerConfig;

    @BeforeEach
    void setUp() {
        // No-op: @InjectMocks does all the work for this test class
    }

    @Test
    void producerConfig_containsExpectedProperties() {
        try (MockedStatic<ConfigurationManager> configMock = Mockito.mockStatic(ConfigurationManager.class);
             MockedStatic<Utils> utilsMock = Mockito.mockStatic(Utils.class)) {

            configMock.when(() -> ConfigurationManager.get("KAFKA_BROKERS")).thenReturn("localhost:9092");
            configMock.when(() -> ConfigurationManager.get("CLIENT_ID")).thenReturn("client");
            configMock.when(() -> ConfigurationManager.get("PRODUCER_ACK_CONFIG")).thenReturn("all");
            configMock.when(() -> ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG")).thenReturn("true");
            configMock.when(() -> ConfigurationManager.get("SECURITY_PROTOCOL")).thenReturn("SSL");
            configMock.when(() -> ConfigurationManager.get("SSL_TRUSTSTORE_FILE")).thenReturn("truststore.jks");
            configMock.when(() -> ConfigurationManager.get("SSL_KEYSTORE_FILE")).thenReturn("keystore.jks");
            configMock.when(() -> ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD")).thenReturn("trustpass");
            configMock.when(() -> ConfigurationManager.get("SSL_KEYSTORE_PASSWORD")).thenReturn("keypass");
            configMock.when(() -> ConfigurationManager.get("SSL_KEY_PASSWORD")).thenReturn("keypass");

            utilsMock.when(Utils::getKafkaResourcePath).thenReturn("/tmp/");

            Map<String, Object> config = kafkaProducerConfig.producerConfig();

            List<String> expectedKeys = List.of(
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

            for (var key : expectedKeys) {
                assertThat(config).containsKey(key);
            }
        }
    }

    @Test
    void producerFactory_returnsDefaultKafkaProducerFactory() {
        // Arrange
        var props = Map.of(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092",
            ProducerConfig.CLIENT_ID_CONFIG, "client",
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName(),
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName()
        );

        KafkaProducerConfig config = Mockito.spy(new KafkaProducerConfig());
        Mockito.doReturn(props).when(config).producerConfig();

        // Act
        ProducerFactory<String, String> producerFactory = config.producerFactory(props);

        // Assert
        assertThat(producerFactory).isInstanceOf(DefaultKafkaProducerFactory.class);
    }

    @Test
    void kafkaTemplate_returnsKafkaTemplate() {
        // Arrange
        var props = Map.of(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092",
            ProducerConfig.CLIENT_ID_CONFIG, "client",
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName(),
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName()
        );

        KafkaProducerConfig config = Mockito.spy(new KafkaProducerConfig());
        Mockito.doReturn(props).when(config).producerConfig();
        ProducerFactory<String, String> factory = config.producerFactory(props);

        // Act
        KafkaTemplate<String, String> template = config.kafkaTemplate(factory);

        // Assert
        assertThat(template).isInstanceOf(KafkaTemplate.class);
    }
}
