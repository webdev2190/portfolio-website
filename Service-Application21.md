import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;

import java.time.Clock;
import java.util.concurrent.Executors;

/**
 * Modernized Spring Boot application entry point with Java 21 features
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        var app = new SpringApplication(Application.class);
        
        // Java 21 virtual threads configuration
        app.setApplicationStartup(new BufferingApplicationStartup(2048));
        app.setTaskExecutor(Executors.newVirtualThreadPerTaskExecutor());
        
        // Modern application context customization
        app.addInitializers(context -> {
            context.getBeanFactory().registerResolvableDependency(
                Clock.class, 
                Clock.systemDefaultZone()
            );
        });

        // Run with Java 21 structured concurrency
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            scope.fork(() -> {
                app.run(args);
                return null;
            });
            scope.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApplicationStartupException("Application startup interrupted", e);
        }
    }

    public static final class ApplicationStartupException extends RuntimeException {
        public ApplicationStartupException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

===================================================cgt====================================================

package com.optum.pure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the PURE Spring Boot application.
 * Java 21 & Spring Boot 3+ ready.
 */
@SpringBootApplication
public final class Application {

    public static void main(String[] args) {
        // Recommended: Set system property for UTF-8 (default in Java 21 but explicit is safer)
        System.setProperty("file.encoding", "UTF-8");
        SpringApplication.run(Application.class, args);
    }
}
