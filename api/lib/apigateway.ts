import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewayProps {
    productMicroservice: IFunction,
}

export class ApiGateway extends Construct {

    public readonly apiGateway: LambdaRestApi;

    constructor(scope: Construct, id: string, props: ApiGatewayProps ) {
        super(scope, id);

        this.apiGateway = this.createApiGateway(props.productMicroservice);
    }

    private createApiGateway(productFunction : IFunction) {
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

        return apiGateway;   
    }
    
}