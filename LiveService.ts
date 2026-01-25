
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export class LiveService {
  private ai: GoogleGenAI;
  private session: any;
  private audioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async connect(callbacks: {
    onMessage: (text: string) => void;
    onClose: () => void;
    onOpen: () => void;
  }) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          callbacks.onOpen();
          const source = inputContext.createMediaStreamSource(stream);
          const processor = inputContext.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const pcm = this.createPcmBlob(input);
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcm }));
          };
          source.connect(processor);
          processor.connect(inputContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            this.playAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
          }
          if (msg.serverContent?.outputTranscription) {
            callbacks.onMessage(msg.serverContent.outputTranscription.text);
          }
        },
        onclose: callbacks.onClose,
        onerror: console.error
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
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000'
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  private decode(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  private async playAudio(base64: string) {
    if (!this.audioContext) return;
    this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
    const buffer = await this.decodeAudioData(this.decode(base64), this.audioContext, 24000, 1);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, channels: number): Promise<AudioBuffer> {
    const int16 = new Int16Array(data.buffer);
    const len = int16.length / channels;
    const buffer = ctx.createBuffer(channels, len, rate);
    for (let c = 0; c < channels; c++) {
      const channel = buffer.getChannelData(c);
      for (let i = 0; i < len; i++) channel[i] = int16[i * channels + c] / 32768.0;
    }
    return buffer;
  }

  stop() {
    this.session?.close();
  }
}
