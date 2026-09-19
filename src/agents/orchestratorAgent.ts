import { execWeatherTool } from "../tools/weatherTool";
import { FlightAgent } from "./flightAgent";
import { HotelAgent } from "./hotelAgent";


export class OrchestratorAgent {
  private hotelAgent = new HotelAgent();
  private flightAgent = new FlightAgent();     

  public async planTrip(departure: string, destination: string, budget: number, days: number): Promise<void> {
   console.log(`Planning trip from ${departure} to ${destination} with a budget of ${budget} INR for ${days} days.`);

   //Daily budget calculation
   let dailyBudget = Number((budget / days).toFixed(2));
   console.log(`Daily budget: ${dailyBudget} INR`);

   //Parallel execution of weather tool and hotel agent
   console.log(`Orchestrator invoking weather Tool and hotel Specialist concurrently.`);
   const [weatherInfo, hotelInfo] = await Promise.all([
     execWeatherTool({ location: destination }),
     this.hotelAgent.findHotels(destination, dailyBudget)
   ]);

   console.log(`Weather Info: ${JSON.stringify(weatherInfo)}`);
   console.log(`Hotel Info: ${JSON.stringify(hotelInfo)}`);

   //Sequentially calling  Flight agent 
    console.log(`Orchestrator invoking flight Specialist.`);
    
    const flightInfo = await this.flightAgent.sendMessage(`Find me a flight from ${departure} to ${destination} within a budget of ${budget} INR.`);

    console.log(`Flight Info: ${JSON.stringify(flightInfo)}`);
 }


}
