"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import {
    PlusIcon,
    ArrowUpIcon,
    Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
    role: "user" | "model";
    parts: string;
    isError?: boolean;
}

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    return { textareaRef, adjustHeight };
}

export function IceBourgAssistant() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", parts: "Hello! I'm the IceBourg AI. How can I help you with your design or development needs today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 200,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!value.trim() || isLoading) return;

        const userMessage = value;
        setValue("");
        adjustHeight(true);
        setIsLoading(true);

        const newMessages: Message[] = [...messages, { role: "user", parts: userMessage }];
        setMessages(newMessages);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: userMessage,
                    history: messages
                        .filter(m => !m.isError)
                        .map(m => ({
                            role: m.role,
                            parts: [{ text: m.parts }]
                        }))
                }),
            });

            const data = await response.json();
            if (data.text) {
                setMessages([...newMessages, { role: "model", parts: data.text }]);
            } else if (data.error) {
                setMessages([...newMessages, { role: "model", parts: data.error, isError: true }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: "model", parts: "Sorry, I encountered a connection error. Please check your internet and try again.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && value.trim()) {
                handleSendMessage();
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-full max-w-4xl mx-auto">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex flex-col max-w-[85%]",
                                msg.role === "user" ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                msg.role === "user" 
                                    ? "bg-white text-black rounded-tr-none" 
                                    : "bg-neutral-900 text-zinc-200 border border-neutral-800 rounded-tl-none"
                            )}>
                                {msg.parts}
                            </div>
                            <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-medium">
                                {msg.role === "user" ? "You" : "IceBourg AI"}
                            </span>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 text-zinc-500 text-xs px-2"
                        >
                            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-900 bg-black/50 backdrop-blur-xl">
                <div className="relative bg-neutral-900 rounded-xl border border-neutral-800 focus-within:border-neutral-700 transition-colors">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className={cn(
                            "w-full px-4 py-3",
                            "resize-none bg-transparent border-none",
                            "text-white text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-neutral-500 min-h-[48px]"
                        )}
                        style={{ overflow: "hidden" }}
                    />

                    <div className="flex items-center justify-between p-2 border-t border-neutral-800/50">
                        <div className="flex items-center gap-1">
                            <button type="button" className="p-2 hover:bg-neutral-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <button type="button" className="px-2 py-1 text-[10px] font-medium text-zinc-400 hover:bg-neutral-800 rounded-md border border-neutral-800 transition-colors flex items-center gap-1">
                                <PlusIcon className="w-3 h-3" /> New Project
                            </button>
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!value.trim() || isLoading}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                value.trim() ? "bg-white text-black active:scale-95" : "text-zinc-600 bg-neutral-800 opacity-50 pointer-events-none"
                            )}
                        >
                            <ArrowUpIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-center text-zinc-600 mt-2">
                    IceBourg Assistant can answer questions and collect project details.
                </p>
            </div>
        </div>
    );
}

