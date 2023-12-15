// rds-data-stack.test.ts
import { RDSDataStack } from '../lib/rds-data-stack';
import { RDSDataStackProps } from '../lib/rds-data-stack'; // Assuming you have a file for RDSDataStackProps

import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';

describe('RDSDataStack', () => {
    test('should create an RDSDataStack with the specified properties', () => {
        // Arrange
        const app = new App();
        const stackProps: RDSDataStackProps = {
            // Provide necessary properties for your stack
            // Example: key: 'value',
        };

        // Act
        const stack = new RDSDataStack(app, 'TestRDSDataStack', stackProps);

        // Assert
        expectCDK(stack).to(haveResource('AWS::RDS::DBCluster')); // Adjust the resource type as needed
        // Add more assertions based on your specific stack properties

        // Example: expectCDK(stack).to(haveResource('AWS::RDS::DBInstance', {
        //   Engine: 'aurora-postgresql',
        //   InstanceClass: 'db.r5.large',
        //   // Add more properties to check
        // }));
    });
});