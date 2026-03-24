import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiMessageSquare, FiSearch, FiSend, FiSmile, FiTrash2 } from "react-icons/fi";
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
import "../../styles/SupportChat.css";

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

const formatConversationTime = (isoDate?: string): string => {
  if (!isoDate) return "";

  const date = new Date(isoDate);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return formatTime(isoDate);
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  const diffMs = Math.abs(now.getTime() - date.getTime());
  if (diffMs < 6 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

const getInitials = (name?: string, email?: string): string => {
  const source = (name || email || "").trim();
  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

const isRecentlyActive = (isoDate?: string): boolean => {
  if (!isoDate) return false;
  const timestamp = new Date(isoDate).getTime();
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp <= 5 * 60 * 1000;
};

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

  const messageItems = useMemo(() => {
    let previousDay = "";

    return filteredMessages.flatMap((message) => {
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
        mine: message.senderRole === "admin",
      });

      return items;
    });
  }, [filteredMessages]);

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

  const selectedUserLabel =
    selectedConversation?.user.name || selectedConversation?.user.email || "Select a conversation";
  const selectedUserStatus = !selectedConversation
    ? ""
    : typingVisible
      ? "Typing..."
      : isRecentlyActive(selectedConversation.lastMessageAt)
        ? "Online"
        : "Offline";
  const selectedUserInitials = getInitials(selectedConversation?.user.name, selectedConversation?.user.email);

  return (
    <section className="admin-chat-panel admin-table-card">
      <div className="admin-chat-list">
        <div className="admin-chat-list-header">
          <div>
            <h2>Support Inbox</h2>
            <p>{filteredConversations.length} active conversations</p>
          </div>
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
            <div className="admin-chat-empty-state">
              <span className="admin-chat-empty-icon" aria-hidden="true">
                <FiMessageSquare size={18} />
              </span>
              <p className="chat-feedback">No chat conversations yet.</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.userId}
                type="button"
                className={`admin-chat-user ${conversation.userId === selectedUserId ? "active" : ""}`}
                onClick={() => {
                  setSelectedUserId(conversation.userId);
                  setMessageSearch("");
                }}
              >
                <span className="admin-chat-avatar" aria-hidden="true">
                  {getInitials(conversation.user.name, conversation.user.email)}
                </span>
                <div className="admin-chat-user-copy">
                  <div className="admin-chat-user-topline">
                    <strong>{conversation.user.name || conversation.user.email}</strong>
                    <span className="admin-chat-user-time">{formatConversationTime(conversation.lastMessageAt)}</span>
                  </div>
                  <p>{conversation.lastMessage || "No messages yet"}</p>
                </div>
                {conversation.unreadCount > 0 && <span className="chat-unread-badge">{conversation.unreadCount}</span>}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="admin-chat-window">
        <div className="admin-chat-window-header">
          <div className="admin-chat-window-identity">
            <span className="admin-chat-avatar large" aria-hidden="true">
              {selectedUserInitials}
            </span>
            <div>
              <h3>{selectedUserLabel}</h3>
              {selectedConversation ? (
                <div className="admin-chat-status-line">
                  <span className={`admin-chat-status-dot ${selectedUserStatus === "Offline" ? "offline" : "online"}`} />
                  <span>{selectedUserStatus}</span>
                  <span className="admin-chat-status-separator">|</span>
                  <span>{selectedConversation.user.email}</span>
                </div>
              ) : (
                <p>Select a user to view the conversation.</p>
              )}
            </div>
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
            <div className="admin-chat-empty-state window">
              <span className="admin-chat-empty-icon" aria-hidden="true">
                <FiMessageSquare size={20} />
              </span>
              <p className="chat-feedback">Select a user to start chatting.</p>
            </div>
          ) : (
            <>
              {messageItems.length === 0 ? (
                <div className="admin-chat-empty-state window">
                  <span className="admin-chat-empty-icon" aria-hidden="true">
                    <FiMessageSquare size={20} />
                  </span>
                  <p className="chat-feedback">No messages yet. Start the conversation below.</p>
                </div>
              ) : (
                messageItems.map((item) => {
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
                          <button
                            type="button"
                            className="chat-delete-btn"
                            onClick={() => void handleDeleteMessage(item.message._id)}
                            aria-label="Delete message"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                        <div className={`chat-meta ${item.mine ? "mine" : "other"}`}>
                          <span>{formatTime(item.message.createdAt)}</span>
                          {item.mine && <span>{item.message.seenStatus ? "Seen" : "Delivered"}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingVisible && (
                <div className="chat-row other chat-fade-in">
                  <div className="chat-typing-bubble" aria-label="User is typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {feedback && <p className="chat-feedback admin-chat-feedback">{feedback}</p>}

        <div className="admin-chat-compose">
          <div className="chat-input-wrap chat-input-wrapper admin-chat-input-wrapper">
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={!selectedUserId}
              aria-label="Toggle emoji picker"
            >
              <FiSmile size={18} />
            </button>

            <input
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

            <button
              type="button"
              className="send-btn"
              onClick={() => void handleSend()}
              disabled={!selectedUserId || !draft.trim()}
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
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
