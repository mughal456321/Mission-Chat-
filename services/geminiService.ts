
import { GoogleGenAI, Type } from "@google/genai";
import { Message, MessageSender } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const tacticalizeMessage = async (input: string, callsign: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this civilian message into professional military tactical radio chatter. 
      Use NATO phonetic alphabet, operational brevity codes (e.g., 'Copy', 'Wilco', 'Interrogative', 'Visual', 'SITREP'), 
      and ensure it sounds high-stakes. 
      Current Callsign: ${callsign}.
      Message: "${input}"`,
      config: {
        systemInstruction: "You are a Military Communications Specialist. You only speak in professional, tactical radio brevity. Do not use emojis. Keep it concise.",
        temperature: 0.7,
      }
    });
    return response.text || input;
  } catch (error) {
    console.error("Tacticalize error:", error);
    return input;
  }
};

export const generateHQResponse = async (history: Message[]): Promise<string> => {
  try {
    const formattedHistory = history.map(m => `[${m.timestamp}] ${m.callsign}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following tactical log, provide a Command/HQ response. 
      Update the team on their mission status or provide strategic guidance. 
      Be authoritative and brief. 
      Log:\n${formattedHistory}`,
      config: {
        systemInstruction: "You are 'OVERLORD' - High Command HQ. Your responses are strategic, brief, and use military terminology. You monitor mission progress.",
        temperature: 0.8,
      }
    });
    return response.text || "STATION COPIES ALL. MAINTAIN DISCIPLINE. OUT.";
  } catch (error) {
    console.error("HQ Response error:", error);
    return "HQ COPIES ALL. STAY FROSTY.";
  }
};

export const generateRandomIntel = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a 1-sentence tactical intelligence update (e.g., 'Satellite imagery shows increased activity at sector 7', 'SIGINT detects encrypted broadcast from nearby ridge').",
      config: {
        systemInstruction: "Generate brief, atmospheric military intelligence reports.",
        temperature: 1.0,
      }
    });
    return response.text || "SITREP: NO CHANGE IN SECTOR STATUS.";
  } catch (error) {
    return "SIGINT: UNSTABLE CONNECTION DETECTED.";
  }
};
