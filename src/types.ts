export interface TripState {
    departure?: string;
    destination?: string;
    budget?: number;
    passengers?: number;
}

export interface Message {
    role: "user" | "assistant";
    parts: [{ text: string }];
}