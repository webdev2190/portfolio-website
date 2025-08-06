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

error

C:\Users\ahaldar1\PURE-TEST\orx-ls-ohhl-pure\src\main\java\com\optum\pure\config\PureConfig.java:3: error: package com.optum.pure.filestore does not exist
import com.optum.pure.filestore.FileStore;
