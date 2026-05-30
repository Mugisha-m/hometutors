import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import api from "../lib/api";
import { getUserRole } from "../lib/auth";
import "./Chatbot.css";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hi! I'm the HomeTutors Assistant. How can I help you today?" }
  ]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, thinking, open]);

  async function handleSend() {
    const message = input.trim();
    if (!message || thinking) return;

    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setInput("");
    setThinking(true);

    try {
      const response = await api.post("/api/chat", { message, role: getUserRole() });
      setMessages((prev) => [...prev, { sender: "ai", text: response.data.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: "Connection failed." }]);
    } finally {
      setThinking(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) handleSend();
  }

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
      {open && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="bot-icon">AI</div>
            <div className="header-text">
              <h1>HomeTutors Assistant</h1>
              <p>Ask me anything about the platform</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
              aria-label="Close chat"
            >
              x
            </button>
          </div>

          <div className="chat-box" ref={chatBoxRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                <div className={`avatar ${msg.sender}`}>
                  {msg.sender === "ai" ? "AI" : "Y"}
                </div>
                {msg.sender === "ai" ? (
                  <div
                    className="bubble ai"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.text) as string) }}
                  />
                ) : (
                  <div className="bubble user">{msg.text}</div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="message-row ai">
                <div className="avatar ai">AI</div>
                <div className="bubble ai thinking">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <div className="input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask for a guide..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSend} disabled={thinking} aria-label="Send message">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(135deg, #1e88e5, #43a047)",
          border: "none", cursor: "pointer", fontSize: "18px",
          boxShadow: "0 4px 16px rgba(30,136,229,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700
        }}
        aria-label="Toggle chat"
      >
        {open ? "x" : "AI"}
      </button>
    </div>
  );
}
