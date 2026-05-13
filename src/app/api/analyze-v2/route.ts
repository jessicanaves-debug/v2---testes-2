import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildV2SystemPrompt,
  buildV2UserMessage,
  type V2InputData,
  type V2AnalysisResult,
} from "@/lib/apresentacao-v2-prompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_ID = "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY não configurada." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data: V2InputData = body.data;
    const images: { key: string; base64: string; mimeType: string }[] = body.images || [];

    if (!data) {
      return NextResponse.json({ success: false, error: "Dados não fornecidos." }, { status: 400 });
    }

    const systemPrompt = buildV2SystemPrompt(data);
    const userMessage = buildV2UserMessage(data);

    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    });

    // Monta o array de partes: imagens primeiro, depois texto
    type InlinePart = { inlineData: { mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string } };
    type TextPart = { text: string };
    type Part = InlinePart | TextPart;
    const parts: Part[] = [];

    if (images.length > 0) {
      for (const img of images) {
        const validMime = (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(img.mimeType)
          ? img.mimeType
          : "image/png") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        parts.push({ inlineData: { mimeType: validMime, data: img.base64 } });
      }
      parts.push({ text: "Os gráficos acima fazem parte da apresentação. Analise-os junto com os dados a seguir." });
    }

    parts.push({ text: userMessage });

    let result;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = await model.generateContent(parts as any);
    } catch (apiError) {
      const apiMsg = apiError instanceof Error ? apiError.message : String(apiError);
      if (apiMsg.includes("API_KEY_INVALID")) {
        return NextResponse.json({ success: false, error: "Chave Gemini inválida." }, { status: 401 });
      }
      if (apiMsg.includes("429") || apiMsg.includes("RESOURCE_EXHAUSTED")) {
        return NextResponse.json({ success: false, error: "Limite atingido. Aguarde 1 min." }, { status: 429 });
      }
      return NextResponse.json({ success: false, error: `Erro IA: ${apiMsg}` }, { status: 502 });
    }

    const rawText = result.response.text();
    const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed: V2AnalysisResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { success: false, error: "Formato inesperado da IA.", rawResponse: rawText.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("analyze-v2 error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
