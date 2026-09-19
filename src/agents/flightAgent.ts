import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import { Message, TripState } from "../types";

dotenv.config();

export class FlightAgent {
  private ai: GoogleGenAI;
  private model= "gemini-2.5-flash";

  public history: Message[] = [];
  public tripState: TripState = {};

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
    });
  }

    private getInstructions(): string {
    return `You are a flight specialist Ai agent.
    Your only goal is to help users to find flight routes and extract trip details.
    Current structured state of the trip is: ${JSON.stringify(this.tripState)}.
    If the user mentions a departure city, destination or budget, actively acknowledge updating the trip state.
    Never answer general trivia outside travel and transit logistics.`;
    }

    public async sendMessage(userInput: string): Promise<string> {
    this.history.push({ role: "user", parts: [{ text: userInput }] });
   
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: this.history,
      config: {
        systemInstruction: this.getInstructions(),
        temperature:0.2,
      },
    });

    console.log("AI Response:", response);
    const reply = response.text;
    this.history.push({ role: "assistant", parts: [{ text: reply !}] });
    return reply ? reply : "I'm sorry, I couldn't generate a response.";
  }
}