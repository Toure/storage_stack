#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { SimpleStorageStack } from '../lib/simple_storage_stack-stack';
import {RDSDataStack} from "../lib/rds-data-stack";

const DEFAULT_CONFIG = {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
};

const app = new cdk.App();
const prefix = stackPrefix(app);

new SimpleStorageStack(app, 'StorageStackStack', {
  env: DEFAULT_CONFIG.env,
  stackName: `${prefix}SimpleStorageStack`
});

new RDSDataStack(app, 'RDSDataStack', {
    env: DEFAULT_CONFIG.env,
    stackName: `${prefix}RDSDataStack`
});

function stackPrefix (stack: Construct): string {
    const prefixValue = stack.node.tryGetContext('stack_prefix');

    if (prefixValue !== undefined) {
        return prefixValue.trim();
    }
    return ''.trim();
}

app.synth();