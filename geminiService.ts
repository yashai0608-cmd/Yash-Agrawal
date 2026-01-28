
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { GroundingSource, AuditExperience } from "./types.ts";
import { AuditExperienceStore } from "./storageService.ts";

export type ModelType = 'complex' | 'fast' | 'search' | 'image' | 'thinking' | 'video';

export class GeminiService {
  private audioContext: AudioContext | null = null;

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
        return 'gemini-3-pro-image-preview';
      case 'video':
        return 'veo-3.1-fast-generate-preview';
      default:
        return 'gemini-3-flash-preview';
    }
  }

  async generateSpeech(text: string, voice: string = 'Kore') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly and professionally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (!this.audioContext) this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const audioBuffer = await this.decodeAudioData(this.base64ToUint8Array(base64Audio), this.audioContext, 24000, 1);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    }
  }

  async generateImage(prompt: string, options: { aspectRatio?: string, imageSize?: string } = {}): Promise<{ text: string; sources: GroundingSource[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: options.aspectRatio || "1:1",
          imageSize: options.imageSize || "1K"
        }
      }
    });

    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return { 
      text: `TACTICAL VISUALIZATION GENERATED.\n\n![Generated Tactical Visualization](${imageUrl})`, 
      sources: [] 
    };
  }

  async generateVideo(prompt: string, options?: { image?: { data: string, mimeType: string } }): Promise<{ text: string; sources: GroundingSource[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const request: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    };

    if (options?.image) {
      request.image = {
        imageBytes: options.image.data,
        mimeType: options.image.mimeType
      };
    }

    let operation = await ai.models.generateVideos(request);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    
    return { 
      text: `TACTICAL VIDEO BRIEFING COMPLETE.\n\n[VIEW COMMAND VIDEO](${videoUrl})\n\nReference: Secure Veo-3 Uplink.`, 
      sources: [{ title: 'Generated Tactical Briefing', uri: videoUrl }] 
    };
  }

  async generateAuditResponse(
    prompt: string,
    history: { role: string; parts: { text: string }[] }[] = [],
    contextDocuments: string = "",
    type: ModelType = 'search',
    section: string = "General",
    imageData?: { data: string; mimeType: string }
  ): Promise<{ text: string; sources: GroundingSource[] }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = this.getModelName(type);
      const institutionalMemory = AuditExperienceStore.getRelevantContext(section);

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
          ${institutionalMemory}
          
          TECHNICAL AUDIT DATA CONTEXT:
          ${contextDocuments || "No specific evidence uploaded."}

          USER QUERY:
          ${prompt}
        `
      });

      contents.push({ role: 'user', parts });

      let systemInstruction = `You are a Senior Technical Audit Specialist at Auditros AI.
      
      STRICT PROHIBITION:
      - NEVER mention specific accounting firm names (e.g., "Rajvanshi & Associates", "Rajvanshi"). 
      - ALWAYS use generic terms like "the Auditor", "the Firm", or "we".`;

      if (section === 'Audit Observation') {
        systemInstruction += `
        TECHNICAL MANDATE: Respond to audit observations using the following mandatory 6-step structure. Language must be suitable for direct inclusion in a listed entity's annual report.
        1) DRAFT AUDIT OBSERVATION: Formal draft ready for direct copy-paste.
        2) DETAILED TECHNICAL REFERENCES: Cite SAs, AS/Ind AS, Tax Regulations, and MCA Compliances.
        3) REGULATORY BASIS: Explain specific legal mandate (Section/Rules).
        4) IMPACT ASSESSMENT: Detail material impact on financials or regulatory standing.
        5) AUDITOR'S CONCLUSION: Final professional statement.
        6) WEB REFERENCES: One-liner references with verified direct URLs.`;
      } else if (section === 'Audit Plan') {
        systemInstruction += `
        TECHNICAL MANDATE:
        - Construct technical audit plans/risk assessments.
        - Strictly cite SA 300 requirements.
        - Provide direct deep links to standards on icai.org.`;
      } else if (section === 'Accounting Standards') {
        systemInstruction += `
        TECHNICAL MANDATE:
        - Analyze MCA Ind AS and AS requirements.
        - Provide direct deep links to standard texts on mca.gov.in.`;
      } else if (section === 'Regulatory Updates') {
        systemInstruction += `
        TECHNICAL MANDATE:
        - Track circulars/amendments from MCA, SEBI, and ICAI.
        - Provide direct deep links to PDF announcements on government portals.`;
      } else if (section === 'Tax Compliance') {
        systemInstruction += `
        TECHNICAL MANDATE:
        - Analyze Income Tax/GST Act requirements. Search income tax portals for sections/rules/forms.
        - Provide direct deep links to statute pages at incometaxindia.gov.in.`;
      }

      systemInstruction += `
      LINGUISTIC STYLE:
      - Professional, authoritative, and legalistic.
      - NO Markdown headers symbols (*, #). Use UPPERCASE text for section headers.
      - If Google Search or Maps grounding is used, always list the URLs at the end.`;

      const config: any = { systemInstruction: systemInstruction };

      if (type === 'search' || type === 'thinking') {
        config.tools = [{ googleSearch: {} }];
        if (section.toLowerCase().includes('location')) config.tools.push({ googleMaps: {} });
      }

      if (type === 'thinking') {
        config.thinkingConfig = { thinkingBudget: model.includes('pro') ? 32768 : 24576 };
      }

      const response = await ai.models.generateContent({ model, contents, config });
      const text = response.text || "SYSTEM ERROR: NO DATA GENERATED.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .map(chunk => {
          if (chunk.web) return { title: chunk.web.title || "Web Source", uri: chunk.web.uri || "" };
          if (chunk.maps) return { title: chunk.maps.title || "Location Data", uri: chunk.maps.uri || "" };
          return null;
        })
        .filter((s): s is GroundingSource => s !== null);

      return { text, sources };
    } catch (error: any) {
      if (error.message?.includes('429')) throw new Error("QUOTA_EXHAUSTED");
      throw error;
    }
  }

  async extractLearning(section: string, query: string, response: string): Promise<AuditExperience | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const extractResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract technical audit logic. Section: ${section}. Query: ${query}. Return ONE concise sentence.`,
      });
      const learning = extractResponse.text?.trim();
      if (!learning) return null;
      return { id: Date.now().toString(), section, querySummary: query.substring(0, 100), technicalLearning: learning, timestamp: Date.now(), importance: 3 };
    } catch { return null; }
  }

  private base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }
}
