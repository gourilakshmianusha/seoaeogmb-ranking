
import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeWebsite = async (siteUrl: string): Promise<WebsiteAnalysis> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model: model,
    contents: `Analyze the digital presence of "${siteUrl}" for SEO (Search Engine Optimization), AEO (Answer Engine Optimization), and Google Ranking. 
    AEO specifically focuses on how well the site answers direct questions and its visibility in AI-driven answer engines like Google Search Generative Experience, Perplexity, and ChatGPT.
    Provide scores from 0-100.
    Output the analysis in structured JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          siteName: { type: Type.STRING },
          url: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          seo: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
              disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "advantages", "disadvantages", "recommendations"]
          },
          aeo: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
              disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "advantages", "disadvantages", "recommendations"]
          },
          googleRanking: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
              disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "advantages", "disadvantages", "recommendations"]
          }
        },
        required: ["siteName", "url", "overallScore", "summary", "seo", "aeo", "googleRanking"]
      }
    }
  });

  const rawJson = response.text;
  const data: WebsiteAnalysis = JSON.parse(rawJson);
  data.timestamp = new Date().toISOString();
  return data;
};
