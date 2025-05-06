
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ko, ja } from "date-fns/locale";

export interface ChatSession {
  match_id: string;
  partner_id: string;
  partner_nickname: string;
  partner_photo: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  translated_content: string | null;
  is_icebreaker: boolean;
  read_at: string | null;
  created_at: string;
}

// Get all chat sessions for the current user
export const getUserChats = async (): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase.rpc("get_user_chats");
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw error;
  }
};

// Get messages for a specific chat
export const getChatMessages = async (matchId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase.rpc("get_chat_messages", {
      p_match_id: matchId,
      p_limit: 100,
      p_offset: 0
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

// Send a message
export const sendChatMessage = async (matchId: string, content: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("send_chat_message", {
      p_match_id: matchId,
      p_content: content
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (matchId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc("mark_messages_as_read", {
      p_match_id: matchId
    });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Generate a random topic
export const generateRandomTopic = async (matchId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("generate_random_topic", {
      p_match_id: matchId
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating random topic:", error);
    throw error;
  }
};

// Translate a message
export const translateMessage = async (messageId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("translate_message", {
      p_message_id: messageId
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error translating message:", error);
    throw error;
  }
};

// Format a date in "time ago" format based on the user's language
export const formatTimeAgo = (date: string, language: string): string => {
  try {
    const locale = language === 'ko' ? ko : language === 'ja' ? ja : undefined;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  } catch (error) {
    return new Date(date).toLocaleTimeString();
  }
};
