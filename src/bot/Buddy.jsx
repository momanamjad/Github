import { useState, useEffect, useRef } from "react"
import { callBuddy } from "./callBuddy"
import { useNavigate, useLocation } from "react-router-dom"
import { Bot, Send, X, User, Trash2, Volume2, VolumeX, Mic, MicOff } from "lucide-react"
import { getStoredUser } from "../services/storageService"
import ReactMarkdown from 'react-markdown'

export default function Buddy() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('buddy_chat_history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    })
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const messagesEndRef = useRef(null)
    const containerRef = useRef(null) // Added for outside click detection
    const [user, setUser] = useState(null)
    const [credits, setCredits] = useState(1500)
    const [isMuted, setIsMuted] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef(null)

    useEffect(() => {
        // Init Speech Recognition
        if ('window' in globalThis && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = (e) => {
                console.error("Speech Error:", e);
                setIsListening(false);
            }
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, [])

    const toggleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setInput("");
            recognitionRef.current?.start();
            setIsListening(true);
        }
    }

    const speak = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        // Strip out common markdown symbols so it sounds natural
        const plainText = text.replace(/[*_~`#><\]\[\-]/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        window.speechSynthesis.speak(utterance);
    }

    useEffect(() => {
        setUser(getStoredUser())
        const queries = parseInt(localStorage.getItem('gemini_queries_today') || '0');
        setCredits(1500 - queries);
        
        // Auto-save history each time it updates
        localStorage.setItem('buddy_chat_history', JSON.stringify(messages));
    }, [messages])

    // Auto-scroll to bottom of chat

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, loading])

    // Listen to custom navigation events fired by executeTool
    useEffect(() => {
        const handleNavigate = (e) => {
            if (e.detail?.path) {
                navigate(e.detail.path)
                setOpen(false) // Optionally close chat when navigating
            }
        }
        window.addEventListener('github_navigate', handleNavigate)
        return () => window.removeEventListener('github_navigate', handleNavigate)
    }, [navigate])

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [open])

    const sendMessage = async () => {
        if (!input.trim()) return
        const userMsg = input
        setInput("")
        setMessages(prev => [...prev, { role: "user", text: userMsg }])
        setLoading(true)

        // Pass messages AND current path
        const reply = await callBuddy(userMsg, messages, location.pathname)
        setMessages(prev => [...prev, { role: "buddy", text: reply }])
        speak(reply)
        setLoading(false)
    }
    
    const clearChat = () => {
        setMessages([])
    }

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
            {open && (
                <div className="mb-4 w-[calc(100vw-32px)] sm:w-80 h-[500px] max-h-[70vh] flex flex-col bg-[#F6F8FA] border border-github-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[white] border-b border-github-border">
                        <div className="flex items-center gap-2 font-semibold text-github-text">
                            <Bot className="w-5 h-5 text-github-link" />
                            <span>Buddy</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] text-github-muted font-medium bg-gray-100 px-2 py-1 rounded-md">
                                {credits} credits left
                            </span>
                            <button onClick={() => setIsMuted(prev => !prev)} title={isMuted ? "Unmute Buddy" : "Mute Buddy"} className="text-github-muted hover:text-github-text transition-colors cursor-pointer">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button onClick={clearChat} title="Clear Chat" className="text-github-muted hover:text-red-500 transition-colors cursor-pointer">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => setOpen(false)} className="text-github-muted hover:text-github-text transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="text-center text-github-muted text-sm mt-4">
                                Hi there! I'm Buddy. I can help manage, star, or pin repositories, update your status, and navigate around!
                            </div>
                        )}
                        {messages.map((m, i) => {
                            const isUser = m.role === "user";
                            return (
                                <div key={i} className={`flex gap-2 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}>
                                    <div className="flex-shrink-0 mt-1">
                                        {isUser ? (
                                            <div className="w-6 h-6 rounded-full bg-github-border overflow-hidden flex items-center justify-center">
                                                {user?.avatar_url ? (
                                                    <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-github-text" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-github-panel border border-github-border flex items-center justify-center text-github-link">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`rounded-2xl px-4 py-2 text-[13px] break-words shadow-sm overflow-hidden ${isUser
                                            ? "bg-[#0969da] text-white rounded-tr-none"
                                            : "bg-[#e1e4e8] text-[#24292f] rounded-tl-none border border-[#d1d5da] markdown-body"
                                            }`}
                                    >
                                        {isUser ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
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
                                    <div className="w-1.5 h-1.5 bg-[#24292f] rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
                                    <div className="w-1.5 h-1.5 bg-[#24292f] rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                                    <div className="w-1.5 h-1.5 bg-[#24292f] rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-github-panel border-t border-github-border flex gap-2 items-center">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            placeholder={isListening ? "Listening..." : "Ask Buddy to do something..."}
                            className={`flex-1 border border-github-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-github-link transition-colors ${isListening ? 'bg-red-50 text-red-600 placeholder-red-400' : 'bg-github-bg text-github-text'}`}
                        />
                        <button
                            onClick={toggleListen}
                            title="Speak to Buddy"
                            className={`p-2 rounded-lg transition-colors cursor-pointer border ${isListening ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-github-panel text-github-muted border-github-border hover:text-github-text'}`}
                        >
                             {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="p-2 bg-[#238636] text-white rounded-lg disabled:opacity-50 transition-colors cursor-pointer hover:bg-[#2ea043]"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center w-14 h-14 bg-github-panel border border-github-border text-github-text rounded-full shadow-lg cursor-pointer"
                >
                    <Bot className="w-7 h-7" />
                </button>
            )}
        </div>
    )
}