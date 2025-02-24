import { ddbClient } from "./ddbClient";
import { ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const getProduct = async (productId) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: productId })
        }

        const { Item } = await ddbClient.send(new GetItemCommand(params));
        console.log(Item);
        return (Item) ? unmarshall(Item) : {};
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
        return (Items) ? Items.map((item) => unmarshall(item)) : {};

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
            Item: marshall(product || {})
        }

        const response = await ddbClient.send(new PutItemCommand(input));
        console.log(response);
        return response;

    } catch(e) {
        console.error(e);
        throw e;
    }
};

const deleteProduct = async (productId) => {  
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ id: productId }),
      };
  
      const response = await ddbClient.send(new DeleteItemCommand(params));
      console.log(response);
      return response;
    } catch(e) {
      console.error(e);
      throw e;
    }
  }


export async function handler(event) {
    console.log("request hello: ", JSON.stringify(event, undefined, 2));

    let body = {};

    try {
        switch (event.httpMethod) {
          case "OPTIONS": 
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization"
                },
                body: {}
            };
          case "GET":
        if (event.pathParameters != null)
              body = await getProduct(event.pathParameters.id);
            else
              body = await getAllProducts();
            break;
          case "POST":
            body = await createProduct(event);
            break;
          case "DELETE":
            body = await deleteProduct(event.pathParameters.id);
            break;
          default:
            throw new Error(`Unsupported route: ${event.httpMethod}`);
        }
  
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
          body: JSON.stringify({
            message: `Successfully finished operation: "${event.httpMethod}"`,
            data: body
          })
        };
  
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
          },
            body: JSON.stringify({
            message: "Operation failed!",
            errorMsg: e.message,
            errorStack: e.stack,
            })
        };
    }
}