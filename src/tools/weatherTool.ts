import { FunctionDeclaration, Type } from "@google/genai";

export const weatherToolDeclaration : FunctionDeclaration = {
    name: "get_weather",
    description: "Fetches Real Time Temperature and conditions for a travel destination.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.STRING,
                description: "City or Destination name for which the weather information is to be fetched. For example, 'New York', 'Paris', 'Tokyo', etc."
            }
        },
        required: ["location"]
    }

};

export async function execWeatherTool(args: {location: string}) : Promise<object>{
    return { 
        location : args.location,
        temperatureCelsius: 19.5,
        conditions: "partly cloudy" ,
        updatedAt: new Date().toISOString()
    };
}

