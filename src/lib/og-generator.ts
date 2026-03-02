import { GoogleGenAI } from "@google/genai";

export async function generateOGImage(
  channelA: string,
  channelB: string,
  coreFinding: string,
): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `A professional YouTube thumbnail for a viral collaboration video between "${channelA}" and "${channelB}". ${coreFinding}.

Style: bold, cinematic, high-energy. Wide landscape composition split into two distinct sides. Warm cream (#FAF9F6) and emerald green (#0D9373) color accent. Vibrant and eye-catching. No watermarks.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K",
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) {
    throw new Error("No image data in Gemini response");
  }

  return Buffer.from(part.inlineData.data, "base64");
}
