buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
        maven {
            url 'https://repo1.uhc.com/artifactory/repoauth'
            credentials {
                username = System.getenv("DOCKER_USERNAME")
                password = System.getenv("DOCKER_PASSWORD")
            }
        }
    }
    dependencies {
        classpath "org.springframework.boot:spring-boot-gradle-plugin:3.2.2"
        classpath "io.spring.gradle:dependency-management-plugin:1.1.5"
        classpath "org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:4.4.1.3373"
    }
}

apply plugin: "java"
apply plugin: "eclipse"
apply plugin: "idea"
apply plugin: "jacoco"
apply plugin: "org.springframework.boot"
apply plugin: "io.spring.dependency-management"
apply plugin: "org.sonarqube"

// Project metadata
group   = "com.optum.pure"
version = "0.1.0"

// Java toolchain
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

// Repository configuration
repositories {
    mavenCentral()
    gradlePluginPortal()
    maven {
        url 'https://artifacts.elastic.co/maven'
    }
    maven {
        url 'https://repo1.uhc.com/artifactory/repoauth'
        credentials {
            username = System.getenv("DOCKER_USERNAME")
            password = System.getenv("DOCKER_PASSWORD")
        }
    }
    maven {
        url 'https://repo1.uhc.com/artifactory/libs-releases/"
    }
    maven {
        url 'https://repo1.uhc.com/artifactory/UHG-Snapshots/com/optum/'
        metadataSources { artifact() }
    }
}

// BootJar settings
bootJar {
    archiveBaseName.set("pure-service")
}

// Disable plain jar
jar {
    enabled = false
}

// Exclude conflicting commons-logging
configurations.all {
    exclude group: "commons-logging", module: "commons-logging"
}

// SonarQube config
sonarqube {
    properties {
        property "sonar.projectKey", "pure"
        property "sonar.host.url", "http://localhost:9000"
        property "sonar.jacoco.reportPaths", "build/jacoco/test.exec"
    }
}

// Git branch helper
def gitBranch() {
    def branch = ""
    def proc = "git rev-parse --abbrev-ref HEAD".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    branch
}
println "Active Git branch: ${gitBranch()}"

// Dependencies
dependencies {
    // Lombok
    compileOnly "org.projectlombok:lombok:1.18.32"
    annotationProcessor "org.projectlombok:lombok:1.18.32"

    // Logging
    implementation "org.slf4j:slf4j-api:2.0.13"
    implementation "ch.qos.logback:logback-core:1.5.6"
    implementation "ch.qos.logback:logback-classic:1.5.6"
    implementation "org.apache.logging.log4j:log4j-api:2.23.1"
    implementation "org.apache.logging.log4j:log4j-core:2.23.1"

    // Spring Boot + Kafka
    implementation "org.springframework.boot:spring-boot-starter-actuator"
    implementation "org.springframework.boot:spring-boot-starter-validation"
    implementation "org.springframework.boot:spring-boot-starter-web"
    implementation "org.springframework.kafka:spring-kafka:3.1.2"

    // AWS SDK (direct dep instead of BOM)
    implementation "com.amazonaws:aws-java-sdk-s3:1.12.743"

    // JSON/YAML
    implementation "com.google.code.gson:gson:2.11.0"
    implementation "org.json:json:20240303"
    implementation "org.yaml:snakeyaml:2.2"
    implementation "org.glassfish:jakarta.json:2.0.1"
    implementation "com.fasterxml.jackson.core:jackson-annotations:2.17.1"
    implementation "com.fasterxml.jackson.core:jackson-core:2.17.1"
    implementation "com.fasterxml.jackson.core:jackson-databind:2.17.1"

    // Elasticsearch
    implementation "org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.18"
    implementation "org.elasticsearch.client:elasticsearch-rest-client:7.17.18"
    implementation "org.elasticsearch:elasticsearch:7.17.18"

    // Kafka
    implementation "org.apache.kafka:kafka-clients:3.7.0"

    // Misc
    implementation "commons-io:commons-io:2.16.1"
    implementation "org.xerial.snappy:snappy-java:1.1.10.5"
    implementation "jakarta.servlet:jakarta.servlet-api:6.0.0"

    // PURE shared lib – dynamic per branch
    if (gitBranch() == "master" || gitBranch() == "origin/master") {
        implementation "ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT"
    } else {
        implementation "ohhlpure.common.lib:ohhl-pure-shared-lib:1.0-SNAPSHOT"
    }

    // Tests
    testImplementation "org.springframework.boot:spring-boot-starter-test"
    testImplementation "org.mockito:mockito-core:5.2.0"
    testImplementation "org.assertj:assertj-core:3.25.3"
    testImplementation "org.junit.jupiter:junit-jupiter:5.10.2"
}

tasks.withType(Test).configureEach {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
}

jacoco {
    toolVersion = "0.8.11"
}

jacocoTestReport {
    dependsOn test
    reports {
        xml.required = true
        html.required = true
    }
}

task copyDependencies(type: Copy) {
    from configurations.runtimeClasspath
    into "dependencies"
}
