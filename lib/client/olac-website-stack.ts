import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';
import {RemovalPolicy} from 'aws-cdk-lib';

export interface OlacWebsiteStackProps extends cdk.StackProps {
    domainNames: string[];
    certificateArn: string;
    restApi: apigateway.RestApi;
}

export class OlacWebsiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: OlacWebsiteStackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: props.domainNames[0],
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
            accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html'
        });

        new s3deploy.BucketDeployment(this, 'DeploySite', {
            sources: [s3deploy.Source.asset('./quasar/dist/spa')],
            destinationBucket: siteBucket
        });

        const certificate = acm.Certificate.fromCertificateArn(this, "Certificate", props.certificateArn);

        new cloudfront.Distribution(this, 'SiteDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(siteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            additionalBehaviors: {
                "/api/*": {
                    origin: new origins.RestApiOrigin(props.restApi),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED
                }
            },
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
            domainNames: props.domainNames,
            certificate: certificate,
        });
    }
}
