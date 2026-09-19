import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

export class HotelAgent {
  private ai: GoogleGenAI;
  private model = "gemini-3.6-flash";   

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    this.ai = new GoogleGenAI(apiKey ? { apiKey } : {});
  }


public async findHotels(city: string, budget: number): Promise<string> {
    const prompts=`Suggest me a hotel in ${city} with a budget of ${budget} INR. Provide the hotel name, address, and price per night.`;
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompts,
      config: {
        systemInstruction: "You are a hotel specialist AI agent. Your goal is to help users find hotels based on their city and budget. Provide concise and relevant information about the hotel, including name, address, and price per night.Give us two distinct hotels atleast.",
      },
    });

    console.log("AI Response:", response);
    return response.text ? response.text : "I'm sorry, I couldn't find the requested hotels.";
 }
}

