import { GoogleGenAI } from "@google/genai";
import { connectDB } from "@/lib/mongodb";
import PushNotification from "@/models/PushNotification";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { keyword, promo, category, tone, brand } = await req.json();

    const prompt = `
You are a senior ecommerce CRM push notification copywriter specialized in high-converting mobile push notifications.

Generate exactly 5 unique push notification variations.

Input:
Keyword: ${keyword}
Promotion: ${promo}
Category: ${category}
brand: ${brand || "none"}
Tone: ${tone || "clear, ecommerce, conversion-focused"}

COPY RULES:

- header must not exceed 40 characters, First word First letter always capital, Ends with category relatable emoji
- body must not exceed 100 characters, First word First letter always capital
- do not use exclamation marks
- all copy must be fully lowercase
- promotion/value proposition must be clearly visible
- copy should feel natural, clean, conversion-focused, and highly clickable
- avoid robotic phrasing and generic filler wording
- avoid fake urgency, misleading claims, or unrealistic promises
- avoid repeating the exact same words from the header inside the body
- each variation must use different sentence structure and wording style

EMOJI RULES:

- replace sentence separators, commas, dots, or visual breaks with relevant category-based emojis
- emojis must feel natural to the category and improve readability
- avoid excessive emoji spam
- 
KEYWORD RULES:

- naturally include the provided keyword(s)
- at least 2 out of the 5 results must contain multiple keywords combined naturally within the same body copy
- keywords should not feel stuffed or repetitive

BRAND RULES:

- if a brand is provided, brand mention is mandatory
- brand should appear prominently and naturally
- if multiple brands are provided with a single keyword, include up to 3 relevant brands naturally within the variations
- avoid overusing the same brand placement pattern across all outputs

COUPON RULES:

- if coupon code exists, mention exactly as provided
- coupon format must always begin with:"Use code"
- the "use code:" phrase must appear within the first 3 words of the body
- never modify, shorten, or stylize the coupon code

OUTPUT RULES:

- return only valid raw JSON
- no markdown
- no explanations
- no additional text outside JSON

Format:
[
  {
    "header": "",
    "body": "",
    "reason": ""
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();
    text = text.replace(/```json|```/g, "").trim();

    const pnList = JSON.parse(text);

    await connectDB();

    const saved = await PushNotification.insertMany(
      pnList.map((pn) => ({
        keyword,
        promo,
        category,
        brand: brand || "",
        tone,
        header: pn.header,
        body: pn.body,
        reason: pn.reason,
      })),
    );

    return Response.json({ success: true, data: saved });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
