import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./Chatbot.css";

const SYSTEM_INSTRUCTION = `You are a helpful support assistant for HomeTutors, a platform that connects recruiters with qualified home tutors.

## Your role:
- Help visitors understand how the platform works
- Guide tutors on how to register, complete their profile, and set weekly availability
- Guide recruiters on how to sign up and get approved to view tutor contact details
- Answer questions about the approval process, tutor verification, and platform features

## Onboarding flows:

### Tutor:
1. Sign up at /signup → select role "Tutor"
2. Profile is auto-created (fill in skills, bio, diploma via dashboard)
3. Account is immediately active — no admin approval needed
4. Update weekly availability from the dashboard. If marked unavailable, you still appear in listings but recruiters will see you're not available for hiring that week.

### Recruiter:
1. Sign up at /signup → select role "Recruiter" and enter company name. If hiring as an individual/parent (not a company), enter "none but home" as the company name.
2. Account starts as pending (adminApproved = false)
3. Wait for admin to approve via the Approvals page
4. Once approved → tutor contact details and documents become visible
5. Before approval → contact info shows as "Hidden until approved"

## Key rules:
- NEVER reveal or guess any tutor's contact details (phone/email). These are protected and only visible to admin-approved recruiters.
- Do NOT make up tutor availability or profile data. If asked about a specific tutor, direct the user to browse the tutors page.
- If a recruiter asks why they can't see contact info, explain they need admin approval first and should wait for admin review.
- You cannot approve users, send messages, or take any action — you can only guide users.
- Respond in the same language the user writes in.

## Off-topic handling:
- You are built specifically for HomeTutors support. You can only help with: tutor browsing & profiles, recruiter signup & approval, account/login help, contact access requests, and admin-related queries.
- Each user gets 5 tolerance questions for off-topic content. After 5 off-topic questions, politely refuse any further off-topic questions and suggest contacting admin.
- For the first 5 off-topic questions respond with: "I'm made for HomeTutors support, so I can only help with tutor listings, recruiter access, or account questions."
- After 5 off-topic questions respond with: "You've reached the limit for off-topic questions. Please contact our admin for further help."

## When you don't know the answer:
- Admit you don't have that information
- Suggest contacting the admin through:
  - Phone: 0799399575
  - Email: mugisharutijanaalbert@gmail.com

## Platform facts:
- Roles: Tutor, Recruiter, Admin
- Recruiters must be approved by admin before accessing tutor contact details
- Tutors can update their weekly availability status. Setting as unavailable does NOT hide them from listings — they remain visible but appear as "not available this week", so recruiters know not to contact them for immediate hiring.
- Admin monitors all users, messages, payments, and approvals
- There is one primary admin who manages the platform

## Tone:
- Be concise, friendly, and professional`;

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "👋 Hi! I'm the HomeTutors Assistant. How can I help you today?" }
  ]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const conversationHistory = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, thinking, open]);

  async function handleSend() {
    const message = input.trim();
    if (!message || thinking) return;

    conversationHistory.current.push({ role: "user", parts: [{ text: message }] });
    setMessages(prev => [...prev, { sender: "user", text: message }]);
    setInput("");
    setThinking(true);

    try {
     const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`,
      {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: conversationHistory.current,
          }),
        }
      );

      const data = await response.json();
      setThinking(false);

      if (data.error) {
        setMessages(prev => [...prev, { sender: "ai", text: data.error.message }]);
        return;
      }

      const aiReply = data.candidates[0].content.parts[0].text;
      conversationHistory.current.push({ role: "model", parts: [{ text: aiReply }] });
      setMessages(prev => [...prev, { sender: "ai", text: aiReply }]);
    } catch {
      setThinking(false);
      setMessages(prev => [...prev, { sender: "ai", text: "Connection failed." }]);
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
            <div className="bot-icon">🎓</div>
            <div className="header-text">
              <h1>HomeTutors Assistant</h1>
              <p>Ask me anything about the platform</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
            >
              ✕
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
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSend} disabled={thinking}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(135deg, #1e88e5, #43a047)",
          border: "none", cursor: "pointer", fontSize: "24px",
          boxShadow: "0 4px 16px rgba(30,136,229,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
        aria-label="Toggle chat"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
