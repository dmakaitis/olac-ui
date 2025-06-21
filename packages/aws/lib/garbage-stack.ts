import * as cdk from "aws-cdk-lib";
import {Function} from "aws-cdk-lib/aws-lambda";
import {Construct} from "constructs";
import {ArnPrincipal, Role} from "aws-cdk-lib/aws-iam";

interface GarbageStackProps extends cdk.StackProps {
    functionToDelete: Function
}

export class GarbageStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: GarbageStackProps) {
        super(scope, id, props);

        const tempRole = new Role(this, 'TempRole', {
            assumedBy: new ArnPrincipal('not-a-real-arn')
        });

        props.functionToDelete.grantInvoke(tempRole);
    }

}