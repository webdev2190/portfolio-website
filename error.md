Error i got 

3 actionable tasks: 1 executed, 2 up-to-date
SLF4J(W): No SLF4J providers were found.
SLF4J(W): Defaulting to no-operation (NOP) logger implementation
SLF4J(W): See https://www.slf4j.org/codes.html#noProviders for further details.
SLF4J(W): Class path contains SLF4J bindings targeting slf4j-api versions 1.7.x or earlier.
SLF4J(W): Ignoring binding found at [jar:file:/C:/Users/ahaldar1/Producer-Pure/orx-ls-ohhl-pure/caches/modules-2/files-2.1/ch.qos.logback/logback-classic/1.2.13/e9f3458e7354fe4917081237c01fa4999f4e1b86/logback-classic-1.2.13.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J(W): See https://www.slf4j.org/codes.html#ignoredBindings for an explanation.
Exception in thread "main" java.lang.IllegalArgumentException: LoggerFactory is not a Logback LoggerContext but Logback is on the classpath. Either remove Logback or the competing implementation (class org.slf4j.helpers.NOPLoggerFactory loaded from file:/C:/Users/ahaldar1/Producer-Pure/orx-ls-ohhl-pure/caches/modules-2/files-2.1/org.slf4j/slf4j-api/2.0.13/80229737f704b121a318bba5d5deacbcf395bc77/slf4j-api-2.0.13.jar). If you are using WebLogic you will need to add 'org.slf4j' to prefer-application-packages in WEB-INF/weblogic.xml: org.slf4j.helpers.NOPLoggerFactory
	at org.springframework.util.Assert.instanceCheckFailed(Assert.java:592)
	at org.springframework.util.Assert.isInstanceOf(Assert.java:511)
	at org.springframework.boot.logging.logback.LogbackLoggingSystem.getLoggerContext(LogbackLoggingSystem.java:396)
	at org.springframework.boot.logging.logback.LogbackLoggingSystem.beforeInitialize(LogbackLoggingSystem.java:124)
	at org.springframework.boot.context.logging.LoggingApplicationListener.onApplicationStartingEvent(LoggingApplicationListener.java:238)
	at org.springframework.boot.context.logging.LoggingApplicationListener.onApplicationEvent(LoggingApplicationListener.java:220)
	at org.springframework.context.event.SimpleApplicationEventMulticaster.doInvokeListener(SimpleApplicationEventMulticaster.java:185)
	at org.springframework.context.event.SimpleApplicationEventMulticaster.invokeListener(SimpleApplicationEventMulticaster.java:178)
	at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:156)
	at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:138)
	at org.springframework.boot.context.event.EventPublishingRunListener.multicastInitialEvent(EventPublishingRunListener.java:136)
	at org.springframework.boot.context.event.EventPublishingRunListener.starting(EventPublishingRunListener.java:75)
	at org.springframework.boot.SpringApplicationRunListeners.lambda$starting$0(SpringApplicationRunListeners.java:54)
	at java.base/java.lang.Iterable.forEach(Iterable.java:75)
	at org.springframework.boot.SpringApplicationRunListeners.doWithListeners(SpringApplicationRunListeners.java:118)
	at org.springframework.boot.SpringApplicationRunListeners.starting(SpringApplicationRunListeners.java:54)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:326)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1354)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1343)
	at com.optum.pure.Application.main(Application.java:16)

FAILURE: Build completed with 2 failures.

1: Task failed with an exception.
-----------
* What went wrong:
Execution failed for task ':com.optum.pure.Application.main()'.
> Process 'command 'C:\Program Files\Eclipse Adoptium\jdk-21.0.2.13-hotspot\bin\java.exe'' finished with non-zero exit value 1

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.
==============================================================================

2: Task failed with an exception.
-----------
* Where:
Build file 'C:\Users\ahaldar1\PURE-TEST\orx-ls-ohhl-pure\build.gradle' line: 274

* What went wrong:
Configuration cache problems found in this build.

3 problems were found storing the configuration cache, 1 of which seems unique.
- Build file 'build.gradle': line 274: external process started 'git describe --all'
  See https://docs.gradle.org/8.8/userguide/configuration_cache.html#config_cache:requirements:external_processes

See the complete report at file:///C:/Users/ahaldar1/PURE-TEST/orx-ls-ohhl-pure/build/reports/configuration-cache/6v6yqdhi3hdttrtma70jpyfq1/1nmeyo062iw52zoinqnpb6jgp/configuration-cache-report.html
> Starting an external process 'git describe --all' during configuration time is unsupported.

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.
==============================================================================

BUILD FAILED in 14s
Configuration cache entry discarded with 3 problems.
10:46:30: Execution finished ':com.optum.pure.Application.main()'.

And this is my gradle code

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
        classpath("org.springframework.boot:spring-boot-gradle-plugin:3.2.5")
        classpath("io.spring.gradle:dependency-management-plugin:1.1.7")
        classpath("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:6.2.0.5505")
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
}

configurations {
    jacoco
    jacocoRuntime
}

sourceCompatibility = JavaVersion.VERSION_21
targetCompatibility = JavaVersion.VERSION_21

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


    implementation 'org.slf4j:slf4j-api:2.0.13'
    implementation 'ch.qos.logback:logback-classic:1.4.11'


    implementation 'org.apache.tomcat.embed:tomcat-embed-core:9.0.105'
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
    implementation 'org.elasticsearch.client:elasticsearch-rest-high-level-client:7.17.15'
    implementation 'org.elasticsearch.client:elasticsearch-rest-client:7.17.15'
   // implementation 'jakarta.servlet:jakarta.servlet-api:6.0.0'
    implementation 'javax.servlet:javax.servlet-api:4.0.1'
    implementation 'org.elasticsearch:elasticsearch:7.17.15'
    testImplementation group: 'org.jmockit', name: 'jmockit', version: '1.19'
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
    if(gitBranch().equals("heads/master") || gitBranch().equals("remotes/origin/master")) {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '2.0-SNAPSHOT'
    } else {
        implementation group: 'ohhlpure.common.lib', name: 'ohhl-pure-shared-lib', version: '2.0-SNAPSHOT'
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

