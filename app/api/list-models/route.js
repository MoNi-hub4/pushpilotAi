// app/api/list-models/route.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function GET() {
  const models = await ai.models.list();

  const workingModels = [];

  for await (const model of models) {
    if (model.supportedActions?.includes("generateContent")) {
      workingModels.push({
        name: model.name,
        displayName: model.displayName,
        supportedActions: model.supportedActions,
      });
    }
  }

  return Response.json({ models: workingModels });
}