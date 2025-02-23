import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Database } from './database';
import { Microservices } from './microservices';
import { ApiGateway } from './apigateway';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const db = new Database(this, 'Database');

    const microservices = new Microservices(this, 'Microservices', { productTable: db.productTable });

    const apiGateway = new ApiGateway(this, 'ApiGateway', { productMicroservice: microservices.productMicroservice });
  }

}
