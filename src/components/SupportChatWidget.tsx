import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { FiMessageCircle, FiSend, FiSmile, FiX } from "react-icons/fi";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { fetchChatMessages, sendChatMessage, setTyping } from "../chat/chatApi";
import { ChatMessage } from "../chat/types";
import "../styles/SupportChat.css";

type StoredUser = {
  id?: string;
  role?: string;
  name?: string;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatSeparator = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString();
};

const formatTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function SupportChatWidget() {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTypingVisible, setIsTypingVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }, [authVersion]);

  const isUserRole = String(currentUser?.role || "").toLowerCase() === "user";
  const canShowWidget = localStorage.getItem("isLoggedIn") === "true" && isUserRole;

  const messageItems = useMemo(() => {
    let previousDay = "";

    return messages.flatMap((message) => {
      const day = formatSeparator(message.createdAt);
      const items: Array<
        | { type: "day"; key: string; label: string }
        | { type: "message"; key: string; message: ChatMessage; mine: boolean }
      > = [];

      if (day !== previousDay) {
        items.push({
          type: "day",
          key: `day-${message._id}`,
          label: day,
        });
        previousDay = day;
      }

      items.push({
        type: "message",
        key: message._id,
        message,
        mine: message.senderRole === "user",
      });

      return items;
    });
  }, [messages]);

  useEffect(() => {
    const refreshAuthState = () => setAuthVersion((prev) => prev + 1);
    window.addEventListener("auth-changed", refreshAuthState);
    window.addEventListener("storage", refreshAuthState);
    return () => {
      window.removeEventListener("auth-changed", refreshAuthState);
      window.removeEventListener("storage", refreshAuthState);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const data = await fetchChatMessages();
      setMessages(data.messages);
      setIsTypingVisible(data.typing);
      setFeedback("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load chat";
      setFeedback(message);
    }
  };

  useEffect(() => {
    if (!show) return;
    setIsLoading(true);
    void loadMessages().finally(() => setIsLoading(false));

    const interval = window.setInterval(() => {
      void loadMessages();
    }, 2500);

    return () => window.clearInterval(interval);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTypingVisible, show]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleDraftChange = async (value: string) => {
    setDraft(value);
    try {
      await setTyping(Boolean(value.trim()));
    } catch {
      // Keep typing signal best-effort.
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      void setTyping(false);
    }, 1200);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    try {
      setIsSending(true);
      await sendChatMessage(text);
      setDraft("");
      setShowEmojiPicker(false);
      await setTyping(false);
      await loadMessages();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send message";
      setFeedback(message);
    } finally {
      setIsSending(false);
    }
  };

  if (!canShowWidget) {
    return null;
  }

  return (
    <>
      <div className="support-chat-wrapper">
        <button
          type="button"
          className="support-floating-btn"
          aria-label="Open support chat"
          onClick={() => setShow(true)}
        >
          <FiMessageCircle size={20} />
        </button>
      </div>

      <Modal show={show} onHide={() => setShow(false)} dialogClassName="support-chat-modal">
        <Modal.Header className="support-chat-header">
          <div className="support-chat-header-main">
            <div className="support-chat-title-group">
              <span className="support-chat-badge" aria-hidden="true">
                <FiMessageCircle size={18} />
              </span>
              <div>
                <Modal.Title>Support Chat</Modal.Title>
                <div className="support-chat-status">
                  <span className="support-chat-status-dot" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="support-close-btn"
              onClick={() => setShow(false)}
              aria-label="Close support chat"
            >
              <FiX size={18} />
            </button>
          </div>
        </Modal.Header>

        <Modal.Body className="support-chat-body">
          {isLoading ? (
            <div className="support-chat-loading">
              <p className="chat-feedback">Loading messages...</p>
            </div>
          ) : (
            <div className="chat-scroll-wrap">
              {messageItems.map((item) => {
                if (item.type === "day") {
                  return (
                    <div key={item.key} className="chat-day-separator">
                      {item.label}
                    </div>
                  );
                }

                return (
                  <div key={item.key} className={`chat-row ${item.mine ? "mine" : "other"} chat-fade-in`}>
                    <div className={`chat-message-stack ${item.mine ? "mine" : "other"}`}>
                      <div className={`chat-bubble ${item.mine ? "mine" : "other"}`}>
                        <p>{item.message.message}</p>
                      </div>
                      <div className={`chat-meta ${item.mine ? "mine" : "other"}`}>
                        <span>{formatTime(item.message.createdAt)}</span>
                        {item.mine && (
                          <span className={`seen-status ${item.message.seenStatus ? "is-seen" : ""}`}>
                            {item.message.seenStatus ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTypingVisible && (
                <div className="chat-row other chat-fade-in">
                  <div className="chat-typing-bubble" aria-label="Support is typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
          {feedback && <p className="chat-feedback support-chat-feedback">{feedback}</p>}
        </Modal.Body>

        <Modal.Footer className="support-chat-footer">
          <div className="chat-input-wrap chat-input-wrapper support-chat-input-wrapper">
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              aria-label="Toggle emoji picker"
            >
              <FiSmile size={18} />
            </button>
            <input
              value={draft}
              onChange={(event) => void handleDraftChange(event.target.value)}
              placeholder="Type your message..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <button type="button" className="send-btn" onClick={() => void handleSend()} disabled={!draft.trim() || isSending}>
              {isSending ? (
                <div className="loader-small" />
              ) : (
                <FiSend size={18} />
              )}
            </button>
          </div>

          {showEmojiPicker && (
            <div className="emoji-picker-wrap support-chat-emoji-picker">
              <Picker
                data={emojiData}
                onEmojiSelect={(emoji: { native?: string }) =>
                  setDraft((prev) => `${prev}${emoji.native || ""}`)
                }
                theme="auto"
              />
            </div>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SupportChatWidget;
