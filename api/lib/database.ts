import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Billing, ITableV2, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class Database extends Construct {

    public readonly productTable: ITableV2

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.productTable = this.createProductTable();
    }

    private createProductTable() {
        return new TableV2(this, 'product', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: 'product',
            removalPolicy: RemovalPolicy.DESTROY,
            billing: Billing.onDemand()
          });
    }

}