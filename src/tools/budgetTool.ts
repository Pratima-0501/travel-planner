import { FunctionDeclaration, Type } from "@google/genai";

export const BudgetToolDeclaration : FunctionDeclaration = {
    name: "get_budget",
    description: "Accurately computes daily available budget given total budget and days.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            totalBudget: {
                type: Type.NUMBER,
                description: "The total budget allocated for the trip in INR (Indian Rupees)."
            },
            days: {
                type: Type.INTEGER,
                description: "The number of days for which to compute the daily budget."
            }
        },
        required: ["totalBudget", "days"]
    }

};

export async function execBudgetTool(args: {totalBudget: number, days: number}) : Promise<object>{
    if(args.days <= 0) 
        return { error: "Number of days must be greater than zero." };
    
    const dailyBudget = args.totalBudget / args.days;
    return {
        totalBudget: args.totalBudget,
        days: args.days,
        dailyBudget: Number(dailyBudget.toFixed(2)),
        currency: "INR"
    };
}
                