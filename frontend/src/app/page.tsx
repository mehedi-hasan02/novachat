"use client";

import { useRef, useState } from "react";
import { IoSendOutline } from "react-icons/io5";

interface ChatMsg {
  role: string;
  content: string;
  latencyMs?: number;
  token?: number;
}

export default function Home() {
  const [message, setMessage] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bootomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {};

  return (
    <main>
      <header className="flex justify-center text-4xl font-bold">
        <h1>NovaChat</h1>
      </header>

      <form
        onSubmit={sendMessage}
        className="border-t border-border bg-surface-alt px-4 py-4"
      >
        <div className="mx-auto flex max-w-2xl gap-2 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            autoFocus
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-4 pr-12 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent"
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
