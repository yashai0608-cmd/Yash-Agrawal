
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export class LiveService {
  private session: any;
  private audioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor() {}

  async connect(callbacks: {
    onMessage: (text: string) => void;
    onClose: () => void;
    onOpen: () => void;
  }) {
    // Create new GoogleGenAI instance right before the call to ensure up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          callbacks.onOpen();
          const source = inputContext.createMediaStreamSource(stream);
          const processor = inputContext.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const pcm = this.createPcmBlob(input);
            // Always rely on sessionPromise to prevent stale closures
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcm }));
          };
          source.connect(processor);
          processor.connect(inputContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          // Access .data property directly from message parts
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            this.playAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
          }
          if (msg.serverContent?.outputTranscription) {
            callbacks.onMessage(msg.serverContent.outputTranscription.text);
          }
          // Handle model interruptions
          if (msg.serverContent?.interrupted) {
            for (const source of this.sources.values()) {
              try { source.stop(); } catch(e) {}
              this.sources.delete(source);
            }
            this.nextStartTime = 0;
          }
        },
        onclose: callbacks.onClose,
        onerror: (e) => {
          console.error("Live session error:", e);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: 'You are Auditros Live AI. Assist with real-time auditing queries via voice. Cite standards and paragraphs briefly.'
      }
    });

    this.session = await sessionPromise;
  }

  private createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000'
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async playAudio(base64: string) {
    if (!this.audioContext) return;
    this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
    const buffer = await this.decodeAudioData(this.decode(base64), this.audioContext, 24000, 1);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    source.addEventListener('ended', () => {
      this.sources.delete(source);
    });

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.sources.add(source);
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  stop() {
    this.session?.close();
  }
}
