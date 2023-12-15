import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {FlowLogDestination, Vpc} from 'aws-cdk-lib/aws-ec2';
import {Effect, PolicyStatement, ServicePrincipal} from 'aws-cdk-lib/aws-iam';

import {Construct} from 'constructs';

export interface simpleStorageProps extends cdk.StackProps {}

export class SimpleStorageStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: simpleStorageProps) {
        super(scope, id, props);

        // ============================================================================================================================================
        // S3 Constructs
        // ============================================================================================================================================
        const stack = cdk.Stack.of(scope);
        const vpc = Vpc.fromLookup(stack, 'nexus_platform_vpc',
            { vpcId: stack.node.tryGetContext('use_vpc_id')
            });
        if (!vpc) {
            throw new Error("VPC undefined")
        }
        const logBucket = new s3.Bucket(this, 'LogBucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            serverAccessLogsPrefix: 'logBucketAccessLog',
        });

        if (!logBucket) {
            throw new Error('S3 logBucket failed to create.');
        }
        const nexusBlobBucket = new s3.Bucket(this, 'nexus3-blobstore', {
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            encryption: s3.BucketEncryption.S3_MANAGED,
            serverAccessLogsBucket: logBucket,
            serverAccessLogsPrefix: 'blobstoreBucketAccessLog',
            enforceSSL: true,
        });

        if (!nexusBlobBucket) {
            throw new Error('S3 nexusBlobBucket failed to create.');
        }

        const flowLogPrefix = 'nexusVpcFlowLogs';
        vpc.addFlowLog('NexusVpcFlowlogs', {
            destination: FlowLogDestination.toS3(logBucket, flowLogPrefix),
        });

        logBucket.addToResourcePolicy(new PolicyStatement({
            sid: 'AWSLogDeliveryWrite',
            principals: [new ServicePrincipal('delivery.logs.amazonaws.com')],
            actions: ['s3:PutObject'],
            resources: [logBucket.arnForObjects(`${flowLogPrefix}/AWSLogs/${cdk.Aws.ACCOUNT_ID}/*`)],
            conditions: {
                StringEquals: {
                    's3:x-amz-acl': 'bucket-owner-full-control',
                },
            },
        }));

        logBucket.addToResourcePolicy(new PolicyStatement({
            sid: 'AWSLogDeliveryCheck',
            principals: [new ServicePrincipal('delivery.logs.amazonaws.com')],
            actions: [
                's3:GetBucketAcl',
                's3:ListBucket',
            ],
            resources: [logBucket.bucketArn],
        }));

        nexusBlobBucket.addToResourcePolicy(new PolicyStatement(
            {
                sid: "NexusS3BlobStoreAccess",
                actions: [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:DeleteObject",
                    "s3:ListBucket",
                    "s3:GetLifecycleConfiguration",
                    "s3:PutLifecycleConfiguration",
                    "s3:PutObjectTagging",
                    "s3:GetObjectTagging",
                    "s3:DeleteObjectTagging",
                    "s3:GetBucketAcl"
                ],
                effect: Effect.ALLOW,
                resources: [nexusBlobBucket.bucketArn],
            }
        ));
    }
}