import { buddyTools } from "./buddyTools";
import { executeTool } from "./executeTool";
import { getStoredRepositories } from "../services/storageService";

// ── Constants ─────────────────────────────────────────────────────
const DAILY_LIMIT = 1500;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || ""}`;

// ── Helpers ───────────────────────────────────────────────────────

/** Increment today's query count and return the new value */
function incrementQueryCount() {
    const todayStr = new Date().toDateString();
    if (localStorage.getItem("gemini_last_query_date") !== todayStr) {
        localStorage.setItem("gemini_last_query_date", todayStr);
        localStorage.setItem("gemini_queries_today", "0");
    }
    const next = (parseInt(localStorage.getItem("gemini_queries_today") || "0")) + 1;
    localStorage.setItem("gemini_queries_today", String(next));
    return next;
}

/** Return true if today's count has already hit the limit */
function isRateLimited() {
    const todayStr = new Date().toDateString();
    if (localStorage.getItem("gemini_last_query_date") !== todayStr) return false;
    return parseInt(localStorage.getItem("gemini_queries_today") || "0") >= DAILY_LIMIT;
}

/** Build a human-readable "try again after X" message */
function make429Message() {
    const nextTime = new Date();
    nextTime.setMinutes(nextTime.getMinutes() + 1);
    const timeString = nextTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `Whoops! I'm getting too many requests too quickly (15 messages/minute limit) 🛑. Please try again in ~1 minute (after ${timeString}).`;
}

/** POST a payload to Gemini and return parsed JSON. Throws on network/HTTP error. */
async function geminiPost(payload, signal) {
    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Gemini API Error:", data);
        if (response.status === 429) throw new Error("__429__");
        throw new Error(data.error?.message || response.statusText || "Unknown API error");
    }

    return data;
}

/** Format stored chat history into Gemini's strict alternating role format */
function formatHistory(chatHistory) {
    const formatted = [];
    let lastRole = null;

    for (const m of chatHistory) {
        if (!m.text) continue;
        const role = m.role === "buddy" ? "model" : "user";

        if (role === lastRole) {
            // Merge consecutive same-role messages
            formatted[formatted.length - 1].parts[0].text += "\n\n" + m.text;
        } else {
            formatted.push({ role, parts: [{ text: m.text }] });
            lastRole = role;
        }
    }

    // Ensure history doesn't end with "user" before we append the new user message
    if (formatted.length > 0 && formatted[formatted.length - 1].role === "user") {
        formatted.push({ role: "model", parts: [{ text: "Got it. Please continue." }] });
    }

    return formatted;
}

// ── Main export ───────────────────────────────────────────────────

/**
 * Send a message to Buddy (Gemini) and return its text reply.
 * @param {string} userMessage
 * @param {Array}  chatHistory  - previous messages [{role, text}]
 * @param {string} currentPath  - current URL pathname for context
 * @param {AbortSignal} [signal] - optional AbortSignal for cancellation
 */
export async function callBuddy(userMessage, chatHistory = [], currentPath = "/", signal) {
    // Hard rate-limit guard — never charges quota if already exceeded
    if (isRateLimited()) {
        return `You've reached today's ${DAILY_LIMIT} message limit 🛑. Your quota resets at midnight. Come back tomorrow!`;
    }

    incrementQueryCount();

    const repos = getStoredRepositories();
    const formattedHistory = formatHistory(chatHistory);

    const systemPrompt = `You are Buddy, a helpful AI assistant embedded in a GitHub clone app.
The user is currently on page: "${currentPath}". Use this context when they ask "what am I looking at" or ask to navigate.
Available repositories: ${repos.map(r => r.name).join(", ") || "none"}.
Help the user manage their repositories, update their status, navigate the app, and interact with the terminal.
You can run terminal commands (PowerShell) and read terminal output to help the user with CLI tasks, git operations, and exploring the filesystem.
If the user asks to do something in the terminal and you are NOT on the /terminal page, first navigate there using openPage, then run the command.`;

    const basePayload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ functionDeclarations: buddyTools }],
    };

    try {
        // ── First call: may return a direct text reply OR a function call ──
        const firstData = await geminiPost({
            ...basePayload,
            contents: [
                ...formattedHistory,
                { role: "user", parts: [{ text: userMessage }] },
            ],
        }, signal);

        const firstCandidate = firstData.candidates?.[0];
        if (!firstCandidate?.content) {
            return "I didn't quite get that. Could you try again?";
        }

        const parts = firstCandidate.content.parts || [];
        const functionCallPart = parts.find(p => p.functionCall);
        const textPart = parts.find(p => p.text);

        // ── Tool call path ─────────────────────────────────────────────────
        if (functionCallPart) {
            const { name, args } = functionCallPart.functionCall;
            const toolResult = await executeTool(name, args);

            const followUpData = await geminiPost({
                ...basePayload,
                contents: [
                    ...formattedHistory,
                    { role: "user", parts: [{ text: userMessage }] },
                    { role: "model", parts: [functionCallPart] },
                    {
                        role: "user", parts: [{
                            functionResponse: {
                                name,
                                response: { name, content: toolResult },
                            },
                        }],
                    },
                ],
            }, signal);

            const nextParts = followUpData.candidates?.[0]?.content?.parts || [];
            return nextParts.find(p => p.text)?.text || "Done!";
        }

        // ── Direct text reply ──────────────────────────────────────────────
        return textPart?.text || "I'm not sure how to help with that.";

    } catch (err) {
        if (err.name === "AbortError") return null; // Request was intentionally cancelled
        if (err.message === "__429__") return make429Message();
        console.error("Buddy error:", err);
        return `Something went wrong: ${err.message}. Please check your internet connection and try again.`;
    }
}