import * as cdk from 'aws-cdk-lib';
import {Duration, RemovalPolicy} from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';

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
            sources: [s3deploy.Source.asset('../quasar/dist/spa')],
            destinationBucket: siteBucket
        });

        const certificate = acm.Certificate.fromCertificateArn(this, "Certificate", props.certificateArn);
        const s3origin = new origins.S3StaticWebsiteOrigin(siteBucket);

        const noCachePolicy = new cloudfront.CachePolicy(this, 'NoCachePolicy', {
            maxTtl: Duration.seconds(1),
            minTtl: Duration.seconds(0),
            defaultTtl: Duration.seconds(0)
        });

        new cloudfront.Distribution(this, 'SiteDistribution', {
            defaultBehavior: {
                origin: s3origin,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            additionalBehaviors: {
                "/": {
                    origin: s3origin,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: noCachePolicy
                },
                "/index.html": {
                    origin: s3origin,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: noCachePolicy
                },
                "/api/*": {
                    origin: new origins.RestApiOrigin(props.restApi),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: new cloudfront.CachePolicy(this, 'AuthorizationCachePolicy', {
                        headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization', 'Origin', 'Referer'),
                        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
                        cookieBehavior: cloudfront.CacheCookieBehavior.all(),
                        enableAcceptEncodingBrotli: true,
                        enableAcceptEncodingGzip: true,
                        maxTtl: Duration.seconds(1),
                        minTtl: Duration.seconds(0),
                        defaultTtl: Duration.seconds(0)
                    }),
                    originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'RestApiOriginRequestPolicy', {
                        headerBehavior: cloudfront.OriginRequestHeaderBehavior.none(),
                        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
                        cookieBehavior: cloudfront.OriginRequestCookieBehavior.none()
                    })
                }
            },
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
            domainNames: props.domainNames,
            certificate,
        });
    }
}
