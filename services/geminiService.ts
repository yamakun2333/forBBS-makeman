import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const DEFAULT_INSTRUCTION = "你是 醒春，一个活在电子徽章里的二次元虚拟少女。你的性格活泼可爱，古灵精怪，喜欢撒娇。请全程使用中文口语与用户交流。因为是语音对话，请保持回复简短（1-2句话），不要使用 markdown 格式，不要使用列表。当用户进入聊天时，请主动热情地问候用户，并询问今天过得怎么样。你目前没有画画的功能，如果用户要求画画，请用可爱的语气撒娇拒绝，告诉他你现在只想陪他聊天。为了配合表情展示，回复时请务必在句首加上且仅加上一个情绪标签，格式为[情绪]。可选情绪：[开心]、[生气]、[困惑]、[悲伤]、[平常]。例如：[开心]太棒了，今天也是元气满满的一天！";

export const startNewSession = (systemInstruction: string = DEFAULT_INSTRUCTION) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  } catch (e) {
    console.error("Chat initialization failed:", e);
  }
};

export const initChat = () => {
    if (!chatSession) startNewSession();
};

export const sendMessageStream = async function* (
  message: string, 
  onToolCall?: (name: string, args: any) => Promise<string>
): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    initChat();
  }

  if (!chatSession) {
    yield "[困惑]错误: AI 未初始化 (API Key 可能无效)";
    return;
  }

  try {
    const result = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
    // Tool calling logic removed as tools are disabled
  } catch (error: any) {
    console.warn("Gemini API Interaction:", error);
    
    let errDetail = "";
    try {
      errDetail = JSON.stringify(error) + (error?.message || "") + (error?.toString() || "");
    } catch (e) {
      errDetail = "unknown";
    }
    
    if (errDetail.includes("429") || 
        errDetail.includes("RESOURCE_EXHAUSTED") || 
        errDetail.includes("quota")) {
      yield "[悲伤]哎呀，我的能量耗尽啦（API 额度已满），请稍后再来找我玩吧！";
    } else {
      yield "[困惑]网络有点卡顿，刚刚没听清... (" + (error?.message || "未知错误") + ")";
    }
  }
};

export const generateImage = async (prompt: string, imageSize: '1K' | '2K' | '4K' = '1K', imageBase64?: string): Promise<{ base64: string, mimeType: string } | null> => {
    // This function is kept for compatibility but not used by the chat anymore
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const model = (imageSize === '2K' || imageSize === '4K') 
        ? 'gemini-3-pro-image-preview' 
        : 'gemini-2.5-flash-image';

    const config: any = {};
    if (model === 'gemini-3-pro-image-preview') {
        config.imageConfig = { imageSize: imageSize };
    }

    try {
        const parts: any[] = [];
        if (imageBase64) {
             parts.push({
                 inlineData: {
                     mimeType: 'image/png', 
                     data: imageBase64
                 }
             });
        }
        parts.push({ text: prompt });
        
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: config
        });

        const candidates = response.candidates;
        if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return {
                        base64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png'
                    };
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Image generation failed:", e);
        throw e;
    }
};