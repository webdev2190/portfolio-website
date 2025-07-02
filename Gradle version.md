buildscript {
    repositories {
        maven {
            url 'https://repo1.uhc.com/artifactory/repoauth'
            credentials {
                username = System.getenv("DOCKER_USERNAME")
                password = System.getenv("DOCKER_PASSWORD")
            }
        }
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:3.2.0") // Updated for Java 21
        classpath("io.spring.gradle:dependency-management-plugin:1.1.4") // Updated version
        classpath("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:4.4.1.3373") // Updated version
    }
}

apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'idea'
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
apply plugin: 'org.sonarqube'

version = '0.1.0'
bootJar {
    archiveBaseName.set('pure-service')
}

jar {
    enabled = false
}

repositories {
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
        metadataSources {
            artifact()
        }
    }
    mavenCentral() // Added for better dependency resolution
}

configurations {
    jacoco
    jacocoRuntime
}

sourceCompatibility = 21 // Updated to Java 21
targetCompatibility = 21 // Updated to Java 21

dependencyManagement {
    imports {
        mavenBom 'com.amazonaws:aws-java-sdk-bom:1.12.734'
    }
    resolutionStrategy {
        cacheChangingModulesFor 0, 'seconds'
    }
}

sonarqube {
    properties {
        property 'sonar.projectName', 'pure'
        property 'sonar.jacoco.reportPaths', 'build/jacoco/test.exec' // Updated path
    }
}

def gitBranch() {
    def branch = ""
    def proc = "git describe --all".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    branch
}

dependencies {
    // Updated dependencies for Java 21 and Spring Boot 3.x
    annotationProcessor "org.projectlombok:lombok:1.18.30"
    implementation 'org.apache.tomcat.embed:tomcat-embed-core:10.1.15' // Updated for Java 21
    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation('org.springframework.boot:spring-boot-starter-test') {
        exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
    }
    
    implementation group: 'org.springframework.kafka', name: 'spring-kafka', version: '3.1.0' // Updated
    implementation group: 'org.springframework', name: 'spring-web', version: '6.1.0' // Updated
    implementation group: 'org.springframework', name: 'spring-webmvc', version: '6.1.0' // Updated
    implementation 'com.amazonaws:aws-java-sdk-s3:1.12.734'
    implementation 'org.apache.logging.log4j:log4j-api:2.22.0' // Updated
    implementation 'org.apache.logging.log4j:log4j-core:2.22.0' // Updated
    implementation group: 'javax.json', name: 'javax.json-api', version: '1.1.4' // Updated
    implementation group: 'com.google.code.gson', name: 'gson', version: '2.10.1' // Updated
    implementation group: 'org.glassfish', name: 'javax.json', version: '1.1.4' // Updated
    
    // Elasticsearch updated to 8.x for Java 21 compatibility
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:8.11.1'
    implementation 'org.elasticsearch.client:elasticsearch-rest-client:8.11.1'
    implementation 'org.elasticsearch:elasticsearch:8.11.1'
    
    // Test dependencies updated
    testImplementation group: 'org.junit.jupiter', name: 'junit-jupiter-api', version: '5.10.0'
    testRuntimeOnly group: 'org.junit.jupiter', name: 'junit-jupiter-engine', version: '5.10.0'
    testImplementation group: 'org.mockito', name: 'mockito-core', version: '5.6.0'
    testImplementation group: 'org.mockito', name: 'mockito-junit-jupiter', version: '5.6.0'
    
    implementation group: 'org.projectlombok', name: 'lombok', version: '1.18.30'
    implementation group: 'org.json', name: 'json', version: '20231013'
    
    jacoco group: 'org.jacoco', name: 'org.jacoco.ant', version: '0.8.11', classifier: 'nodeps' // Updated
    jacocoRuntime group: 'org.jacoco', name: 'org.jacoco.agent', version: '0.8.11', classifier: 'runtime' // Updated
    
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-annotations', version: '2.15.3' // Updated
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-core', version: '2.15.3' // Updated
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-databind', version: '2.15.3' // Updated
    
    implementation group: 'commons-io', name: 'commons-io', version: '2.15.1' // Updated
    implementation group: 'org.springframework.boot', name: 'spring-boot-starter-actuator'
    implementation 'org.springframework:spring-context:6.1.0' // Updated
    implementation 'org.xerial.snappy:snappy-java:1.1.10.4'
    implementation 'ch.qos.logback:logback-core:1.4.11' // Updated
    implementation 'ch.qos.logback:logback-classic:1.4.11' // Updated
    implementation group: 'org.yaml', name: 'snakeyaml', version: '2.2' // Updated
    
    // PURE common lib dep
    if (gitBranch().equals("heads/master") || gitBranch().equals("remotes/origin/master")) {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '2.0-SNAPSHOT'
    } else {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '1.0-SNAPSHOT'
    }
}

