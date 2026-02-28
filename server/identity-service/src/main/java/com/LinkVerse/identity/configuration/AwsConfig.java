package com.LinkVerse.identity.configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class AwsConfig {
    private static final Logger logger = LoggerFactory.getLogger(AwsConfig.class);
    private static final String AWS_ACCESS_KEY = "AKIA6GBMBKOW3YMI5YEQ";
    private static final String AWS_SECRET_KEY = "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";
    private static final String REGION = "us-east-2";

    @Bean
    public AmazonS3 amazonS3() {
        try {
            BasicAWSCredentials awsCredentials = new BasicAWSCredentials(AWS_ACCESS_KEY, AWS_SECRET_KEY);
            return AmazonS3ClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                    .withRegion(REGION)
                    .build();
        } catch (Exception e) {
            logger.error("Error creating Amazon S3 client", e);
            throw new RuntimeException("Error creating Amazon S3 client", e);
        }
    }

}