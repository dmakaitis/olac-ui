import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import {Construct} from 'constructs';

export interface SecurityUtilityStackProps extends cdk.StackProps {
    environment: string,
    userPoolId: string,
    clientId: string
}

export class SecurityUtilityStack extends cdk.Stack {

    readonly whoAmIFunction: lambda.Function;

    readonly adminUserGroup: cognito.CfnUserPoolGroup;
    readonly eventCoordinatorUserGroup: cognito.CfnUserPoolGroup;

    constructor(scope: Construct, id: string, props: SecurityUtilityStackProps) {
        super(scope, id, props);

        this.adminUserGroup = new cognito.CfnUserPoolGroup(this, 'EventUserGroup', {
            userPoolId: props.userPoolId,

            // the properties below are optional
            description: `OLAC Admin Group - ${props.environment}`,
            groupName: `olac-admin-${props.environment.toLowerCase()}`,
        });
        this.eventCoordinatorUserGroup = new cognito.CfnUserPoolGroup(this, 'EventCoordinatorUserGroup', {
            userPoolId: props.userPoolId,

            // the properties below are optional
            description: `OLAC Event Coordinator Group - ${props.environment}`,
            groupName: `olac-event-coordinator-${props.environment.toLowerCase()}`,
        });

        this.whoAmIFunction = new lambda.Function(this, 'WhoAmI', {
            description: 'Returns the identity of the caller',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/utility/security'),
            handler: 'whoami.handler',
            environment: {
                USER_POOL_ID: props.userPoolId,
                CLIENT_ID: props.clientId,
                ADMIN_GROUP_NAME: this.adminUserGroup.groupName || '__UNDEFINED__',
                EVENT_COORDINATOR_GROUP_NAME: this.eventCoordinatorUserGroup.groupName || '__UNDEFINED__'
            }
        });
    }
}
