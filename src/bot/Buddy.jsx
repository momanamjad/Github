import { useState, useEffect, useRef } from "react"
import { callBuddy } from "./callBuddy"
import { useNavigate, useLocation } from "react-router-dom"
import { Bot, Send, X, User, Trash2, Volume2, VolumeX, Mic, MicOff, Settings, ArrowLeft } from "lucide-react"
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
    const [isMuted, setIsMuted] = useState(true)
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef(null)
    const [showSettings, setShowSettings] = useState(false)
    const [voices, setVoices] = useState([])
    const [selectedVoice, setSelectedVoice] = useState(null)

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

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            
            // Try to set a Jarvis-style voice (UK Male) initially
            const jarvisVoice = availableVoices.find(v => (v.name.includes("UK English Male") || v.lang === "en-GB") && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("George"))) || availableVoices.find(v => v.lang === "en-US" && v.name.includes("Male")) || availableVoices[0];
            
            const savedVoiceURI = localStorage.getItem('buddy_voice_uri');
            if (savedVoiceURI) {
                const match = availableVoices.find(v => v.voiceURI === savedVoiceURI);
                if (match) setSelectedVoice(match);
                else setSelectedVoice(jarvisVoice);
            } else {
                setSelectedVoice(jarvisVoice);
            }
        };

        loadVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

    }, [])

    const handleVoiceChange = (e) => {
        const v = voices.find(voice => voice.voiceURI === e.target.value);
        setSelectedVoice(v);
        if (v) {
            localStorage.setItem('buddy_voice_uri', v.voiceURI);
        }
    };

    const speak = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        // Strip out common markdown symbols so it sounds natural
        const plainText = text.replace(/[*_~`#><\]\[\-]/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
    }

    const startListening = () => {
        if (isListening || !recognitionRef.current) return;
        setInput("");
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.error("Speech start error:", err);
        }
    }

    const stopListening = () => {
        // Stop is handled gracefully, allowing recognition to finish its current block or stop manually
        if (!isListening || !recognitionRef.current) return;
        recognitionRef.current.stop();
        // setIsListening is usually handled in onend
    }

    const toggleListen = (e) => {
        if (e) e.stopPropagation();
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
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
            // Check if the click target is still in the DOM and if it's outside our container
            if (containerRef.current && !containerRef.current.contains(event.target) && document.contains(event.target)) {
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

    const toggleMute = () => {
        setIsMuted(prev => {
            const next = !prev;
            if (next && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            return next;
        });
    }

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
        <div ref={containerRef} className={`fixed z-[999] flex flex-col items-end transition-all ${open ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6' : 'bottom-6 right-6'}`}>
            {open && (
                <div className="w-full h-full sm:w-[320px] sm:h-[500px] sm:max-h-[75vh] flex flex-col bg-[#F6F8FA] sm:border sm:border-github-border sm:rounded-xl sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 relative sm:mb-4">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-[white] border-b border-github-border">
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
                            <button onClick={() => setOpen(false)} className="text-github-muted hover:text-github-text transition-colors cursor-pointer p-1">
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        <button onClick={() => setShowSettings(!showSettings)} title="Settings" className={`transition-colors cursor-pointer p-1 ${showSettings ? "text-github-link" : "text-github-muted hover:text-github-text"}`}>
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Credits Ticker */}
                    <div className="bg-[#f0f8ff] border-b border-github-border overflow-hidden whitespace-nowrap h-6 flex items-center">
                        <div className="inline-block animate-marquee-ltr text-[10px] font-medium text-github-link whitespace-nowrap">
                            ✨ {credits} credits remaining • Ask Buddy anything! • Enjoy your session! • 
                        </div>
                    </div>

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
                                    value={selectedVoice?.voiceURI || ''} 
                                    onChange={handleVoiceChange}
                                    className="w-full border border-github-border rounded-md px-2 py-2 text-sm bg-white text-github-text outline-none focus:border-github-link shadow-sm"
                                >
                                    {voices.map(v => {
                                        const isJarvisMatch = (v.name.includes("UK English Male") || v.lang === "en-GB") && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("George"));
                                        return (
                                            <option key={v.voiceURI} value={v.voiceURI}>
                                                {isJarvisMatch ? `🤖 J.A.R.V.I.S (Tony Stark - ${v.name})` : `${v.name} (${v.lang})`}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="text-[12px] text-github-muted bg-yellow-50 p-3 rounded-lg border border-yellow-200 shadow-sm mb-auto">
                                <strong>Pro Tip:</strong> For the best "Jarvis" feel, look for the 🤖 <strong>J.A.R.V.I.S</strong> option in the dropdown (requires a compatible UK English OS voice).
                            </div>

                            <div className="mt-4 p-4 border-t border-github-border sm:hidden">
                                <button onClick={() => {clearChat(); setShowSettings(false);}} className="text-red-500 flex items-center gap-2 text-sm font-medium hover:text-red-600 transition-colors cursor-pointer px-2 py-2 w-full bg-white rounded-md border border-red-200 shadow-sm justify-center">
                                    <Trash2 className="w-4 h-4" /> Clear Chat History
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 scrollbar-hide">
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
                    <div className="p-2 sm:p-3 bg-github-panel border-t border-github-border flex gap-1 sm:gap-2 items-center">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            placeholder={isListening ? "Listening..." : "Ask Buddy..."}
                            className={`flex-1 border border-github-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[12px] sm:text-[13px] focus:outline-none focus:border-github-link transition-colors ${isListening ? 'bg-red-50 text-red-600 placeholder-red-400' : 'bg-github-bg text-github-text'}`}
                        />
                        <button
                            onClick={toggleListen}
                            title={isListening ? "Stop Listening" : "Click to Speak"}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer border select-none ${isListening ? 'bg-red-500 text-white border-red-600 animate-pulse scale-105' : 'bg-github-panel text-github-muted border-github-border hover:text-github-text'}`}
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