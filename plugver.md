// This is a Gradle build script for the Pure Service project.
plugins {
    id 'java'
    id 'eclipse'
    id 'idea'
    id 'org.springframework.boot' version '3.5.0'
    id 'io.spring.dependency-management' version '1.1.5'
    id 'org.sonarqube' version '6.0.0.5145'  // Updated SonarQube version

    id 'jacoco'
}

group = 'com.optum.pure'
version = '0.1.0'

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

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
        url 'https://repo1.uhc.com/artifactory/libs-releases/'
    }
    maven {
        url 'https://repo1.uhc.com/artifactory/UHG-Snapshots/com/optum/'
        metadataSources { artifact() }
    }
}



bootJar {
    archiveBaseName.set('pure-service')
}

jar {
    enabled = false
}

dependencyManagement {
    imports {
        mavenBom 'com.amazonaws:aws-java-sdk-bom:1.12.743'
    }
    resolutionStrategy {
        cacheChangingModulesFor 0, 'seconds'
    }
}

sonarqube {
    properties {
        property 'sonar.projectName', 'pure'
        property 'sonar.jacoco.reportPaths', 'build/jacoco/test.exec'
        // Add further Sonar properties if needed
    }
}

def gitBranch() {
    def branch = ""
    def proc = "git rev-parse --abbrev-ref HEAD".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    return branch
}
println gitBranch()

dependencies {

    // Lombok
    compileOnly 'org.projectlombok:lombok:1.18.32'
    annotationProcessor 'org.projectlombok:lombok:1.18.32'

    // SLF4J (for logging)
    implementation 'org.slf4j:slf4j-api:2.0.13'


    annotationProcessor "org.projectlombok:lombok:1.18.32"
    implementation "org.projectlombok:lombok:1.18.32"

    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.kafka:spring-kafka:3.1.2'
    implementation 'org.springframework:spring-context:6.1.6'

    implementation 'org.apache.tomcat.embed:tomcat-embed-core:10.1.24'
    implementation 'com.amazonaws:aws-java-sdk-s3:1.12.743'
    implementation 'org.apache.logging.log4j:log4j-api:2.23.1'
    implementation 'org.apache.logging.log4j:log4j-core:2.23.1'
    implementation 'com.google.code.gson:gson:2.11.0'
    implementation 'org.glassfish:jakarta.json:2.0.1'
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.18'
    implementation 'org.elasticsearch.client:elasticsearch-rest-client:7.17.18'
    implementation 'org.elasticsearch:elasticsearch:7.17.18'
    implementation 'org.apache.kafka:kafka-clients:3.7.0'
    implementation 'org.json:json:20240303'
    implementation 'org.yaml:snakeyaml:2.2'
    implementation 'ch.qos.logback:logback-core:1.5.6'
    implementation 'ch.qos.logback:logback-classic:1.5.6'
    implementation 'commons-io:commons-io:2.16.1'
    implementation 'org.xerial.snappy:snappy-java:1.1.10.5'
    implementation 'com.fasterxml.jackson.core:jackson-annotations:2.17.1'
    implementation 'com.fasterxml.jackson.core:jackson-core:2.17.1'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.1'
    implementation 'jakarta.servlet:jakarta.servlet-api:6.0.0'


    // PURE common lib dep, pick version based on branch
    if (gitBranch() == "master" || gitBranch() == "origin/master") {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT'
    } else {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:1.0-SNAPSHOT'
    }

    // TESTS
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mockito:mockito-core:5.2.0'
//    testImplementation 'org.mockito:mockito-junit-jupiter:5.2.0'
    testImplementation 'org.assertj:assertj-core:3.25.3'
//    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
    testImplementation 'org.apache.commons:commons-io:1.3.2'
//    testImplementation 'org.mockito:mockito-inline:5.2.0'


    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
//    testRuntimeOnly 'org.junit.platform:junit-platform-launcher:1.10.2
    testImplementation 'org.mockito:mockito-core:5.2.0'

//    testImplementation 'junit:junit:4.13.2' // JUnit 4 for legacy tests
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
    into 'dependencies'
}
