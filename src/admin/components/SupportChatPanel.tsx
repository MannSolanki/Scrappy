import { useEffect, useMemo, useRef, useState } from "react";
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

const SCROLL_THRESHOLD_PX = 48;

const areMessagesEqual = (left: ChatMessage[], right: ChatMessage[]): boolean => {
  if (left.length !== right.length) return false;

  return left.every((message, index) => {
    const other = right[index];
    return (
      message?._id === other?._id &&
      message?.message === other?.message &&
      message?.createdAt === other?.createdAt &&
      message?.senderRole === other?.senderRole &&
      message?.seenStatus === other?.seenStatus
    );
  });
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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const selectedUserIdRef = useRef(selectedUserId);
  const isAtBottomRef = useRef(true);
  const pendingScrollRef = useRef(false);
  const pendingScrollBehaviorRef = useRef<ScrollBehavior>("auto");

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

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const queueScrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    pendingScrollRef.current = true;
    pendingScrollBehaviorRef.current = behavior;
  };

  const updateIsAtBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const nextIsAtBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + SCROLL_THRESHOLD_PX;

    isAtBottomRef.current = nextIsAtBottom;
    setIsAtBottom((previous) => (previous === nextIsAtBottom ? previous : nextIsAtBottom));
  };

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
      const previousMessages = messagesRef.current;
      const didMessagesChange = !areMessagesEqual(previousMessages, data.messages);
      const latestPreviousId = previousMessages[previousMessages.length - 1]?._id;
      const latestNextId = data.messages[data.messages.length - 1]?._id;
      const hasNewestMessageChanged = latestPreviousId !== latestNextId || previousMessages.length !== data.messages.length;

      if (didMessagesChange) {
        setMessages(data.messages);
        messagesRef.current = data.messages;
      }

      setTypingVisible((previous) => (previous === data.typing ? previous : data.typing));

      if (didMessagesChange && hasNewestMessageChanged && isAtBottomRef.current && selectedUserIdRef.current === userId) {
        queueScrollToBottom("smooth");
      }

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

    selectedUserIdRef.current = selectedUserId;
    isAtBottomRef.current = true;
    setIsAtBottom(true);
    setMessages([]);
    messagesRef.current = [];
    setTypingVisible(false);
    queueScrollToBottom("auto");
    void loadMessages(selectedUserId);
    const interval = window.setInterval(() => {
      void loadMessages(selectedUserId);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    if (!pendingScrollRef.current) return;

    if (isAtBottom || pendingScrollBehaviorRef.current === "auto") {
      scrollToBottom(pendingScrollBehaviorRef.current);
    }

    pendingScrollRef.current = false;
  }, [filteredMessages, isAtBottom, selectedUserId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

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
      isAtBottomRef.current = true;
      setIsAtBottom(true);
      queueScrollToBottom("smooth");
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
    <section className="flex h-[85vh] min-h-[600px] w-full max-h-[900px] overflow-hidden bg-[#0b141a] text-slate-200 border border-slate-800 shadow-sm rounded-lg">
      {/* Sidebar */}
      <div className="w-[300px] flex flex-col border-r border-slate-800 bg-[#111b21] z-10 shrink-0">
        <div className="px-3 py-2 border-b border-slate-800 bg-[#202c33] shrink-0">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-base font-semibold text-slate-200">Support Chat</h2>
            <p className="text-slate-400 text-xs">{filteredConversations.length} active</p>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search or start new chat"
              className="w-full bg-[#2a3942] rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none transition-colors border border-transparent focus:border-slate-600 h-[36px]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-500 h-full">
              <p className="text-sm">No chats found.</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = conversation.userId === selectedUserId;
              const isOnline = isRecentlyActive(conversation.lastMessageAt);
              return (
                <button
                  key={conversation.userId}
                  type="button"
                  className={`w-full text-left px-3 py-2 flex gap-3 items-center border-b border-slate-800/50 transition-colors duration-200 ${
                    isActive ? "bg-emerald-500 text-white" : "bg-transparent text-gray-200 hover:bg-slate-700"
                  }`}
                  onClick={() => {
                    setSelectedUserId(conversation.userId);
                    setMessageSearch("");
                  }}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                      isActive ? "bg-[#047857] text-emerald-50" : "bg-slate-600 text-white"
                    }`}>
                      {getInitials(conversation.user.name, conversation.user.email)}
                    </div>
                    {isOnline && (
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 rounded-full ${
                        isActive ? "bg-white border-emerald-500" : "bg-emerald-500 border-[#111b21]"
                      }`}></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <strong className={`text-sm font-medium truncate pr-2 ${isActive ? "text-white" : "text-gray-200"}`}>
                        {conversation.user.name || conversation.user.email}
                      </strong>
                      <span className={`text-[10px] whitespace-nowrap ${isActive ? "text-emerald-50" : "text-slate-400"}`}>
                        {formatConversationTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs truncate w-full ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                        {conversation.lastMessage || "No messages"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                          isActive ? "bg-white text-emerald-600" : "bg-emerald-500 text-white"
                        }`}>
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b141a] relative">
        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-[#202c33] sticky top-0 z-10 shrink-0 h-[60px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium text-sm shrink-0">
              {selectedUserInitials}
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-medium text-slate-200 text-sm leading-tight">{selectedUserLabel}</h3>
              {selectedConversation ? (
                <div className="text-[11px] mt-0.5 text-slate-400">
                  {selectedUserStatus === "Typing..." ? (
                    <span className="text-emerald-500 font-medium">{selectedUserStatus}</span>
                  ) : (
                    <>
                      <span className={selectedUserStatus === "Online" ? "text-slate-300" : ""}>{selectedUserStatus}</span>
                      <span className="mx-1.5">•</span>
                      <span>{selectedConversation.user.email}</span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">Select a chat</p>
              )}
            </div>
          </div>

          <div className="relative hidden md:block w-48 lg:w-64">
            <FiSearch className="absolute left-3 top-2 text-slate-400" size={14} />
            <input
              value={messageSearch}
              onChange={(event) => setMessageSearch(event.target.value)}
              placeholder="Search in chat..."
              className="w-full bg-[#2a3942] rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none transition-colors border border-transparent focus:border-slate-600 h-[36px]"
            />
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#374045] [&::-webkit-scrollbar-track]:bg-transparent"
          onScroll={updateIsAtBottom}
        >
          {!selectedUserId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <FiMessageSquare size={36} className="opacity-20 mb-3" />
              <p className="text-sm">Select a chat to start messaging</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 min-h-full justify-end pb-2">
              {messageItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <p className="text-[13px] bg-[#182229] px-3 py-1.5 rounded-lg text-slate-400">No messages here yet...</p>
                </div>
              ) : (
                messageItems.map((item, i) => {
                  if (item.type === "day") {
                    return (
                      <div key={item.key} className="flex justify-center my-3">
                        <span className="bg-[#182229] text-gray-400 text-[11px] px-3 py-1 rounded-md uppercase tracking-wider font-medium">
                          {item.label}
                        </span>
                      </div>
                    );
                  }

                  const isNextSameSender =
                    i < messageItems.length - 1 &&
                    messageItems[i + 1].type === "message" &&
                    (messageItems[i + 1] as any).mine === item.mine;
                    
                  // If we map exactly what the user wrote:
                  // User message: bg-emerald-500 text-white self-end
                  // Admin message: bg-slate-700 text-gray-200 self-start
                  // Then we must flip standard UX so "mine" is left and "!mine" is right.
                  const isRightSide = !item.mine; 

                  return (
                    <div
                      key={item.key}
                      className={`flex ${isRightSide ? "justify-end" : "justify-start"} group/msg relative`}
                    >
                      <div className={`flex flex-col max-w-[65%] sm:max-w-[55%] ${isRightSide ? "items-end" : "items-start"}`}>
                        <div className={`relative px-3 py-1.5 text-[14px] leading-[1.4] shadow-sm ${
                          isRightSide
                            ? `bg-emerald-500 text-white ${isNextSameSender ? "rounded-lg" : "rounded-lg rounded-tr-none"}`
                            : `bg-slate-700 text-gray-200 ${isNextSameSender ? "rounded-lg" : "rounded-lg rounded-tl-none"}`
                        }`}>
                          <p className={`whitespace-pre-wrap inline-block ${isRightSide ? 'mr-[44px]' : 'mr-[36px]'} break-words word-break-all`}>
                            {item.message.message}
                          </p>
                          
                          {/* Absolute Timestamp sticking to the bottom right of the bubble */}
                          <div className={`absolute bottom-1 right-1.5 flex items-center gap-1 ${isRightSide ? "text-emerald-100" : "text-gray-400"}`}>
                            <span className="text-[10px] leading-none pt-0.5">{formatTime(item.message.createdAt)}</span>
                            {isRightSide && (
                              <span className="text-[10px] font-bold tracking-tighter leading-none">
                                {item.message.seenStatus ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover/msg:opacity-100 transition-opacity bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 ${
                              isRightSide ? "-left-10" : "-right-10"
                            }`}
                            onClick={() => void handleDeleteMessage(item.message._id)}
                            aria-label="Delete message"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingVisible && (
                <div className="flex justify-start mt-1">
                  <div className="flex flex-col items-start max-w-[60%]">
                    <div className="px-3 py-2.5 bg-slate-700 text-gray-200 rounded-lg rounded-tl-none inline-flex gap-1.5 items-center justify-center h-[34px]">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>

        {feedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#ef4444] text-white text-xs px-3 py-1.5 rounded-md shadow-md z-20">
            {feedback}
          </div>
        )}

        {/* Compose Input Box */}
        <div className="px-4 py-2.5 bg-[#202c33] border-t border-slate-800 z-10 flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={!selectedUserId}
            aria-label="Toggle emoji picker"
          >
            <FiSmile size={22} className="stroke-2" />
          </button>

          <div className="flex-1 bg-[#2a3942] rounded-lg overflow-hidden flex items-center h-10 border border-transparent focus-within:border-slate-500 transition-colors">
            <input
              value={draft}
              disabled={!selectedUserId}
              onChange={(event) => void handleDraftChange(event.target.value)}
              placeholder="Type a message"
              className="w-full h-full bg-transparent text-sm text-slate-200 placeholder-slate-400 focus:outline-none px-3"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
          </div>

          {draft.trim() && selectedUserId ? (
            <button
              type="button"
              className="w-10 h-10 bg-[#00a884] text-white rounded-full flex items-center justify-center hover:bg-[#00c298] transition-colors shadow-sm disabled:opacity-50 group shrink-0"
              onClick={() => void handleSend()}
              aria-label="Send message"
            >
              <FiSend size={18} className="translate-x-[1px] group-hover:scale-105 transition-transform" />
            </button>
          ) : (
            <div className="w-10 h-10 shrink-0"></div>
          )}

          {showEmojiPicker && selectedUserId && (
            <div className="absolute bottom-[60px] left-4 shadow-xl border border-slate-700/50 rounded-lg overflow-hidden z-50">
              <Picker
                data={emojiData}
                onEmojiSelect={(emoji: { native?: string }) => setDraft((prev) => `${prev}${emoji.native || ""}`)}
                theme="dark"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SupportChatPanel;
