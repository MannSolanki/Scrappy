import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FiSearch, FiSend, FiSmile, FiTrash2 } from "react-icons/fi";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import {
  deleteChatMessage,
  fetchAdminConversations,
  fetchChatMessages,
  sendChatMessage,
  setTyping,
} from "../../chat/chatApi";
import { ChatConversation, ChatMessage } from "../../chat/types";

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

function SupportChatPanel() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [typingVisible, setTypingVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.userId === selectedUserId) || null,
    [conversations, selectedUserId]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((item) => {
      const identity = `${item.user.name} ${item.user.email}`.toLowerCase();
      return identity.includes(query);
    });
  }, [conversations, searchQuery]);

  const filteredMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) => message.message.toLowerCase().includes(query));
  }, [messages, messageSearch]);

  const loadConversations = async () => {
    try {
      const data = await fetchAdminConversations();
      setConversations(data);
      if (!selectedUserId && data.length > 0) {
        setSelectedUserId(data[0].userId);
      }
      setFeedback("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load conversations";
      setFeedback(message);
    }
  };

  const loadMessages = async (userId: string) => {
    if (!userId) return;
    try {
      const data = await fetchChatMessages(userId);
      setMessages(data.messages);
      setTypingVisible(data.typing);
      setFeedback("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load chat";
      setFeedback(message);
    }
  };

  useEffect(() => {
    void loadConversations();
    const interval = window.setInterval(() => {
      void loadConversations();
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    void loadMessages(selectedUserId);
    const interval = window.setInterval(() => {
      void loadMessages(selectedUserId);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingVisible]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleDraftChange = async (value: string) => {
    setDraft(value);
    if (!selectedUserId) return;

    try {
      await setTyping(Boolean(value.trim()), selectedUserId);
    } catch {
      // Typing indicator is best-effort.
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      void setTyping(false, selectedUserId);
    }, 1200);
  };

  const handleSend = async () => {
    if (!selectedUserId) return;
    const text = draft.trim();
    if (!text) return;

    try {
      await sendChatMessage(text, selectedUserId);
      setDraft("");
      setShowEmojiPicker(false);
      await setTyping(false, selectedUserId);
      await Promise.all([loadMessages(selectedUserId), loadConversations()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send message";
      setFeedback(message);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      if (selectedUserId) {
        await Promise.all([loadMessages(selectedUserId), loadConversations()]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete message";
      setFeedback(message);
    }
  };

  let previousDay = "";

  return (
    <section className="admin-chat-panel admin-table-card">
      <div className="admin-chat-list">
        <div className="admin-chat-list-header">
          <h2>Support Chats</h2>
          <div className="admin-chat-search">
            <FiSearch size={14} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search users..."
            />
          </div>
        </div>

        <div className="admin-chat-users">
          {filteredConversations.length === 0 ? (
            <p className="chat-feedback">No chat conversations yet.</p>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.userId}
                type="button"
                className={`admin-chat-user ${conversation.userId === selectedUserId ? "active" : ""}`}
                onClick={() => setSelectedUserId(conversation.userId)}
              >
                <div>
                  <strong>{conversation.user.name || conversation.user.email}</strong>
                  <p>{conversation.lastMessage || "No messages yet"}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="chat-unread-badge">{conversation.unreadCount}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="admin-chat-window">
        <div className="admin-chat-window-header">
          <div>
            <h3>{selectedConversation ? selectedConversation.user.name : "Select a conversation"}</h3>
            <p>{selectedConversation?.user.email || ""}</p>
          </div>
          <div className="admin-chat-search chat-message-search">
            <FiSearch size={14} />
            <input
              value={messageSearch}
              onChange={(event) => setMessageSearch(event.target.value)}
              placeholder="Search messages..."
            />
          </div>
        </div>

        <div className="admin-chat-messages">
          {!selectedUserId ? (
            <p className="chat-feedback">Select a user to start chatting.</p>
          ) : (
            <>
              {filteredMessages.map((message) => {
                const day = formatSeparator(message.createdAt);
                const showDay = day !== previousDay;
                previousDay = day;
                const mine = message.senderRole === "admin";

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
                        <button
                          type="button"
                          className="chat-delete-btn"
                          onClick={() => void handleDeleteMessage(message._id)}
                          aria-label="Delete message"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {typingVisible && <p className="chat-typing">User is typing...</p>}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {feedback && <p className="chat-feedback">{feedback}</p>}

        <div className="admin-chat-compose">
          <div className="chat-input-wrap">
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={!selectedUserId}
              aria-label="Toggle emoji picker"
            >
              <FiSmile size={18} />
            </button>
            <Form.Control
              value={draft}
              disabled={!selectedUserId}
              onChange={(event) => void handleDraftChange(event.target.value)}
              placeholder="Reply to user..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button
              type="button"
              className="send-btn"
              onClick={() => void handleSend()}
              disabled={!selectedUserId || !draft.trim()}
            >
              <FiSend size={16} />
            </Button>
          </div>

          {showEmojiPicker && selectedUserId && (
            <div className="emoji-picker-wrap admin-emoji">
              <Picker
                data={emojiData}
                onEmojiSelect={(emoji: { native?: string }) => setDraft((prev) => `${prev}${emoji.native || ""}`)}
                theme="auto"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SupportChatPanel;
