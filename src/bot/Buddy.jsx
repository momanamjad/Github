import { useState, useEffect, useRef, useCallback } from "react";
import { callBuddy } from "./callBuddy";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot, Send, X, User, Trash2, Volume2, VolumeX, Mic, MicOff, Settings, ArrowLeft } from "lucide-react";
import { useScrollLock } from "../hooks/useScrollLock";

import { getStoredUser } from "../services/storageService";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

// ─── Constants ────────────────────────────────────────────────────
const DAILY_LIMIT = 1500;
const STORAGE_KEY_HISTORY = "buddy_chat_history";
const STORAGE_KEY_VOICE   = "buddy_voice_uri";
const STORAGE_KEY_QUERIES = "gemini_queries_today";

// ─── Helpers ──────────────────────────────────────────────────────
function loadPersistedMessages() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
        const parsed = saved ? JSON.parse(saved) : [];
        // Ensure every stored message has a stable id
        return parsed.map(m => ({ id: crypto.randomUUID(), ...m }));
    } catch {
        return [];
    }
}

function getCurrentCredits() {
    return DAILY_LIMIT - parseInt(localStorage.getItem(STORAGE_KEY_QUERIES) || "0");
}

// ─── Main Component ───────────────────────────────────────────────
export default function Buddy() {
    const [open, setOpen]               = useState(false);
    const [messages, setMessages]       = useState(loadPersistedMessages);
    const [input, setInput]             = useState("");
    const [loading, setLoading]         = useState(false);
    const [user, setUser]               = useState(null);
    const [credits, setCredits]         = useState(getCurrentCredits);
    const [isMuted, setIsMuted]         = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [voices, setVoices]           = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);

    const navigate      = useNavigate();
    const location      = useLocation();
    const messagesEndRef = useRef(null);
    const containerRef  = useRef(null);
    const recognitionRef = useRef(null);
    const abortRef      = useRef(null); // AbortController for in-flight Gemini requests

    // ── Load user once on mount ────────────────────────────────────
    useEffect(() => {
        const id = setTimeout(() => setUser(getStoredUser()), 0);
        return () => clearTimeout(id);
    }, []);

    // ── Persist messages to localStorage whenever they change ─────
    useEffect(() => {
        // Strip transient `id` field before persisting (id is runtime-only)
        const toStore = messages.map(({ id: _, ...rest }) => rest); // id intentionally omitted
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(toStore));
        // Defer credit update to avoid synchronous setState-in-effect
        const id = setTimeout(() => setCredits(getCurrentCredits()), 0);
        return () => clearTimeout(id);
    }, [messages]);

    // ── Speech Recognition setup (once on mount) ──────────────────
    useEffect(() => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            const rec = new SpeechRec();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = "en-US";
            rec.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
            rec.onerror  = (e) => { console.error("Speech error:", e); setIsListening(false); };
            rec.onend    = ()  => setIsListening(false);
            recognitionRef.current = rec;
        }

        // Speech Synthesis voices
        const loadVoices = () => {
            const available = window.speechSynthesis?.getVoices() ?? [];
            setVoices(available);
            const savedURI = localStorage.getItem(STORAGE_KEY_VOICE);
            const saved    = savedURI ? available.find(v => v.voiceURI === savedURI) : null;
            const jarvis   = available.find(
                v => (v.lang === "en-GB") && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("George"))
            ) ?? available[0] ?? null;
            setSelectedVoice(saved ?? jarvis);
        };

        loadVoices();
        if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;

        // Cleanup any in-flight request on unmount
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    // ── Auto-scroll ────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // ── Custom navigation events from executeTool ──────────────────
    useEffect(() => {
        const handleNavigate = (e) => {
            if (e.detail?.path) { navigate(e.detail.path); setOpen(false); }
        };
        window.addEventListener("github_navigate", handleNavigate);
        return () => window.removeEventListener("github_navigate", handleNavigate);
    }, [navigate]);

    // ── Close on outside click (only when open) ────────────────────
    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target) && document.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [open]);

    useScrollLock(open);



    // ── Voice helpers ──────────────────────────────────────────────
    const handleVoiceChange = useCallback((e) => {
        const v = voices.find(voice => voice.voiceURI === e.target.value) ?? null;
        setSelectedVoice(v);
        if (v) localStorage.setItem(STORAGE_KEY_VOICE, v.voiceURI);
    }, [voices]);

    const speak = useCallback((text) => {
        if (isMuted || !window.speechSynthesis) return;
        const plain = text.replace(/[*_~`#><[\]-]/g, "");
        const utt = new SpeechSynthesisUtterance(plain);
        if (selectedVoice) utt.voice = selectedVoice;
        window.speechSynthesis.speak(utt);
    }, [isMuted, selectedVoice]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev && window.speechSynthesis) window.speechSynthesis.cancel();
            return !prev;
        });
    }, []);

    // ── Microphone ────────────────────────────────────────────────
    const toggleListen = useCallback((e) => {
        e?.stopPropagation();
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput("");
            try { recognitionRef.current.start(); setIsListening(true); }
            catch (err) { console.error("Speech start error:", err); }
        }
    }, [isListening]);

    // ── Send message ───────────────────────────────────────────────
    const sendMessage = useCallback(async () => {
        if (!input.trim() || loading) return;
        const userText = input.trim();
        setInput("");

        const userMsg = { id: crypto.randomUUID(), role: "user", text: userText };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        // Cancel any previous in-flight request
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        // Pass history WITHOUT the message we just added (callBuddy appends it)
        const historyForCall = messages.map(({ id: _id, ...rest }) => rest);
        const reply = await callBuddy(userText, historyForCall, location.pathname, abortRef.current.signal);

        if (reply !== null) {
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "buddy", text: reply }]);
            speak(reply);
        }
        setLoading(false);
    }, [input, loading, messages, location.pathname, speak]);

    const clearChat = useCallback(() => setMessages([]), []);

    // ─── Render ────────────────────────────────────────────────────
    const isJarvis = (v) =>
        (v.lang === "en-GB") && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("George"));

    return (
        <div
            ref={containerRef}
            className={`fixed z-[999] flex flex-col items-end transition-all ${open ? "inset-0 sm:inset-auto sm:bottom-6 sm:right-6" : "bottom-6 right-6"}`}
        >
            {open && (
                <div className="w-full h-full sm:w-[320px] sm:h-[500px] sm:max-h-[75vh] flex flex-col bg-[#F6F8FA] sm:border sm:border-github-border sm:rounded-xl sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 relative sm:mb-4">

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-white border-b border-github-border">
                        <div className="flex items-center gap-2 font-semibold text-github-text">
                            <Bot className="w-5 h-5 text-github-link" />
                            <span>Buddy</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button onClick={toggleMute} title={isMuted ? "Unmute Buddy" : "Mute Buddy"} className="text-github-muted hover:text-github-text transition-colors cursor-pointer p-1">
                                {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                            <button onClick={clearChat} title="Clear Chat" className="text-github-muted hover:text-red-500 transition-colors cursor-pointer hidden sm:block p-1">
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={() => setShowSettings(s => !s)}
                                title="Settings"
                                className={`transition-colors cursor-pointer p-1 ${showSettings ? "text-github-link" : "text-github-muted hover:text-github-text"}`}
                            >
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button onClick={() => setOpen(false)} className="text-github-muted hover:text-github-text transition-colors cursor-pointer p-1">
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Credits Ticker ── */}
                    <div className="bg-[#f0f8ff] border-b border-github-border overflow-hidden whitespace-nowrap h-6 flex items-center">
                        <div className="inline-block animate-marquee-ltr text-[10px] font-medium text-github-link whitespace-nowrap">
                            ✨ {credits} credits remaining • Ask Buddy anything! • Enjoy your session! •
                        </div>
                    </div>

                    {/* ── Settings Panel ── */}
                    {showSettings && (
                        <div className="absolute top-0 left-0 w-full h-full bg-[#F6F8FA] z-20 p-4 overflow-y-auto scrollbar-hide slide-in-from-right-2 animate-in duration-200 flex flex-col">
                            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-github-border">
                                <button onClick={() => setShowSettings(false)} className="text-github-muted hover:text-github-text transition-colors p-1 rounded-md hover:bg-gray-200">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h3 className="font-semibold text-sm text-github-text">Bot Settings</h3>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-github-muted mb-1">Voice Selection</label>
                                <select
                                    value={selectedVoice?.voiceURI ?? ""}
                                    onChange={handleVoiceChange}
                                    className="w-full border border-github-border rounded-md px-2 py-2 text-sm bg-white text-github-text outline-none focus:border-github-link shadow-sm"
                                >
                                    {voices.map(v => (
                                        <option key={v.voiceURI} value={v.voiceURI}>
                                            {isJarvis(v) ? `🤖 J.A.R.V.I.S (${v.name})` : `${v.name} (${v.lang})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-[12px] text-github-muted bg-yellow-50 p-3 rounded-lg border border-yellow-200 shadow-sm mb-auto">
                                <strong>Pro Tip:</strong> For the best &ldquo;Jarvis&rdquo; feel, look for the 🤖 <strong>J.A.R.V.I.S</strong> option (requires a UK English OS voice).
                            </div>

                            <div className="mt-4 p-4 border-t border-github-border sm:hidden">
                                <button
                                    onClick={() => { clearChat(); setShowSettings(false); }}
                                    className="text-red-500 flex items-center gap-2 text-sm font-medium hover:text-red-600 transition-colors cursor-pointer px-2 py-2 w-full bg-white rounded-md border border-red-200 shadow-sm justify-center"
                                >
                                    <Trash2 className="w-4 h-4" /> Clear Chat History
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Chat Area ── */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="text-center text-github-muted text-sm mt-4">
                                Hi! I&rsquo;m Buddy. I can manage, star, or pin repositories, update your status, and navigate the app!
                            </div>
                        )}

                        {messages.map((m) => {
                            const isUser = m.role === "user";
                            return (
                                <div key={m.id} className={`flex gap-2 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}>
                                    <div className="flex-shrink-0 mt-1">
                                        {isUser ? (
                                            <div className="w-6 h-6 rounded-full bg-github-border overflow-hidden flex items-center justify-center">
                                                {user?.avatar_url
                                                    ? <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                                                    : <User className="w-4 h-4 text-github-text" />
                                                }
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-github-panel border border-github-border flex items-center justify-center text-github-link">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`rounded-2xl px-4 py-2 text-[13px] break-words shadow-sm overflow-hidden ${
                                        isUser
                                            ? "bg-[#0969da] text-white rounded-tr-none"
                                            : "bg-[#e1e4e8] text-[#24292f] rounded-tl-none border border-[#d1d5da] markdown-body"
                                    }`}>
                                        {isUser
                                            ? m.text
                                            : <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{m.text}</ReactMarkdown>
                                        }
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="self-start flex items-center gap-2 text-github-muted text-xs mb-2">
                                <div className="w-6 h-6 rounded-full bg-github-panel border border-github-border flex items-center justify-center text-github-link">
                                    <Bot className="w-4 h-4 animate-bounce" />
                                </div>
                                <div className="flex gap-1 items-center px-3 py-2 bg-[#e1e4e8] rounded-2xl rounded-tl-none border border-[#d1d5da]">
                                    <div className="w-1.5 h-1.5 bg-[#24292f] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-1.5 h-1.5 bg-[#24292f] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-1.5 h-1.5 bg-[#24292f] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Input Area ── */}
                    <div className="p-2 sm:p-3 bg-github-panel border-t border-github-border flex gap-1 sm:gap-2 items-center">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            placeholder={isListening ? "Listening..." : "Ask Buddy..."}
                            className={`flex-1 border border-github-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[12px] sm:text-[13px] focus:outline-none focus:border-github-link transition-colors ${
                                isListening ? "bg-red-50 text-red-600 placeholder-red-400" : "bg-github-bg text-github-text"
                            }`}
                        />
                        <button
                            onClick={toggleListen}
                            title={isListening ? "Stop Listening" : "Click to Speak"}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer border select-none ${
                                isListening
                                    ? "bg-red-500 text-white border-red-600 animate-pulse scale-105"
                                    : "bg-github-panel text-github-muted border-github-border hover:text-github-text"
                            }`}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="p-1.5 sm:p-2 bg-[#238636] text-white rounded-lg disabled:opacity-50 transition-colors cursor-pointer hover:bg-[#2ea043]"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}





            {/* ── FAB Toggle ── */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 border border-github-border ${
                        location.pathname === "/terminal" 
                            ? "bg-white text-github-text shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                            : "bg-github-panel text-github-text hover:bg-github-panelHover"
                    }`}
                    title="Open Buddy"
                >
                    <Bot className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
            )}
        </div>
    );
}