import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import {Function} from 'aws-cdk-lib/aws-lambda';

export interface ReservationManagerStackProps extends cdk.StackProps {

    saveReservationFunction: Function

}

export class ReservationManagerStack extends cdk.Stack {

    readonly apiGetNewReservationIdFunction: Function;
    readonly apiSaveReservationFunction: Function;
    readonly apiSaveReservationAdminFunction: Function;

    constructor(scope: Construct, id: string, props: ReservationManagerStackProps) {
        super(scope, id, props);

        this.apiGetNewReservationIdFunction = new lambda.Function(this, 'GetNewReservationId', {
            description: 'Generate a new reservation ID',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/manager/reservation'),
            handler: 'new-reservation-id.handler',
        });

        this.apiSaveReservationFunction = new Function(this, 'SaveReservationApi', {
            description: 'Saves a new reservation to the datastore (for public use)',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/manager/reservation'),
            handler: 'save-reservation.apiHandler',
            environment: {
                SAVE_RESERVATION_FUNCTION: props.saveReservationFunction.functionName
            }
        });
        props.saveReservationFunction.grantInvoke(this.apiSaveReservationFunction);

        this.apiSaveReservationAdminFunction = new Function(this, 'SaveReservationAdminApi', {
            description: 'Saves a new reservation to the datastore (for event coordinator use)',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/manager/reservation'),
            handler: 'save-reservation-admin.apiHandler',
            environment: {
                SAVE_RESERVATION_FUNCTION: props.saveReservationFunction.functionName
            }
        });
        props.saveReservationFunction.grantInvoke(this.apiSaveReservationAdminFunction);
    }
}