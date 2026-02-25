import { ChatConversation, ChatMessage } from "./types";

const API_BASE_URL = "http://localhost:5000";

const getStoredToken = (): string => {
  const direct = localStorage.getItem("token");
  if (direct) {
    return direct;
  }

  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return "";
    const parsed = JSON.parse(rawUser) as { token?: string };
    return parsed.token || "";
  } catch {
    return "";
  }
};

const buildHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getStoredToken()}`,
});

const toMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || "Request failed";
  } catch {
    return "Request failed";
  }
};

export const fetchChatMessages = async (userId?: string): Promise<{ messages: ChatMessage[]; typing: boolean }> => {
  const url = userId
    ? `${API_BASE_URL}/api/chat/messages?userId=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/api/chat/messages`;

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await toMessage(response));
  }

  const data = (await response.json()) as { messages?: ChatMessage[]; typing?: boolean };
  return {
    messages: data.messages || [],
    typing: Boolean(data.typing),
  };
};

export const sendChatMessage = async (message: string, userId?: string): Promise<ChatMessage> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ message, userId }),
  });

  if (!response.ok) {
    throw new Error(await toMessage(response));
  }

  const data = (await response.json()) as { chatMessage?: ChatMessage };
  if (!data.chatMessage) {
    throw new Error("Missing chat message payload");
  }

  return data.chatMessage;
};

export const setTyping = async (isTyping: boolean, userId?: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/typing`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ isTyping, userId }),
  });

  if (!response.ok) {
    throw new Error(await toMessage(response));
  }
};

export const fetchAdminConversations = async (): Promise<ChatConversation[]> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/admin/conversations`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await toMessage(response));
  }

  const data = (await response.json()) as { conversations?: ChatConversation[] };
  return data.conversations || [];
};

export const deleteChatMessage = async (messageId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await toMessage(response));
  }
};
