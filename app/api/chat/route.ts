import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Helper to clean JSON string
function cleanJson(text: string) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY is not set" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { message, image } = await req.json();

        let prompt = `
        You are a financial assistant. Parse the following input (text or image) into a structured transaction JSON.
        
        The user might say things like "Uber 20", "Spent 50 on food", "Salary 5000".
        Or provide an image of a receipt.
        
        Return ONLY a raw JSON object with these fields:
        {
            "amount": number,
            "description": string (short clean description),
            "category": string (Food, Transport, Utilities, Shopping, Entertainment, Health, Salary, General),
            "type": "income" | "expense",
            "date": string (ISO date for today, or inferred from input. If input says 'yesterday', calculate it.),
            "paymentMethod": "credit" | "debit" | "pix" | "cash" | "unknown",
            "installments": number (optional, if detected),
            "brand": string (optional, inferred brand name)
        }

        Current Date: ${new Date().toISOString()}

        User Input: ${message || "Analyze this image"}
        `;

        const parts: any[] = [prompt];

        if (image) {
            // Image should be base64 string without data prefix if possible, or we strip it
            const base64Data = image.split(',')[1] || image;
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg" // Assessing jpeg for simplicity, or detect
                }
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        try {
            const json = JSON.parse(cleanJson(text));
            // Enhance status for frontend compatibility
            json.status = json.amount ? 'success' : 'missing_amount';
            return NextResponse.json(json);
        } catch (e) {
            console.error("Failed to parse AI response", text);
            return NextResponse.json({ error: "Failed to parse transaction" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
