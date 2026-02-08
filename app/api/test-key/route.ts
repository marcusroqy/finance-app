import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Missing Key" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Hello");
        const response = await result.response;

        return NextResponse.json({ success: true, text: response.text() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
