export type ChatSenderRole = "user" | "admin";

export type ChatMessage = {
  _id: string;
  userId: string;
  senderRole: ChatSenderRole;
  message: string;
  seenStatus: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChatConversation = {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};
