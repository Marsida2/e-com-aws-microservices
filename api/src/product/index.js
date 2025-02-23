import { eventNames } from "process";
import { ddbClient } from "./ddbClient";
import { ScanCommand, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { uuidv4 } from 'uuid';

const getProduct = async (productId) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: { 
                id: {
                    S: productId
                }
            }
        }

        const { Item } = await ddbClient.send(new GetItemCommand(params));
        console.log(Item);
        return Item ? Item : {};

    } catch(e) {
        console.error(e);
        throw e;
    }
};

const getAllProducts = async () => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            
        }

        const { Items } = await ddbClient.send(new ScanCommand(params));
        console.log(Items);
        return Items ? Items : {};

    } catch(e) {
        console.error(e);
        throw e;
    }
};

const createProduct = async (event) => {
    try {

        const product = JSON.parse(event.body);
        const productId = uuidv4();
        product.id = productId;
        
        const input = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: product ? product : {}
        }

        const response = await ddbClient.send(new PutItemCommand(input));
        console.log(response);
        return response;

    } catch(e) {
        console.error(e);
        throw e;
    }
};


export async function handler(event) {
    console.log("request hello: ", JSON.stringify(event, undefined, 2));

    switch (event.httpMethod) {
        case "GET":
            if (event.pathParameters != null)
                body = await getProduct(event.pathParameters.id);
            else
                body = await getAllProducts();
            break;
        case "POST":
            body = await createProduct(event);
            break;
        default:
            throw new Error(`Unsupported route: ${event.httpMethod}`);
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello from path: ${event.path}`
    }
}