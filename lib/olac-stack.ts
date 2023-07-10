import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';

export class OlacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: 'dev.omahalithuanians.org',
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

    const certificate = acm.Certificate.fromCertificateArn(this, "Certificate",
        "arn:aws:acm:us-east-1:543748744721:certificate/d82d9aa8-4c48-47e0-8970-7cdd385679f9");

    new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      domainNames: [ 'dev.omahalithuanians.org' ],
      certificate: certificate
    });
  }
}
