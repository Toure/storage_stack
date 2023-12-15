import * as cdk from "aws-cdk-lib";
import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc,
} from "aws-cdk-lib/aws-ec2";
import {
    AuroraPostgresEngineVersion,
    ClusterInstance,
    Credentials,
    DatabaseCluster,
    DatabaseClusterEngine
} from "aws-cdk-lib/aws-rds";
import {ISecretAttachmentTarget, Secret} from "aws-cdk-lib/aws-secretsmanager";
import {Construct} from "constructs";


export interface RDSDataStackProps extends StackProps {}

export class RDSDataStack extends Stack {
    constructor(scope: Construct, id: string, props: RDSDataStackProps) {
        super(scope, id, props);

        const engine = DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_13_7 });
        const port = 5432;
        const dbName = "nexus3";

        // create database master user secret and store it in Secrets Manager
        // TODO: We should store this information somewhere outside of the codebase
        const masterUserSecret = new Secret(this, "db-master-user-secret", {
            secretName: "db-master-user-secret",
            description: "Database master user credentials",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: "postgres" }),
                generateStringKey: "password",
                passwordLength: 16,
                excludePunctuation: true,
            },
        });

        const stack = cdk.Stack.of(scope);
        const vpc = Vpc.fromLookup(stack, 'nexus_platform_vpc',
            { vpcId: stack.node.tryGetContext('use_vpc_id')
            });
        if (!vpc) {
            throw new Error("VPC undefined")
        }
        // Create a Security Group
        const dbSg = SecurityGroup.fromSecurityGroupId(this, "ClusterSG", "sg-11111111");

        // Add Inbound rule
        dbSg.addIngressRule(
            Peer.ipv4(vpc.vpcCidrBlock),
            Port.tcp(port),
            `Allow port ${port} for database connection from only within the VPC (${vpc.vpcId})`
        );

        // create RDS instance (PostgreSQL)
        const dbCluster = new DatabaseCluster(this, "NextEra-Neux-DB-1", {
            vpc: vpc,
            vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
            writer: ClusterInstance.provisioned('writer', {
                instanceType: InstanceType.of(InstanceClass.R5, InstanceSize.LARGE),
            }),
            engine,
            port,
            securityGroups: [dbSg],
            defaultDatabaseName: dbName,
            credentials: Credentials.fromSecret(masterUserSecret),
            backup: {
                retention: Duration.days(30), // to disable automatic DB snapshot retention
            },
        });

        // DB connection settings will be appended to this secret (host, port, etc.)
        masterUserSecret.attach(dbCluster);
    }
}