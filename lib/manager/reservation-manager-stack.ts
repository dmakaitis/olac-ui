import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export interface ReservationManagerStackProps extends cdk.StackProps {
}

export class ReservationManagerStack extends cdk.Stack {

    readonly getNewReservationIdFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: ReservationManagerStackProps) {
        super(scope, id, props);

        this.getNewReservationIdFunction = new lambda.Function(this, 'GetNewReservationId', {
            description: 'Generate a new reservation ID',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/manager/reservation'),
            handler: 'new-reservation-id.handler',
        });
    }
}