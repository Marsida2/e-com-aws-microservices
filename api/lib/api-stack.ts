import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TableV2, AttributeType, Billing } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const productTable = new TableV2(this, 'Table', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'product',
      removalPolicy: RemovalPolicy.DESTROY,
      billing: Billing.onDemand()
    });

    const nodejsFunctionProp: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMO_TABLE_NAME: productTable.tableName
      },
      runtime: Runtime.NODEJS_22_X
    }

    const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodejsFunctionProp,
    });


    const apiGateway = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: productFunction,
      proxy: false
    })

    const products = apiGateway.root.addResource('products');
    products.addMethod('GET');
    products.addMethod('POST');

    const product = products.addResource('{id}');
    product.addMethod('GET');
    product.addMethod('PUT');
    product.addMethod('DELETE');

    productTable.grantReadWriteData(productFunction);

    // example resource
    // const queue = new sqs.Queue(this, 'ApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
