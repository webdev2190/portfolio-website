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

@Configuration
@ComponentScan("com.optum.pure")
public class PureConfig {

    @Bean
    public TrackingStore trackingStore() {
        return TrackingStoreFactory.create(); // Modern factory method
    }

    @Bean
    public FileStore fileStore() {
        return FileStoreFactory.create();
    }

    @Bean
    public LogStore logStore() {
        return LogStoreFactory.create();
    }
}
=============================================Cgt=====================================

package com.optum.pure.config;

import com.optum.pure.filestore.FileStore;
import com.optum.pure.filestore.factory.FileStoreFactory;
import com.optum.pure.logstore.LogStore;
import com.optum.pure.logstore.factory.LogStoreFactory;
import com.optum.pure.trackingstore.TrackingStore;
import com.optum.pure.trackingstore.factory.TrackingStoreFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Modernized Spring configuration class for Java 21+ and Spring Boot 3+.
 * - Uses Java 21 features and current Spring best practices.
 */
@Configuration
public class PureConfig {

    // Define bean for TrackingStore using factory method reference
    @Bean
    public TrackingStore trackingStore() {
        return TrackingStoreFactory.getTrackingStore();
    }

    // Define bean for FileStore using factory method reference
    @Bean
    public FileStore fileStore() {
        return FileStoreFactory.getFileStore();
    }

    // Define bean for LogStore using factory method reference
    @Bean
    public LogStore logStore() {
        return LogStoreFactory.getLogStore();
    }
}
