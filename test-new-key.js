const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("Testing Key ending in ...dAqk");
    try {
        const apiKey = "AIzaSyAgiQnz21mrohTQtG433Lros2N0edqdAqk";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Hello from local test");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (e) {
        console.error("FAIL:", e.message);
    }
}

test();
