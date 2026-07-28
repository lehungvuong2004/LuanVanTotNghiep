import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  sendMessage,
  getChatHistory,
  getConversations,
  markChatAsRead,
  deleteMessage,
  type Message,
  type Conversation
} from "../../api/messages";

export const useChat = () => {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<any>(null);

  const filteredConversations = conversations.filter((c) =>
    c.partner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeConversation = conversations.find((c) => c.partner.id === Number(partnerId));
  const activePartner = activeConversation?.partner || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async (showLoading = false) => {
    if (showLoading) setLoadingConversations(true);
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch {
      console.error("Failed to load conversations:", err);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  };

  const fetchChatHistory = async (partnerNumId: number, showLoading = false) => {
    if (showLoading) setLoadingHistory(true);
    try {
      const res = await getChatHistory(partnerNumId);
      setMessages(res.data);
      await markChatAsRead(partnerNumId);
    } catch {
      console.error("Failed to load chat history:", err);
    } finally {
      if (showLoading) setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchConversations(true);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(() => {
      fetchConversations(false);
      if (partnerId) {
        fetchChatHistory(Number(partnerId), false);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [partnerId]);

  useEffect(() => {
    if (partnerId) {
      fetchChatHistory(Number(partnerId), true);
    } else {
      setMessages([]);
    }
  }, [partnerId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!partnerId || !inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    const tempMsg: Message = {
      id: Date.now(),
      sender_id: currentUser?.id || 0,
      receiver_id: Number(partnerId),
      message: textToSend,
      message_type: "text",
      attachment: null,
      is_read: 0,
      sender_deleted: 0,
      receiver_deleted: 0,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendMessage({
        receiver_id: Number(partnerId),
        message: textToSend,
      });
      fetchChatHistory(Number(partnerId), false);
      fetchConversations(false);
    } catch {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!window.confirm(t("Bạn có chắc chắn muốn xóa tin nhắn này phía bạn không?"))) return;

    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
      fetchConversations(false);
    } catch {
      console.error("Failed to delete message:", err);
    }
  };

  return {
    partnerId,
    navigate,
    t,
    currentUser,
    conversations,
    messages,
    searchQuery,
    setSearchQuery,
    inputText,
    setInputText,
    sending,
    loadingHistory,
    loadingConversations,
    messagesEndRef,
    filteredConversations,
    activePartner,
    fetchChatHistory,
    handleSend,
    handleDeleteMessage,
  };
};
