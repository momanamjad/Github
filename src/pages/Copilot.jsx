import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, CornerDownLeft, RefreshCw, Terminal, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from "../services/apiClient";

export default function CopilotChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am GitHub Copilot, your AI pair programmer. How can I help you write, debug, or document code today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedPrompts = [
    { text: "Write a React hook for API polling", label: "React Hook" },
    { text: "Explain how CORS works in Express", label: "CORS Details" },
    { text: "Implement quicksort in JavaScript", label: "Algorithms" },
    { text: "Find bug: console errors with undefined values", label: "Debugging" }
  ];

  const handleSend = async (text) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await apiClient("/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: text })
      });
      
      const aiContent = res.data?.response || "I couldn't process that request at this moment.";
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error communicating with AI Copilot service: " + err.message
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded border-0 cursor-pointer transition-colors"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] max-w-7xl mx-auto bg-white dark:bg-[#0d1117] transition-colors border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden my-4">
      {/* Left sidebar: Prompts & Helper */}
      <div className="w-full lg:w-64 bg-[#f6f8fa] dark:bg-[#161b22] border-r border-[#d0d7de] dark:border-[#30363d] p-4 flex flex-col justify-between">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-[#1f2328] dark:text-white">Copilot Suggestions</h3>
          </div>
          <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
            Select a preset prompt below to test intelligent responses and code completion structures.
          </p>
          <div className="space-y-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="w-full text-left p-2.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] hover:border-purple-500 dark:hover:border-purple-500 rounded-md text-xs font-semibold cursor-pointer text-[#1f2328] dark:text-[#c9d1d9] transition-all hover:shadow-sm"
              >
                <div className="text-purple-600 dark:text-purple-400 font-bold mb-0.5">{p.label}</div>
                <div className="truncate text-gray-500">{p.text}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-3 text-left space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold block uppercase tracking-wider">Workspace Mode</span>
          <div className="flex items-center gap-1.5 text-xs text-[#24292f] dark:text-white font-semibold">
            <Terminal size={14} className="text-purple-600" />
            <span>Interactive Chatbot</span>
          </div>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#0d1117]">
        {/* Messages drawer */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl text-left ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${m.role === 'user' ? 'bg-[#ebedf0] border-gray-300 dark:bg-gray-800' : 'bg-purple-100 border-purple-300 text-purple-700'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`relative px-4 py-2.5 rounded-lg text-xs md:text-sm shadow-sm ${m.role === 'user' ? 'bg-purple-600 text-white font-medium' : 'bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#c9d1d9] prose dark:prose-invert max-w-full'}`}>
                {m.role === 'assistant' ? (
                  <div className="relative pt-2">
                    <ReactMarkdown
                      components={{
                        pre: ({ node, ...props }) => (
                          <div className="relative my-2">
                            <pre className="p-3 bg-[#ebedf0] dark:bg-[#0d1117] rounded-md overflow-x-auto text-xs font-mono leading-relaxed" {...props} />
                            <CopyButton text={node?.children?.[0]?.children?.[0]?.value || props.children?.props?.children || ""} />
                          </div>
                        ),
                        code: ({ ...props }) => <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded font-mono text-purple-600 dark:text-purple-400" {...props} />
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span>{m.content}</span>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-3xl text-left">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-purple-100 border-purple-300 text-purple-700 shrink-0">
                <Bot size={16} />
              </div>
              <div className="px-4 py-2.5 rounded-lg bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] flex items-center gap-1">
                <RefreshCw size={14} className="animate-spin text-purple-600" />
                <span className="text-xs text-[#57606a] dark:text-[#8b949e]">Copilot is typing…</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 relative bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500"
          >
            <input
              type="text"
              placeholder="Ask Copilot a question or start coding..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-xs md:text-sm text-[#1f2328] dark:text-white placeholder-gray-400 py-1.5"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors cursor-pointer border-0 shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
            <span>Copilot responses are generated using advanced coding models.</span>
            <div className="flex items-center gap-1">
              <span>Press Enter</span>
              <CornerDownLeft size={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
