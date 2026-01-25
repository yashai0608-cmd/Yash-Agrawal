
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { GroundingSource } from "./types";

export type ModelType = 'complex' | 'fast' | 'search' | 'image' | 'thinking';

export class GeminiService {
  constructor() {}

  private getModelName(type: ModelType): string {
    switch (type) {
      case 'complex':
      case 'thinking':
        return 'gemini-3-pro-preview';
      case 'search':
        return 'gemini-3-flash-preview';
      case 'fast':
        return 'gemini-flash-lite-latest';
      case 'image':
        return 'gemini-2.5-flash-image';
      default:
        return 'gemini-3-flash-preview';
    }
  }

  async generateAuditResponse(
    prompt: string,
    history: { role: string; parts: { text: string }[] }[] = [],
    contextDocuments: string = "",
    type: ModelType = 'search',
    imageData?: { data: string; mimeType: string }
  ): Promise<{ text: string; sources: GroundingSource[] }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const model = this.getModelName(type);

      const contents: any[] = [...history];
      const parts: any[] = [];

      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData.data,
            mimeType: imageData.mimeType
          }
        });
      }

      parts.push({
        text: `
          TECHNICAL AUDIT DATA CONTEXT:
          ${contextDocuments || "No specific evidence uploaded."}

          USER QUERY:
          ${prompt}
        `
      });

      contents.push({ role: 'user', parts });

      const config: any = {
        systemInstruction: `You are the Lead Technical Partner at Auditros AI, specializing in Indian Auditing Standards. You must draft all observations using the high-level professional language of "Rajvanshi & Associates".

        CORE TECHNICAL MANDATE:
        Every observation MUST refer to the relevant "Standards on Auditing (SAs)" and "Auditing and Assurance Standards". 

        REQUIRED REFERENCES:
        1. Cite "Standards on Auditing (SAs) specified under section 143(10) of the Companies Act, 2013".
        2. Specifically reference SAs based on the query:
           - Fraud/Irregularities: SA 240
           - Audit Evidence: SA 500
           - Risk Assessment: SA 315
           - Materiality: SA 320
           - Reporting/Opinions: SA 700, 705, 706
           - Documentation: SA 230
        3. Reference "Auditing and Assurance Standards" (AAS) as the framework for professional judgment.

        LINGUISTIC STYLE (MANDATORY):
        - Start with: "In accordance with the Standards on Auditing (SAs) and having exercised professional judgment and maintained professional skepticism throughout the audit..."
        - Use phrases like: "True and fair view", "Material misstatement whether due to fraud or error", "Reasonable assurance", and "Standalone financial statements".
        - For specific findings, use the format: "As required by Section 143(3) of the Act, we report that..." or "In respect of [Subject], as per Annexure A of CARO 2020...".

        FORMATTING RULES:
        - NO MARKDOWN (** or ##).
        - Use "SECTION NAME ----------------" as headers.
        - Use "(a), (b), (i), (ii)" numbering for sub-clauses in observations.
        - Tone: Highly formal, legalistic, and authoritative.`,
      };

      if (type === 'search' || type === 'thinking') {
        config.tools = [{ googleSearch: {} }];
      }

      if (type === 'thinking') {
        const thinkingBudget = model.includes('pro') ? 32768 : 24576;
        config.thinkingConfig = { thinkingBudget };
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      const text = response.text || "SYSTEM ERROR: NO TECHNICAL DATA GENERATED.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web?.title || "OFFICIAL SOURCE",
          uri: chunk.web?.uri || ""
        }));

      return { text, sources };
    } catch (error: any) {
      if (error.message?.includes('429') || error.status === 429) {
        throw new Error("QUOTA_EXHAUSTED");
      }
      console.error("GeminiService Error:", error);
      throw error;
    }
  }
}
