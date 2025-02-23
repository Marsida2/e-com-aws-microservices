export async function handler(event) {
    console.log("request hello: ", JSON.stringify(event, undefined, 2));
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello from path: ${event.path}`
    }
}