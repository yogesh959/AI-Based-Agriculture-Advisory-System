const OpenAI = require("openai");
require("dotenv").config();

async function test() {
    try {
        const openRouterApiKey =
            process.env.OPENROUTER_API_KEY ||
            process.env["openrouter.api.key"] ||
            process.env.OPENAI_API_KEY;

        const client = new OpenAI({
            apiKey: openRouterApiKey,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
                "X-Title": "Farming AI Assistant"
            }
        });

        const response = await client.chat.completions.create({
            model: "openai/gpt-4.1-mini",
            max_tokens: 100,
            messages: [{ role: "user", content: "Say Hello" }]
        });

        console.log(response.choices?.[0]?.message?.content || "No response");
    } catch (e) {
        console.error(e);
    }
}

test();