tasks.named('test') {
    useJUnitPlatform()
}

task instrument(dependsOn: ['classes']) {
    ext.outputDir = file("${buildDir}/classes-instrumented")
    doLast {
        ant.taskdef(name: 'instrument',
                classname: 'org.jacoco.ant.InstrumentTask',
                classpath: configurations.jacoco.asPath)
        ant.instrument(destdir: outputDir) {
            fileset(dir: sourceSets.main.output.classesDirs.singleFile)
        }
    }
}

gradle.taskGraph.whenReady { graph ->
    if (graph.hasTask(instrument)) {
        tasks.withType(Test) {
            doFirst {
                systemProperty 'jacoco-agent.destfile', buildDir.path + '/jacoco/test.exec'
                classpath = files(instrument.outputDir) + classpath + configurations.jacocoRuntime
            }
        }
    }
}

task report(dependsOn: ['instrument', 'test']) {
    doLast {
        ant.taskdef(name: 'report',
                classname: 'org.jacoco.ant.ReportTask',
                classpath: configurations.jacoco.asPath)
        ant.report() {
            executiondata {
                ant.file(file: buildDir.path + '/jacoco/test.exec')
            }
            structure(name: 'Example') {
                classfiles {
                    fileset(dir: sourceSets.main.output.classesDirs.singleFile)
                }
                sourcefiles {
                    fileset(dir: 'src/main/java')
                }
            }
            xml(destfile: buildDir.path + '/reports/tests/jacocoTestReport.xml')
        }
    }
}

task copyDependencies {
    doLast {
        copy {
            from configurations.runtimeClasspath
            into 'dependencies'
        }
    }
}

=======================================================Spring Boot 3.5.0=======================================

buildscript {
    repositories {
        maven {
            url 'https://repo1.uhc.com/artifactory/repoauth'
            credentials {
                username = System.getenv("DOCKER_USERNAME")
                password = System.getenv("DOCKER_PASSWORD")
            }
        }
        mavenCentral()
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:3.2.5")
        classpath("io.spring.gradle:dependency-management-plugin:1.1.4")
        classpath("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:4.4.1.3373")
    }
}

plugins {
    id 'java'
    id 'eclipse'
    id 'idea'
    id 'org.springframework.boot' version '3.2.5'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'org.sonarqube' version '4.4.1.3373'
    id 'jacoco'
}

group = 'com.yourcompany'
version = '0.1.0'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
        vendor = JvmVendorSpec.ADOPTIUM
    }
}

bootJar {
    archiveBaseName = 'pure-service'
}

jar {
    enabled = false
}

repositories {
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
    mavenCentral()
}

dependencyManagement {
    imports {
        mavenBom 'com.amazonaws:aws-java-sdk-bom:1.12.734'
    }
}

sonarqube {
    properties {
        property 'sonar.projectName', 'pure'
        property 'sonar.java.coveragePlugin', 'jacoco'
        property 'sonar.coverage.jacoco.xmlReportPaths', layout.buildDirectory.file("reports/jacoco/test/jacocoTestReport.xml").get().asFile
    }
}

configurations {
    jacocoAgent
}

dependencies {
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.kafka:spring-kafka'
    
    // AWS
    implementation 'com.amazonaws:aws-java-sdk-s3'
    
    // Logging
    implementation 'org.apache.logging.log4j:log4j-api:2.23.1'
    implementation 'org.apache.logging.log4j:log4j-core:2.23.1'
    
    // JSON
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.0'
    implementation 'org.json:json:20240303'
    
    // Elasticsearch
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:8.13.4'
    
    // Utilities
    implementation 'org.apache.commons:commons-io:2.16.1'
    implementation 'org.yaml:snakeyaml:2.2'
    compileOnly 'org.projectlombok:lombok:1.18.32'
    annotationProcessor 'org.projectlombok:lombok:1.18.32'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
    testImplementation 'org.mockito:mockito-junit-jupiter:5.11.0'
    
    // Jacoco
    jacocoAgent 'org.jacoco:org.jacoco.agent:0.8.12'
    
    // UHG-specific
    if (gitBranch() == 'heads/master' || gitBranch() == 'remotes/origin/master') {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT'
    } else {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:1.0-SNAPSHOT'
    }
}

def gitBranch() {
    def branch = ""
    def proc = "git describe --all".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    branch
}

tasks.named('test') {
    useJUnitPlatform()
    jvmArgs "-javaagent:${configurations.jacocoAgent.singleFile}=destfile=${layout.buildDirectory.file('jacoco/test.exec').get().asFile}"
    finalizedBy jacocoTestReport
}

tasks.named('jacocoTestReport', JacocoReport) {
    dependsOn test
    reports {
        xml.required = true
        html.required = true
    }
}

tasks.register('copyDependencies', Copy) {
    from configurations.runtimeClasspath
    into layout.buildDirectory.dir('dependencies')
}
