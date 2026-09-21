import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./Chat.css";

const API_URL = "http://127.0.0.1:8000";
const STORAGE_KEY = "agromitr_chat_sessions_v2";

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", kn: "Kannada", mr: "Marathi",
  ta: "Tamil", te: "Telugu", ml: "Malayalam", bn: "Bengali",
  gu: "Gujarati", pa: "Punjabi",
};

const STARTER_QUESTIONS = [
  "How can I protect my crops from disease?",
  "What should I do if leaves are turning yellow?",
  "How often should I check my crops for pests?",
  "How can I improve plant growth naturally?",
];

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const makeWelcome = () => ({
  id: `welcome-${Date.now()}-${Math.random()}`,
  role: "assistant",
  text:
    "Hello! I’m AgroMitr, your AI farming assistant. Ask me about crop diseases, pests, symptoms, treatment, prevention, soil care, weather, or day-to-day crop management.",
  time: formatTime(new Date()),
});

const makeSession = () => ({
  id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "New farming chat",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [makeWelcome()],
});



/* Render the AI's Markdown as proper UI instead of showing **, ### and |. */
const renderInline = (text) => {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(String(text))) !== null) {
    if (match.index > last) parts.push(
      <React.Fragment key={`t-${last}`}>{text.slice(last, match.index)}</React.Fragment>
    );

    const token = match[0];

    if (token.startsWith("**") || token.startsWith("__")) {
      parts.push(<strong key={`b-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={`c-${match.index}`}>{token.slice(1, -1)}</code>);
    } else {
      parts.push(<em key={`e-${match.index}`}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }

  if (last < String(text).length) {
    parts.push(<React.Fragment key={`tail-${last}`}>{String(text).slice(last)}</React.Fragment>);
  }

  return parts;
};

const isTableRow = (line) =>
  /^\s*\|.*\|\s*$/.test(line) && line.split("|").length >= 3;

const isTableSeparator = (line) =>
  /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line);

const splitTable = (line) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((x) => x.trim());

function MarkdownMessage({ text }) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = null;
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length) {
      blocks.push({ type: listType, items: [...list] });
      list = [];
      listType = null;
    }
  };

  const flushTable = () => {
    if (table.length >= 2) blocks.push({ type: "table", rows: [...table] });
    else if (table.length === 1) paragraph.push(table[0]);
    table = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (isTableRow(line)) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }

    if (table.length) flushTable();

    const heading = line.match(/^#{1,4}\s+(.+)/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: `h${Math.min(3, line.match(/^#+/)[0].length)}`,
        text: heading[1],
      });
      continue;
    }

    if (/^(---+|\*\*\*+)$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)/);
    if (bullet) {
      flushParagraph();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      list.push(bullet[1]);
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.+)/);
    if (numbered) {
      flushParagraph();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      list.push(numbered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushTable();

  return (
    <div className="markdown-content">
      {blocks.map((block, i) => {
        if (block.type === "p") return <p key={i}>{renderInline(block.text)}</p>;
        if (["h1", "h2", "h3"].includes(block.type)) {
          const H = block.type;
          return <H key={i}>{renderInline(block.text)}</H>;
        }
        if (block.type === "hr") return <hr key={i} />;
        if (block.type === "ul" || block.type === "ol") {
          const List = block.type;
          return (
            <List key={i}>
              {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
            </List>
          );
        }
        if (block.type === "table") {
          const header = splitTable(block.rows[0]);
          const hasSeparator = block.rows.length > 1 && isTableSeparator(block.rows[1]);
          const rows = hasSeparator ? block.rows.slice(2) : block.rows.slice(1);

          return (
            <div className="markdown-table-wrap" key={i}>
              <table>
                <thead>
                  <tr>{header.map((cell, j) => <th key={j}>{renderInline(cell)}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row, j) => {
                    const cells = splitTable(row);
                    return (
                      <tr key={j}>
                        {header.map((_, k) => <td key={k}>{renderInline(cells[k] || "")}</td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function Chat({ history = [], currentDiagnosis = null, language = "en", contextRequest = null, labels = {} }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const languageName = LANGUAGE_NAMES[language] || "English";
  const starterQuestions = [
    labels.starterDisease || STARTER_QUESTIONS[0],
    labels.starterYellow || STARTER_QUESTIONS[1],
    labels.starterPests || STARTER_QUESTIONS[2],
    labels.starterGrowth || STARTER_QUESTIONS[3],
  ];

  /* Load previous conversations from this browser. */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved) && saved.length) {
        setSessions(saved);
        setActiveSessionId(saved[0].id);
      } else {
        const first = makeSession();
        setSessions([first]);
        setActiveSessionId(first.id);
      }
    } catch {
      const first = makeSession();
      setSessions([first]);
      setActiveSessionId(first.id);
    }
  }, []);

  /*
   * Every Crop Health "Ask AgroMitr" click carries a unique request id.
   * A new chat is created for each request, even when the same result is clicked again.
   */
  useEffect(() => {
    if (!contextRequest?.id) return;

    const diagnosis = contextRequest.data || currentDiagnosis || {};
    const isPest = contextRequest.type === "pest";
    const crop = diagnosis.crop || "your crop";
    const subject = isPest
      ? (diagnosis.pest_name || "this pest")
      : (diagnosis.diagnosis || "this crop-health result");

    const session = {
      id: `chat-context-${contextRequest.id}`,
      title: `${crop} — ${subject}`.slice(0, 58),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        makeWelcome(),
        {
          id: `context-${contextRequest.id}`,
          role: "assistant",
          text: isPest
            ? `I’ve opened a new chat for your **${crop} pest detection** (${subject}). Ask me anything about the symptoms, risk, control options, prevention, or next steps.`
            : `I’ve opened a new chat for your **${crop} diagnosis** (${subject}). Ask me anything about the symptoms, treatment, prevention, or next steps.`,
          time: formatTime(new Date()),
          contextIntro: true,
        },
      ],
    };

    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setInput("");
    setError("");
  }, [contextRequest?.id]);

  /* Save conversations automatically after every message/new chat/delete. */
  useEffect(() => {
    if (sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const messages = activeSession?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const buildContext = () => {
    const diagnosis = contextRequest?.data || currentDiagnosis;

    return {
      language,
      language_name: languageName,
      current_diagnosis: diagnosis
      ? {
          crop: currentDiagnosis.crop,
          problem_type: currentDiagnosis.problem_type,
          diagnosis: currentDiagnosis.diagnosis,
          confidence: currentDiagnosis.confidence,
          severity: currentDiagnosis.severity,
          symptoms: currentDiagnosis.symptoms,
recommended_action: currentDiagnosis.recommended_action,
          pest_name: currentDiagnosis.pest_name,
          risk_level: currentDiagnosis.risk_level,
          pest_detected: currentDiagnosis.pest_detected,
          explanation: currentDiagnosis.explanation,
          needs_expert_review: currentDiagnosis.needs_expert_review,
          source: currentDiagnosis.source || "crop-health-analysis",
        }
      : null,
    recent_history: history.slice(0, 8).map((item) => ({
      crop: item.crop,
      problem_type: item.problem_type,
      diagnosis: item.diagnosis,
      confidence: item.confidence,
      severity: item.severity,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms.slice(0, 5) : [],
      recommended_action: Array.isArray(item.recommended_action)
        ? item.recommended_action.slice(0, 5)
        : [],
      created_at: item.created_at,
    })),
    };
  };

  const updateSession = (id, updater) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  };

  const sendMessage = async (question = input) => {
    const clean = question.trim();
    if (!clean || loading || !activeSession) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: clean,
      time: formatTime(new Date()),
    };

    const conversationForRequest = activeSession.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text }));

    setInput("");
    setError("");
    setLoading(true);

    updateSession(activeSession.id, (s) => ({
      ...s,
      title:
        s.title === "New farming chat"
          ? clean.slice(0, 48) + (clean.length > 48 ? "…" : "")
          : s.title,
      updatedAt: Date.now(),
      messages: [...s.messages, userMessage],
    }));

    try {
      const response = await axios.post(`${API_URL}/chat/`, {
        message: clean,
        language,
        context: buildContext(),
        conversation: conversationForRequest,
      });

      const reply =
        response.data?.reply ||
        "I’m sorry, I could not generate a response right now.";

      updateSession(activeSession.id, (s) => ({
        ...s,
        updatedAt: Date.now(),
        messages: [
          ...s.messages,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: reply,
            time: formatTime(new Date()),
          },
        ],
      }));
    } catch (err) {
      console.error("Chat error:", err);
      const detail =
        err.response?.data?.detail ||
        "Unable to connect to the AgroMitr AI assistant.";
      setError(detail);

      updateSession(activeSession.id, (s) => ({
        ...s,
        updatedAt: Date.now(),
        messages: [
          ...s.messages,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            error: true,
            text:
              "I couldn’t reach the AI service. Please check that the AgroMitr backend is running and try again.",
            time: formatTime(new Date()),
          },
        ],
      }));
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const createNewChat = () => {
    if (loading) return;
    const session = makeSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setInput("");
    setError("");
  };

  const deleteChat = (event, id) => {
    event.stopPropagation();
    if (loading) return;

    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);

      if (!remaining.length) {
        const fresh = makeSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }

      if (id === activeSessionId) setActiveSessionId(remaining[0].id);
      return remaining;
    });
  };

  const clearCurrentChat = () => {
    if (loading || !activeSession) return;
    updateSession(activeSession.id, (s) => ({
      ...s,
      title: "New farming chat",
      updatedAt: Date.now(),
      messages: [makeWelcome()],
    }));
    setInput("");
    setError("");
  };


  return (
    <section className="chat-page">
      <div className="chat-shell">
        <div className="chat-header">
          <div>
            <p className="chat-eyebrow">AGROMITR AI ASSISTANT</p>
            <h1>{labels.chatTitle || "Talk to your farming assistant."}</h1>
            <p className="chat-subtitle">
              {labels.chatSubtitle || "Get practical crop-health guidance using your diagnosis history and selected language."}
            </p>
          </div>
          <div className="chat-status">
            <span className="chat-status-dot" />
            AI Assistant Online
          </div>
        </div>

        <div className="chat-layout">
          <aside className="chat-sidebar">
            <div className="chat-sidebar-top">
              <div className="chat-sidebar-heading">
                <strong>{labels.chats || "Chats"}</strong>
                <span>{sessions.length}</span>
              </div>
              <button className="new-chat-button" onClick={createNewChat} disabled={loading}>
                + {labels.newChat || "New chat"}
              </button>
            </div>

            <div className="chat-history-list">
                {sessions.map((session) => (
                <button
                  key={session.id}
                  className={`saved-chat ${session.id === activeSessionId ? "active" : ""}`}
                  onClick={() => !loading && setActiveSessionId(session.id)}
                  disabled={loading}
                >
                  <span className="saved-chat-icon">💬</span>
                  <span className="saved-chat-copy">
                    <strong>{session.title}</strong>
                    <small>
                      {session.messages.filter((m) => m.role === "user").length} {session.messages.filter((m) => m.role === "user").length === 1 ? (labels.question || "question") : (labels.questions || "questions")}
                    </small>
                  </span>
                  <span
                    className="delete-chat"
                    onClick={(e) => deleteChat(e, session.id)}
                    role="button"
                    tabIndex={0}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>

            <div className="chat-sidebar-card">
              <div className="chat-sidebar-title"><span>💡</span>{labels.tryAsking || "Try asking"}</div>
              <div className="starter-list">
                {starterQuestions.map((q) => (
                  <button key={q} className="starter-question" onClick={() => sendMessage(q)} disabled={loading}>
                    <span>{q}</span><b>→</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-sidebar-card small">
              <div className="chat-sidebar-title"><span>🌐</span>{labels.languageLabel || "Language"}</div>
              <p>{labels.responsesIn || "Responses will be provided in"} <strong>{languageName}</strong>.</p>
            </div>

            <button className="clear-chat-button" onClick={clearCurrentChat} disabled={loading}>
              ↻ {labels.clearChat || "Clear current chat"}
            </button>
          </aside>

          <div className="chat-panel">
            <div className="chat-panel-top">
              <div className="assistant-identity">
                <div className="assistant-avatar">🌱</div>
                <div><strong>AgroMitr</strong><span>{labels.cropGuidance || "Crop & farm guidance"}</span></div>
              </div>
              {history.length > 0 && (
                <span className="context-badge">
                  {history.length} health check{history.length === 1 ? "" : "s"} available
                </span>
              )}
            </div>

            <div className="messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${message.role === "user" ? "user-row" : "assistant-row"}`}
                >
                  {message.role === "assistant" && <div className="message-avatar">🌱</div>}

                  <div className={`message-bubble ${message.role === "user" ? "user-bubble" : "assistant-bubble"} ${message.error ? "message-error" : ""}`}>
                    {message.role === "assistant" ? (
                      <MarkdownMessage text={message.text} />
                    ) : (
                      <p className="user-message-text">{message.text}</p>
                    )}
                    <span>{message.time}</span>
                  </div>

                  {message.role === "user" && <div className="message-avatar user-avatar">You</div>}
                </div>
              ))}

              {loading && (
                <div className="message-row assistant-row">
                  <div className="message-avatar">🌱</div>
                  <div className="message-bubble assistant-bubble typing-bubble">
                    <div className="typing"><span /><span /><span /></div>
                    <small>{labels.thinking || "AgroMitr is thinking..."}</small>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {error && <div className="chat-error"><span>!</span>{error}</div>}

            <div className="composer">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={labels.askAnything || "Ask AgroMitr anything about your crops..."}
                rows={1}
                disabled={loading}
              />
              <button className="send-button" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                {loading ? "…" : "↑"}
              </button>
            </div>

            <div className="composer-hint">
              <span>{labels.enterSend || "Enter to send"}</span>
              <span>{labels.shiftEnter || "Shift + Enter for a new line"}</span>
              <span>{labels.aiGuidance || "AI guidance • verify critical treatment decisions"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Chat;
