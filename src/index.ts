import { FlightAgent } from "./agents/flightAgent";
import { OrchestratorAgent } from "./agents/orchestratorAgent";

async function main() {
    const orchestratorAgent = new OrchestratorAgent();
    const userInput = "Plan a 5 days trip to Indore with a total budget of 10000 INR.";
    try 
    {
        const response = await orchestratorAgent.planTrip("New Delhi", "Indore", 10000, 5);
        console.log("AI Response:", response);
    } 
    catch (error) {
        console.error("Error planning trip:", error);
    }
}

main();