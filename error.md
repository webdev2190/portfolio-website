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
        gradlePluginPortal()
    }
    dependencies {
        classpath "org.springframework.boot:spring-boot-gradle-plugin:3.2.5"
        classpath "io.spring.gradle:dependency-management-plugin:1.1.7"
        classpath "org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:6.2.0.5505"
    }
}

plugins {
    id 'java'
    id 'eclipse'
    id 'idea'
    id 'org.springframework.boot'
    id 'io.spring.dependency-management'
    id 'org.sonarqube'
    id 'jacoco'
}

group = 'com.optum.pure'
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
    maven { url 'https://repo1.uhc.com/artifactory/libs-releases/' }
    maven {
        url 'https://repo1.uhc.com/artifactory/UHG-Snapshots/com/optum/'
        metadataSources { artifact() }
    }
    mavenCentral()
}

configurations {
    jacoco
    jacocoRuntime
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

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
        property 'sonar.jacoco.reportPaths', 'build/jacoco/tests.exec'
    }
}

/**
 * ✅ FIX for Gradle 8 config-cache
 */
def gitBranchProvider = providers.exec {
    commandLine 'git', 'describe', '--all'
}.standardOutput.asText.map { it.trim() }

dependencies {
    annotationProcessor "org.projectlombok:lombok:1.18.38"

    // ✅ Logging - let Spring Boot manage Logback (remove old 1.2.x)
    implementation "org.slf4j:slf4j-api:2.0.13"

    implementation "org.apache.tomcat.embed:tomcat-embed-core:9.0.105"
    implementation "org.springframework.boot:spring-boot-starter-web"
    implementation "org.springframework.boot:spring-boot-starter-actuator"
    testImplementation "org.springframework.boot:spring-boot-starter-test"

    implementation "org.springframework.kafka:spring-kafka:2.9.11"
    implementation "org.springframework:spring-web:5.3.42.optum-1"
    implementation "org.springframework:spring-webmvc:5.3.42"

    implementation "com.amazonaws:aws-java-sdk-s3:1.12.734"

    // log4j (separate from boot logging)
    implementation "org.apache.logging.log4j:log4j-api:2.17.1"
    implementation "org.apache.logging.log4j:log4j-core:2.17.1"

    implementation "javax.json:javax.json-api:1.0-b01"
    implementation "org.glassfish:javax.json:1.1"
    implementation "com.google.code.gson:gson:2.13.1"

    // Elasticsearch
    implementation "org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.15"
    implementation "org.elasticsearch.client:elasticsearch-rest-client:7.17.15"
    implementation "org.elasticsearch:elasticsearch:7.17.15"

    implementation "javax.servlet:javax.servlet-api:4.0.1"

    // Misc
    implementation "org.projectlombok:lombok:1.18.38"
    implementation "org.json:json:20231013"
    implementation "commons-io:commons-io:2.19.0"
    implementation "org.xerial.snappy:snappy-java:1.1.10.4"
    implementation "org.yaml:snakeyaml:2.0"

    // Jackson
    implementation "com.fasterxml.jackson.core:jackson-annotations:2.16.2"
    implementation "com.fasterxml.jackson.core:jackson-core:2.16.2"
    implementation "com.fasterxml.jackson.core:jackson-databind:2.16.2"

    // Testing
    testImplementation "junit:junit:4.13.2"
    testImplementation "org.jmockit:jmockit:1.19"
    testImplementation "org.powermock:powermock-api-mockito:1.6.5"
    testImplementation "org.powermock:powermock-module-junit4:1.6.5"
    testImplementation "org.mockito:mockito-core:1.10.19"

    // Jacoco
    jacoco "org.jacoco:org.jacoco.ant:0.7.9:nodeps"
    jacocoRuntime "org.jacoco:org.jacoco.agent:0.7.9:runtime"

    // ✅ Branch-based dependency logic (safe with config-cache)
    if (gitBranchProvider.get().contains("master")) {
        implementation "ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT"
    } else {
        implementation "ohhlpure.common.lib:ohhl-pure-shared-lib:1.0-SNAPSHOT"
    }
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
                systemProperty 'jacoco-agent.destfile', buildDir.path + '/jacoco/tests.exec'
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
                ant.file(file: buildDir.path + '/jacoco/tests.exec')
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
            from configurations.compileClasspath
            into 'dependencies'
        }
    }
}
