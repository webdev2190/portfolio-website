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
import org.springframework.lang.NonNull;

import java.nio.file.Path;
import java.util.Map;
import java.util.Objects;

@Configuration
public class KafkaProducerConfig {

    public record KafkaSecurityConfig(
        @NonNull Path truststoreLocation,
        @NonNull String truststorePassword,
        @NonNull Path keystoreLocation,
        @NonNull String keystorePassword,
        @NonNull String keyPassword
    ) {
        public KafkaSecurityConfig {
            Objects.requireNonNull(truststoreLocation);
            Objects.requireNonNull(keystoreLocation);
        }
    }

    @Bean
    public KafkaSecurityConfig kafkaSecurityConfig() {
        return new KafkaSecurityConfig(
            Path.of(Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE")),
            ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD"),
            Path.of(Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE")),
            ConfigurationManager.get("SSL_KEYSTORE_PASSWORD"),
            ConfigurationManager.get("SSL_KEY_PASSWORD")
        );
    }

    @Bean
    public Map<String, Object> producerConfig(KafkaSecurityConfig securityConfig) {
        return Map.ofEntries(
            Map.entry(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ConfigurationManager.get("KAFKA_BROKERS")),
            Map.entry(ProducerConfig.CLIENT_ID_CONFIG, ConfigurationManager.get("CLIENT_ID")),
            Map.entry(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName()),
            Map.entry(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName()),
            Map.entry(ProducerConfig.ACKS_CONFIG, ConfigurationManager.get("PRODUCER_ACK_CONFIG")),
            Map.entry(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG")),
            Map.entry("security.protocol", ConfigurationManager.get("SECURITY_PROTOCOL")),
            Map.entry("ssl.truststore.location", securityConfig.truststoreLocation().toString()),
            Map.entry("ssl.truststore.password", securityConfig.truststorePassword()),
            Map.entry("ssl.keystore.location", securityConfig.keystoreLocation().toString()),
            Map.entry("ssl.keystore.password", securityConfig.keystorePassword()),
            Map.entry("ssl.key.password", securityConfig.keyPassword())
        );
    }

    @Bean
    public ProducerFactory<String, String> producerFactory(Map<String, Object> producerConfig) {
        return new DefaultKafkaProducerFactory<>(producerConfig);
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate(
        @NonNull ProducerFactory<String, String> producerFactory
    ) {
        return new KafkaTemplate<>(Objects.requireNonNull(producerFactory));
    }
}

==================================================cgt=================================================>

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
 * Kafka producer configuration for Java 21 & Spring Boot 3+.
 * Modern conventions & best practices applied.
 */
@Configuration
public class KafkaProducerConfig {

    // Provide Kafka Producer configuration properties as a Spring bean
    @Bean
    public Map<String, Object> producerConfig() {
        var props = new HashMap<String, Object>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, ConfigurationManager.get("KAFKA_BROKERS"));
        props.put(ProducerConfig.CLIENT_ID_CONFIG, ConfigurationManager.get("CLIENT_ID"));
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, ConfigurationManager.get("PRODUCER_ACK_CONFIG"));
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, ConfigurationManager.get("ENABLE_IDEMPOTENCE_CONFIG"));

        // SSL config
        props.put("security.protocol", ConfigurationManager.get("SECURITY_PROTOCOL"));
        props.put("ssl.truststore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_TRUSTSTORE_FILE"));
        props.put("ssl.truststore.password", ConfigurationManager.get("SSL_TRUSTSTORE_PASSWORD"));
        props.put("ssl.keystore.location", Utils.getKafkaResourcePath() + ConfigurationManager.get("SSL_KEYSTORE_FILE"));
        props.put("ssl.keystore.password", ConfigurationManager.get("SSL_KEYSTORE_PASSWORD"));
        props.put("ssl.key.password", ConfigurationManager.get("SSL_KEY_PASSWORD"));
        return props;
    }

    // ProducerFactory bean using the producer config
    @Bean
    public ProducerFactory<String, String> producerFactory(Map<String, Object> producerConfig) {
        return new DefaultKafkaProducerFactory<>(producerConfig);
    }

    // KafkaTemplate bean for producing messages
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate(ProducerFactory<String, String> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }
}
