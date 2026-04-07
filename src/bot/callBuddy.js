import { buddyTools } from "./buddyTools"
import { executeTool } from "./executeTool"
import { getStoredRepositories } from "../services/storageService"

export async function callBuddy(userMessage, chatHistory = [], currentPath = "/") {
    const repos = getStoredRepositories();

    // Track Daily Gemini Queries limit (1500 RPM for free tier)
    let queriesToday = parseInt(localStorage.getItem('gemini_queries_today') || '0');
    const todayStr = new Date().toDateString();
    if (localStorage.getItem('gemini_last_query_date') !== todayStr) {
        queriesToday = 0;
        localStorage.setItem('gemini_last_query_date', todayStr);
    }
    
    localStorage.setItem('gemini_queries_today', (queriesToday + 1).toString());

    // Format previous messages for Gemini context
    // Gemini API enforces STRICT alternation between 'user' and 'model'.
    const formattedHistory = [];
    let lastRole = null;

    for (const m of chatHistory) {
        if (!m.text) continue;
        const role = m.role === "buddy" ? "model" : "user";
        
        if (role === lastRole) {
            // Merge consecutive messages of the same role
            formattedHistory[formattedHistory.length - 1].parts[0].text += "\n\n" + m.text;
        } else {
            formattedHistory.push({ role, parts: [{ text: m.text }] });
            lastRole = role;
        }
    }

    // Edge case: if we are about to inject a "userMessage", but the history already ends with a "user", we should merge it, 
    // OR we can just inject a dummy model confirmation to act as a buffer. 
    // But since `firstPayload` adds { role: "user", parts: [{ text: userMessage }] }, 
    // let's ensure the last item in formattedHistory is NOT 'user'.
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user") {
        formattedHistory.push({ role: "model", parts: [{ text: "Got it. Please continue." }] });
    }


    const systemPrompt = `You are Buddy, a helpful assistant inside a GitHub clone app.
The user is currently browsing the page URL path: "${currentPath}". Use this context if they ask things like "what am I looking at" or "pin this/this page".
Current repos: ${repos.map(r => r.name).join(", ") || "none"}.
Help the user manage their repos using the available tools.`

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const basePayload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        tools: [{
            functionDeclarations: buddyTools
        }],
    }

    const firstPayload = {
        ...basePayload,
        contents: [
            ...formattedHistory,
            { role: "user", parts: [{ text: userMessage }] }
        ]
    }

    // First API call
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firstPayload)
    })

    const data = await response.json()

    if (!response.ok) {
        console.error("Gemini API Error:", data);
        if (response.status === 429) {
            const nextTime = new Date();
            nextTime.setMinutes(nextTime.getMinutes() + 1);
            const timeString = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `Whoops, I'm receiving too many requests too quickly (I have a 15 messages/minute speed limit) 🛑! Please give me a breather and try again in 1 minute (after ${timeString}).`;
        }
        return `API Error: ${data.error?.message || response.statusText}. Please check your Gemini API Key in the .env file.`;
    }

    const firstCandidate = data.candidates?.[0];
    if (!firstCandidate || !firstCandidate.content) {
        return "I didn't quite get that. Could you try again?";
    }

    const parts = firstCandidate.content.parts || [];
    const functionCallPart = parts.find(p => p.functionCall);
    const textPart = parts.find(p => p.text);

    if (functionCallPart) {
        const { name, args } = functionCallPart.functionCall;
        
        // Execute the tool locally
        const toolResult = executeTool(name, args)

        // Second API call — send tool result back to Gemini
        const followUpPayload = {
            ...basePayload,
            contents: [
                ...formattedHistory,
                { role: "user", parts: [{ text: userMessage }] },
                { role: "model", parts: [functionCallPart] },
                { role: "user", parts: [{
                    functionResponse: {
                        name: name,
                        response: {
                           name: name,
                           content: toolResult
                        }
                    }
                }]}
            ]
        }

        const followUpResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(followUpPayload)
        })

        const followUpData = await followUpResponse.json()
        if (!followUpResponse.ok) {
            console.error("Gemini API Error (Tool Response):", followUpData);
            if (followUpResponse.status === 429) {
                const nextTime = new Date();
                nextTime.setMinutes(nextTime.getMinutes() + 1);
                const timeString = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `Whoops, I'm receiving too many requests too quickly (I have a 15 messages/minute speed limit) 🛑! Please give me a breather and try again in 1 minute (after ${timeString}).`;
            }
            return `API Error: ${followUpData.error?.message || followUpResponse.statusText}`;
        }

        const nextCandidate = followUpData.candidates?.[0];
        const nextParts = nextCandidate?.content?.parts || [];
        return nextParts.find(p => p.text)?.text || "Done!";
    }

    // Direct text response
    return textPart?.text || "I'm not sure how to help with that.";
}