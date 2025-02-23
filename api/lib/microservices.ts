import { ITableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface MicroservicesProps {
    productTable: ITableV2;
}

export class Microservices extends Construct {

    public readonly productMicroservice: NodejsFunction;

    constructor(scope: Construct, id: string, props: MicroservicesProps) {
        super(scope, id);

        this.productMicroservice = this.createProductMicroservice(props.productTable);
    }

    private createProductMicroservice(productTable: ITableV2) {
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

        productTable.grantReadWriteData(productFunction);

        return productFunction;
    }
    
}


