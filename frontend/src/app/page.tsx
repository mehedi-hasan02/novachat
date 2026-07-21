"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { IoSendOutline } from "react-icons/io5";

interface ChatMsg {
  role: string;
  content: string;
  latencyMs?: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://novachat-xnfx.onrender.com";

console.log(`${API_URL}/chat`);

export default function Home() {
  const [messages, setMessage] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessage: ChatMsg[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessage(nextMessage);
    setInput("");
    setLoading(true);
    setError(null);

    const startAt = performance.now();

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessage.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.details || `Request Failed ${res.status}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startAt);

      setMessage((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.content,
          latencyMs,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Couldn't reach the backend. Make sure the FastAPI server is running on ${API_URL}`,
      );
    } finally {
      setLoading(false);
      inputRef?.current?.focus();
    }
  };

  return (
    <main className="flex h-screen flex-col bg-bg">
      <header className="flex justify-center text-4xl font-bold mt-2">
        <h1>
          Nova<span className="text-orange-300">Chat</span>
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.length === 0 && (
            <p className="text-center text-lg font-semibold text-text-secondary">
              Welcome Back
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-sm border border-blue-300 bg-accent text-bg"
                    : "rounded-2xl rounded-bl-sm border border-border bg-surface text-text-primary"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "ai" && msg.latencyMs !== undefined && (
                <span className="mt-1 font-mono text-[11px] text-text-secondary">
                  ⚡ {msg.latencyMs}ms
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-secondary" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-secondary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-secondary [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-orange-400 bg-surface-alt px-4 py-4"
      >
        <div className="mx-auto flex max-w-2xl gap-2 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            autoFocus
            className="w-full rounded-xl border border-blue-300 bg-surface py-2.5 pl-4 pr-12 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 disabled:opacity-40"
          >
            <IoSendOutline className="text-blue-300 text-xl cursor-pointer" />
          </button>
        </div>
      </form>
    </main>
  );
}
