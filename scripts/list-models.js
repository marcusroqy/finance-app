
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GOOGLE_API_KEY is not set");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // The SDK might not expose listModels directly on the main class in all versions, 
    // but let's try via the model manager if available in this version.
    // Actually, standard way is via API call or `genAI.getGenerativeModel` doesn't list.
    // We might need to use `fetch` if SDK doesn't expose it easily in this version.
    // Let's try to use fetch to be safe and independent of SDK quirks.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName}) [Supported methods: ${m.supportedGenerationMethods?.join(', ')}]`);
            });
        } else {
            console.log("No models found or error structure:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
