import { GoogleGenAI } from '@google/genai';
import { fetchLiveWeather, computeDailyBudget } from '../tools/weatherTool';
import { FlightAgent } from './flightAgent';
import { HotelAgent } from './hotelAgent';

export class CoordinatorAgent {
  private ai: GoogleGenAI;
  private flightAgent: FlightAgent;
  private hotelAgent: HotelAgent;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.flightAgent = new FlightAgent();
    this.hotelAgent = new HotelAgent();
  }

  public async runOrchestration(userPrompt: string): Promise<string> {
    // 1. Tool & Sub-agent Extraction: Check if prompt requires live tools / specialists
    let extraContext = '';
    const lower = userPrompt.toLowerCase();

    // Check for weather requests
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('climate')) {
      const match = lower.match(/(?:in|at|for)\s+([a-zA-Z\s]+?)(?:\s+(?:with|and|for|\$|\d)|$)/);
      const city = match?.[1]?.trim() || 'Tokyo';
      try {
        const liveWeather = await fetchLiveWeather(city);
        extraContext += `\n[Live Weather Tool Result: ${liveWeather}]`;
      } catch (err) {
        console.error('Weather tool error:', err);
      }
    }

    // Check for budget breakdown requests
    const budgetMatch = lower.match(/(?:₹|\$|inr)?\s*(\d+)\s*(?:total|budget).+(\d+)\s*days/i) 
      || lower.match(/(\d+)\s*days?.+?(?:budget|total).+?(?:₹|\$|inr)?\s*(\d+)/i);
    let calculatedBudget = 0;
    if (budgetMatch) {
      const isDaysFirst = lower.indexOf('day') < lower.indexOf('budget');
      const daysStr = isDaysFirst ? budgetMatch[1] : budgetMatch[2];
      const budgetStr = isDaysFirst ? budgetMatch[2] : budgetMatch[1];
      if (daysStr && budgetStr) {
        const days = parseInt(daysStr, 10);
        const budget = parseFloat(budgetStr);
        calculatedBudget = budget;
        const budgetResult = computeDailyBudget(budget, days);
        extraContext += `\n[Budget Math Result: ${budgetResult}]`;
      }
    }

    // Consult Flight Specialist if transit/flight/trip planning is requested
    if (lower.includes('flight') || lower.includes('airline') || lower.includes('ticket') || lower.includes('fly') || lower.includes('trip') || lower.includes('travel')) {
      try {
        const flightAdvice = await this.flightAgent.sendMessage(userPrompt);
        extraContext += `\n[Flight Specialist Insights:\n${flightAdvice}]`;
      } catch (err) {
        console.error('Flight agent error:', err);
      }
    }

    // Consult Hotel Specialist if hotels/lodging are requested
    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort') || lower.includes('lodging') || lower.includes('trip') || lower.includes('travel')) {
      const destinationMatch = lower.match(/(?:to|in|at)\s+([a-zA-Z\s]+?)(?:\s+(?:with|for|under|from|\$|₹|\d)|$)/);
      const city = destinationMatch?.[1]?.trim() || 'the destination';
      try {
        const hotelAdvice = await this.hotelAgent.findHotels(city, calculatedBudget || 5000);
        extraContext += `\n[Hotel Specialist Recommendations:\n${hotelAdvice}]`;
      } catch (err) {
        console.error('Hotel agent error:', err);
      }
    }

    // 2. Synthesize using Gemini
    const systemPrompt = `You are a helpful, production-grade Travel Coordinator Multi-Agent System called "Ticket Wale Bhaiya".
You orchestrate flight, hotel, and sightseeing specialists.
Use the verified tool data and specialist agent recommendations below when formulating your response. Be direct, clear, and well-structured using markdown tables, bullet points, and headings.
Verified Specialist and Tool Data:
${extraContext || 'None'}`;

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
    let lastError: unknown = null;
    for (const modelName of modelsToTry) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });
        if (response.text) {
          console.log('ticket wale bhaiya says : ', response.text)
          return response.text;
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed, trying fallback:`, err);
        lastError = err;
      }
    }

    if (lastError) throw lastError;
    return 'No response generated from the agent team.';
  }

  // Alias for backward-compatibility with server.ts
  public async planCompleteTrip(userPrompt: string): Promise<string> {
    return this.runOrchestration(userPrompt);
  }

  // Helper for CLI test scripts (e.g. index.ts)
  public async planTrip(departure: string, destination: string, budget: number, days: number): Promise<string> {
    const prompt = `Plan a ${days}-day trip from ${departure} to ${destination} with a total budget of ${budget} INR.`;
    return this.runOrchestration(prompt);
  }
}

export { CoordinatorAgent as OrchestratorAgent };