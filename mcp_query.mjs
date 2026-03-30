import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
    try {
        const transport = new SSEClientTransport(new URL("https://mcp.clerk.dev/mcp"));
        const client = new Client({ name: "my-client", version: "1.0.0" }, { capabilities: {} });
        await client.connect(transport);
        
        const tools = await client.listTools();
        console.log("=== TOOLS ===");
        console.log(JSON.stringify(tools, null, 2));
        
        const resources = await client.listResources();
        console.log("\n=== RESOURCES ===");
        console.log(JSON.stringify(resources, null, 2));
        
        const prompts = await client.listPrompts();
        console.log("\n=== PROMPTS ===");
        console.log(JSON.stringify(prompts, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
main();
