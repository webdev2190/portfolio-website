##### Set up config to test pure locally######

### for local testing, rename logback.xml to logback-backup.xml then logs will be written to the Console
### make sure pure-shared-lib is the right version, either from remote artifact or using local file (upate build.gradle to point to local file):
### compile files ('/Users/tle1003/Desktop/workspace/OHHL-project/orx-ls-ohhl-pure-shared-lib/build/libs/ohhl-pure-shared-lib-1.0-SNAPSHOT.jar')
### update /orx-ls-ohhl-pure/src/main/resources/config.properties with config section below depending on what env (dev/init-stage/ext-stage/prod) that wanted to perform testing
### Click on green icon to run/debug /orx-ls-ohhl-pure/src/main/java/com/optum/pure/Application.java
### when testing is done, stash the changes, don't commit to remote repo
### scale Prod pure and pure-consumer to zero before testing local end-point if testing with Prod env
### end-point: http://localhost:8080/deidentified-tokens/v2
### http://localhost:8080/claims-enrollments/v2/trackingIDxxxx

#####DEV Config####
#OOSS Properties
OOSS_ACCESS_KEY=59WLgPWncViMgKynBAht
OOSS_SECRET_KEY=SFFvohKuucBpstpYN4WRNyxQlp09lm5VjbW2YN05
OOSS_URL=s3api-core.uhc.com
OOSS_BUCKET=ohhl-pure

#ElasticSearch Properties
ES_HOSTNAME=928ffca9127b43c4b1272389d568ad58.ece.optum.com
ES_PORT=9200
ES_SCHEME=http
ES_USERNAME=ohhldeves
ES_PASSWORD=ohLOA31U
ES_TRACKING_STORE_INDEX=pure_tracking_store_test
ES_TOKEN_STORE_INDEX=pure_token_store_test
ES_FIELD_MAPPING_INDEX=pure_index_field_dev
ES_LOG_STORE_INDEX=pure_log_store_stage

#Kafka Properties
KAFKA_BROKERS=kaas-test-ctc-a.optum.com:443
SECURITY_PROTOCOL=SSL
SSL_TRUSTSTORE_FILE=kaas.nonprod.ctc.kaas.ohhl-pure.dev.truststore.jks
SSL_KEYSTORE_FILE=kaas.nonprod.ctc.kaas.ohhl-pure.dev.keystore.jks
SSL_KEYSTORE_PASSWORD=prmcert
SSL_KEY_PASSWORD=prmcert
SSL_TRUSTSTORE_PASSWORD=prmcert
CLIENT_ID=ohhlpure
TOPIC_NAME=kaas.ohhl-pure.dev
PRODUCER_ACK_CONFIG=all
ENABLE_IDEMPOTENCE_CONFIG=false

#Client Properties
VALID_CALLERID=test,devut,dev
VALID_TOKEN_TYPES=tokenType2
#####END DEV PROPERTIES####

#####int-stage Config####
#OOSS Properties
OOSS_ACCESS_KEY=59WLgPWncViMgKynBAht
OOSS_SECRET_KEY=SFFvohKuucBpstpYN4WRNyxQlp09lm5VjbW2YN05
OOSS_URL=s3api-core.uhc.com
OOSS_BUCKET=ohhl-pure

#ElasticSearch Properties
ES_HOSTNAME=928ffca9127b43c4b1272389d568ad58.ece.optum.com
ES_PORT=9200
ES_SCHEME=http
ES_USERNAME=ohhldeves
ES_PASSWORD=ohLOA31U
ES_TRACKING_STORE_INDEX=pure_tracking_store_test
ES_TOKEN_STORE_INDEX=pure_token_store_test
ES_FIELD_MAPPING_INDEX=pure_index_field_dev
ES_LOG_STORE_INDEX=pure_log_store_stage

#Kafka Properties
KAFKA_BROKERS=kaas-test-ctc-a.optum.com:443
SECURITY_PROTOCOL=SSL
SSL_TRUSTSTORE_FILE=kaas.nonprod.ctc.kaas.ohhl-pure.dev.truststore.jks
SSL_KEYSTORE_FILE=kaas.nonprod.ctc.kaas.ohhl-pure.dev.keystore.jks
SSL_KEYSTORE_PASSWORD=prmcert
SSL_KEY_PASSWORD=prmcert
SSL_TRUSTSTORE_PASSWORD=prmcert
CLIENT_ID=ohhlpure
TOPIC_NAME=kaas.ohhl-pure.internal-stage
PRODUCER_ACK_CONFIG=all
ENABLE_IDEMPOTENCE_CONFIG=false

#Client Properties
VALID_CALLERID=test,devut,dev
VALID_TOKEN_TYPES=tokenType2
#####END int-stage PROPERTIES####

#####ext-stage ELR-UAT config#####
##OOSS Properties
OOSS_ACCESS_KEY=DkmoHUmvFR5Nd83pFZJK
OOSS_SECRET_KEY=wECTxRM9WsCPosII4NMmp9QPO0baU1b8tzdXjbsT
OOSS_URL=s3api-core.optum.com
OOSS_BUCKET=ohhl-pure-stage

