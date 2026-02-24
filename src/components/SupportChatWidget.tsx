import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
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
      await sendChatMessage(text);
      setDraft("");
      setShowEmojiPicker(false);
      await setTyping(false);
      await loadMessages();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send message";
      setFeedback(message);
    }
  };

  if (!canShowWidget) {
    return null;
  }

  let previousDay = "";

  return (
    <>
      <Button
        type="button"
        className="support-floating-btn"
        aria-label="Open support chat"
        onClick={() => setShow(true)}
      >
        <FiMessageCircle size={20} />
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered dialogClassName="support-chat-modal">
        <Modal.Header className="support-chat-header">
          <Modal.Title>Support Chat</Modal.Title>
          <button
            type="button"
            className="support-close-btn"
            onClick={() => setShow(false)}
            aria-label="Close support chat"
          >
            <FiX size={18} />
          </button>
        </Modal.Header>

        <Modal.Body className="support-chat-body">
          {isLoading ? (
            <p className="chat-feedback">Loading messages...</p>
          ) : (
            <div className="chat-scroll-wrap">
              {messages.map((message) => {
                const day = formatSeparator(message.createdAt);
                const showDay = day !== previousDay;
                previousDay = day;
                const mine = message.senderRole === "user";

                return (
                  <React.Fragment key={message._id}>
                    {showDay && <div className="chat-day-separator">{day}</div>}
                    <div className={`chat-row ${mine ? "mine" : "other"} chat-fade-in`}>
                      <div className={`chat-bubble ${mine ? "mine" : "other"}`}>
                        <p>{message.message}</p>
                        <div className="chat-meta">
                          <span>{formatTime(message.createdAt)}</span>
                          {mine && <span>{message.seenStatus ? "Seen" : "Delivered"}</span>}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {isTypingVisible && <p className="chat-typing">Admin is typing...</p>}
              <div ref={bottomRef} />
            </div>
          )}
          {feedback && <p className="chat-feedback">{feedback}</p>}
        </Modal.Body>

        <Modal.Footer className="support-chat-footer">
          <div className="chat-input-wrap">
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              aria-label="Toggle emoji picker"
            >
              <FiSmile size={18} />
            </button>
            <Form.Control
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
            <Button type="button" className="send-btn" onClick={() => void handleSend()} disabled={!draft.trim()}>
              <FiSend size={16} />
            </Button>
          </div>

          {showEmojiPicker && (
            <div className="emoji-picker-wrap">
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
