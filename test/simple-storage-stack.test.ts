// simple-storage-stack.test.ts
import { SimpleStorageStack } from '../lib/simple_storage_stack-stack';
import {simpleStorageProps} from '../lib/simple_storage_stack-stack';

import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';

describe('SimpleStorageStack', () => {
    test('should create a SimpleStorageStack with the specified properties', () => {
        // Arrange
        const app = new App();
        const stackProps: simpleStorageProps = {
            // Provide necessary properties for your stack
            // Example: key: 'value',
        };

        // Act
        const stack = new SimpleStorageStack(app, 'TestSimpleStorageStack', stackProps);

        // Assert
        // Check for the existence of S3 bucket resources in the CloudFormation template
        expectCDK(stack).to(haveResource('AWS::S3::Bucket', {
            BucketName: 'LogBucket', // Adjust with your actual bucket name
            // Add more properties to check
        }));

        expectCDK(stack).to(haveResource('AWS::S3::Bucket', {
            BucketName: 'nexus3-blobstore', // Adjust with your actual bucket name
            // Add more properties to check
        }));

        // Add more assertions based on your specific resources and properties
    });
});