#ElasticSearch Properties
ES_HOSTNAME=462832d1d4374cd99a002784d657a262.ece.optum.com
ES_PORT=9200
ES_SCHEME=http
ES_USERNAME=ohhlprdes
ES_PASSWORD=Q!w2e3r5
ES_TRACKING_STORE_INDEX=pure_tracking_store_stage
ES_TOKEN_STORE_INDEX=pure_token_store_stage
ES_FIELD_MAPPING_INDEX=pure_index_field_dev
ES_LOG_STORE_INDEX=pure_log_store_stage

##Kafka Properties
KAFKA_BROKERS=kaas-prod-elr-a.optum.com:443
SECURITY_PROTOCOL=SSL
SSL_TRUSTSTORE_FILE=kaas.prod.elr.kaas.prod.elr.ohhl-pure.claims-and-elig-uat-elr.truststore.jks
SSL_KEYSTORE_FILE=kaas.prod.elr.kaas.prod.elr.ohhl-pure.claims-and-elig-uat-elr.keystore.jks
SSL_KEYSTORE_PASSWORD=prmcert
SSL_KEY_PASSWORD=prmcert
SSL_TRUSTSTORE_PASSWORD=prmcert
CLIENT_ID=ohhlpure
TOPIC_NAME=kaas.prod.elr.ohhl-pure.claims-and-elig-uat-elr
PRODUCER_ACK_CONFIG=all
ENABLE_IDEMPOTENCE_CONFIG=false

#Client Properties
VALID_CALLERID=test,devut,dev
VALID_TOKEN_TYPES=tokenType2
#### End ELR-UAT config

######ELR-PROD config####

##OOSS Properties (prod elr)
OOSS_ACCESS_KEY=DkmoHUmvFR5Nd83pFZJK
OOSS_SECRET_KEY=wECTxRM9WsCPosII4NMmp9QPO0baU1b8tzdXjbsT
OOSS_URL=s3api-core.optum.com
OOSS_BUCKET=ohhl-pure-prod

##ElasticSearch Properties
ES_HOSTNAME=462832d1d4374cd99a002784d657a262.ece.optum.com
ES_PORT=9200
ES_SCHEME=http
ES_USERNAME=ohhlprdes
ES_PASSWORD=Q!w2e3r5
ES_TRACKING_STORE_INDEX=pure_tracking_store_prod
ES_TOKEN_STORE_INDEX=pure_token_store_prod
ES_FIELD_MAPPING_INDEX=pure_index_field_dev
ES_LOG_STORE_INDEX=pure_log_store_prod

##Kafka Properties
KAFKA_BROKERS=kaas-prod-elr-a.optum.com:443
SECURITY_PROTOCOL=SSL
SSL_TRUSTSTORE_FILE=kaas.prod.elr.kaas.prod.elr.ohhl-pure.claims-and-elig-prod-elr.truststore.jks
SSL_KEYSTORE_FILE=kaas.prod.elr.kaas.prod.elr.ohhl-pure.claims-and-elig-prod-elr.keystore.jks
SSL_KEYSTORE_PASSWORD=prmcert
SSL_KEY_PASSWORD=prmcert
SSL_TRUSTSTORE_PASSWORD=prmcert
CLIENT_ID=ohhlpure
TOPIC_NAME=kaas.prod.elr.ohhl-pure.claims-and-elig-prod-elr
PRODUCER_ACK_CONFIG=all
ENABLE_IDEMPOTENCE_CONFIG=false

#Client Properties
VALID_CALLERID=test,devut,dev
VALID_TOKEN_TYPES=tokenType2

####End of ELR-PROD config#####

#####CTC-PROD Config####
##OOSS Properties
OOSS_ACCESS_KEY=DkmoHUmvFR5Nd83pFZJK
OOSS_SECRET_KEY=wECTxRM9WsCPosII4NMmp9QPO0baU1b8tzdXjbsT
OOSS_URL=s3api-core.optum.com
OOSS_BUCKET=ohhl-pure-prod

##ElasticSearch Properties
ES_HOSTNAME=0118015b88ab4d3095bb5c808a7870b0.ctc-ece.optum.com
ES_PORT=9200
ES_SCHEME=http
ES_USERNAME=ohhlprdes
ES_PASSWORD=Q!w2e3r5
ES_TRACKING_STORE_INDEX=pure_tracking_store_prod
ES_TOKEN_STORE_INDEX=pure_token_store_prod
ES_LOG_STORE_INDEX=pure_log_store_prod

##Kafka Properties
KAFKA_BROKERS=kaas-prod-ctc-a.optum.com:443
SECURITY_PROTOCOL=SSL
SSL_TRUSTSTORE_FILE=kaas.prod.ctc.kaas.prod.ctc.ohhl-pure.claims-and-elig-prod-ctc.truststore.jks
SSL_KEYSTORE_FILE=kaas.prod.ctc.kaas.prod.ctc.ohhl-pure.claims-and-elig-prod-ctc.keystore.jks
SSL_KEYSTORE_PASSWORD=prmcert
SSL_KEY_PASSWORD=prmcert
SSL_TRUSTSTORE_PASSWORD=prmcert
CLIENT_ID=ohhlpure
TOPIC_NAME=kaas.prod.ctc.ohhl-pure.claims-and-elig-prod-ctc
PRODUCER_ACK_CONFIG=all
ENABLE_IDEMPOTENCE_CONFIG=false
##Client Properties
VALID_CALLERID=test,devut,dev,stepwise-prod,stepwise-pre-sales-analytics
VALID_TOKEN_TYPES=tokenType2
#### End CTC-PROD config
