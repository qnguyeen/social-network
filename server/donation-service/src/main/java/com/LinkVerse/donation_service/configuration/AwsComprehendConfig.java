package com.LinkVerse.donation_service.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.comprehend.ComprehendClient;

@Configuration
public class AwsComprehendConfig {
    private static final String AWS_ACCESS_KEY = "AKIA6GBMBKOW3YMI5YEQ";
    private static final String AWS_SECRET_KEY = "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";
    private static final String REGION = "us-east-2";

    @Bean
    public ComprehendClient amazonComprehend() {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(AWS_ACCESS_KEY, AWS_SECRET_KEY);
        return ComprehendClient.builder()
                .region(Region.US_EAST_2) // specify the region
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }
}
