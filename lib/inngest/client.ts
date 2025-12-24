import { Inngest } from "inngest";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined');
}

export const inngest = new Inngest({
    id: 'stock-sense',
    ai: { gemini: { apiKey: GEMINI_API_KEY } }
})