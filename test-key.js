const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const apiKey = "AIzaSyD5ouhYd9nXClBkb1mmcL-xEmKDquaDsWM";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
