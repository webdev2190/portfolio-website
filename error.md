This is the Gradle Orignal code


build script {
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
        classpath("org.springframework.boot:spring-boot-gradle-plugin:2.7.20.optum-2")
        classpath ("io.spring.gradle:dependency-management-plugin:1.0.15.RELEASE")
        classpath ("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:2.7")
    }
}

apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'idea'
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
apply plugin: 'org.sonarqube'

version =  '0.1.0'
bootJar {
    archiveBaseName.set('pure-service')
}

///springboot 2.7.x creates *-plain.jar; disable so that the build only create jar from bootJar
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
            artifact() }
    }
}

configurations {
    jacoco
    jacocoRuntime
}

sourceCompatibility = 1.8
targetCompatibility = 1.8

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


def gitBranch() {
    def branch = ""
    def proc = "git describe --all".execute()
    proc.in.eachLine { line -> branch = line }
    proc.err.eachLine { line -> println line }
    proc.waitFor()
    branch
}
print gitBranch()

dependencies {
    annotationProcessor "org.projectlombok:lombok:1.18.38"
    implementation 'org.apache.tomcat.embed:tomcat-embed-core:9.0.107'
    implementation 'org.apache.tomcat:tomcat-coyote:9.0.107'
    implementation 'org.apache.tomcat:tomcat-util:9.0.107'
    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation('org.springframework.boot:spring-boot-starter-test')
    implementation group: 'org.springframework.kafka', name: 'spring-kafka',version: '2.9.11'
    implementation group: 'org.springframework', name: 'spring-web',version:'5.3.42.optum-1'
    implementation group: 'org.springframework', name: 'spring-webmvc',version:'5.3.42'
    implementation 'com.amazonaws:aws-java-sdk-s3:1.12.734'
    implementation 'org.apache.logging.log4j:log4j-api:2.17.1'
    implementation 'org.apache.logging.log4j:log4j-core:2.17.1'
    implementation group: 'javax.json', name: 'javax.json-api', version: '1.0-b01'
    implementation group: 'com.google.code.gson', name: 'gson', version: '2.13.1'
    implementation group: 'org.glassfish', name: 'javax.json', version: '1.1'
    //elastic rest high level client
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.15'
    implementation 'org.elasticsearch.client:elasticsearch-rest-client:7.17.15'
    implementation 'org.elasticsearch:elasticsearch:7.17.15'
    //JMockit dependencies
    testImplementation group: 'org.jmockit', name: 'jmockit', version: '1.19'
    //Kafka dependencies
    implementation group: 'org.apache.kafka', name: 'kafka-clients'
    implementation group: 'org.projectlombok', name: 'lombok', version: '1.18.38'
    implementation group: 'org.json', name: 'json', version: '20231013'
    testImplementation group: 'org.powermock', name: 'powermock-api-mockito', version: '1.6.5'
    testImplementation group: 'org.powermock', name: 'powermock-module-junit4', version: '1.6.5'
    testImplementation group: 'org.mockito', name: 'mockito-core', version: '1.10.19'
    jacoco group: 'org.jacoco', name: 'org.jacoco.ant', version: '0.7.9', classifier: 'nodeps'
    jacocoRuntime group: 'org.jacoco', name: 'org.jacoco.agent', version: '0.7.9', classifier: 'runtime'
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-annotations',version:'2.16.2'
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-core',version:'2.16.2'
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-databind',version:'2.16.2'
    testImplementation 'junit:junit:4.13.2'
    implementation group: 'commons-io', name: 'commons-io', version: '2.19.0'
    implementation group: 'org.springframework.boot', name: 'spring-boot-starter-actuator'
    implementation 'org.xerial.snappy:snappy-java:1.1.10.4'
    implementation 'ch.qos.logback:logback-core:1.2.13'
    implementation 'ch.qos.logback:logback-classic:1.2.13'
    implementation group: 'org.yaml', name:'snakeyaml', version:'2.0'
    //PURE common lib dep
    if(gitBranch().equals("heads/master") || gitBranch().equals("remotes/origin/master")) {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '2.0-SNAPSHOT'
    }else {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '1.0-SNAPSHOT'
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
            from configurations.compile
            into 'dependencies'
        }
    }
}

I want to modify this code like above all version i need like this

buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath 'org.springframework.boot:spring-boot-gradle-plugin:3.2.2'
        classpath 'io.spring.gradle:dependency-management-plugin:1.1.5'
        classpath "org.sonarqube.gradle.plugin:org.sonarqube.gradle.plugin:6.0.0.5145"
    }
}

plugins {
    id 'java'
    id 'eclipse'
    id 'idea'
    id 'jacoco'
}

apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
apply plugin: 'org.sonarqube'

//This will ensure commons-logging.jar is excluded from all configurations.
configurations.all {
    exclude group: 'commons-logging', module: 'commons-logging'
}

group = 'com.optum.pure'
version = '0.1.0'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
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
        property 'sonar.com.optum.pure', 'pure'
        property 'sonar.host.url', 'http://localhost:9000'
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
    implementation files('C:/Users/ahaldar1/Desktop/workspace/OHHL-project/orx-ls-ohhl-pure-shared-lib/build/libs/ohhl-pure-shared-lib-1.0-SNAPSHOT.jar')

    // Lombok
    compileOnly 'org.projectlombok:lombok:1.18.32'
    annotationProcessor 'org.projectlombok:lombok:1.18.32'

    // SLF4J (for logging)
    implementation 'org.slf4j:slf4j-api:2.0.13'

    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.kafka:spring-kafka:3.1.2'
    implementation 'org.springframework:spring-context:6.1.6'

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
    implementation 'org.springframework.boot:spring-boot-starter-web'

    // PURE common lib dep, pick version based on branch
    if (gitBranch() == "master" || gitBranch() == "origin/master") {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:2.0-SNAPSHOT'
    } else {
        implementation 'ohhlpure.common.lib:ohhl-pure-shared-lib:1.0-SNAPSHOT'
    }

    // TESTS
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mockito:mockito-core:5.2.0'
    testImplementation 'org.assertj:assertj-core:3.25.3'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
    testImplementation 'org.apache.commons:commons-io:1.3.2'
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

test {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
    minHeapSize = "512m"
    maxHeapSize = "4096m"
    forkEvery = 0
    maxParallelForks = 1
    testLogging {
        events "passed", "skipped", "failed"
    }
}
