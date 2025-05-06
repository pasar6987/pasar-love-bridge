
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { ko, ja, enUS } from 'date-fns/locale';

// Interface for chat message
export interface ChatMessage {
  id: string;
  sender_id: string | null;
  content: string;
  translated_content?: string | null;
  is_icebreaker?: boolean;
  created_at: string;
  read_at?: string | null;
}

// Interface for chat session (conversation with a matched user)
export interface ChatSession {
  match_id: string;
  partner_id: string;
  partner_nickname: string;
  partner_photo: string | null;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

// Function to send a chat message
export const sendChatMessage = async (matchId: string, content: string): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('send_chat_message', {
      body: { match_id: matchId, content }
    });
    
    if (error) {
      throw error;
    }
    
    return data as ChatMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

// Function to get chat messages
export const getChatMessages = async (matchId: string, limit = 50): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_chat_messages', {
      body: { match_id: matchId, limit }
    });
    
    if (error) {
      throw error;
    }
    
    return (data as ChatMessage[]) || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

// Function to mark messages as read
export const markMessagesAsRead = async (matchId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('mark_messages_as_read', {
      body: { match_id: matchId }
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return false;
  }
};

// Function to generate a random topic
export const generateRandomTopic = async (matchId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate_random_topic', {
      body: { match_id: matchId }
    });
    
    if (error) {
      throw error;
    }
    
    return data as string;
  } catch (error) {
    console.error("Error generating random topic:", error);
    return null;
  }
};

// Function to get user's chat sessions
export const getUserChats = async (): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_user_chats');
    
    if (error) {
      console.error("Error invoking get_user_chats:", error);
      throw error;
    }
    
    return (data as ChatSession[]) || [];
  } catch (error) {
    console.error("Error fetching user chats:", error);
    // Return mock data for development
    return [
      {
        match_id: '1',
        partner_id: '101',
        partner_nickname: 'Yuna',
        partner_photo: '/placeholder.svg',
        last_message: '안녕하세요! 반가워요.',
        last_message_time: new Date().toISOString(),
        unread_count: 2
      },
      {
        match_id: '2',
        partner_id: '102',
        partner_nickname: 'Haruki',
        partner_photo: '/placeholder.svg',
        last_message: 'こんにちは！よろしくお願いします。',
        last_message_time: new Date(Date.now() - 86400000).toISOString(),
        unread_count: 0
      }
    ];
  }
};

// Function to format time ago for messages
export const formatTimeAgo = (dateString: string, language: string = 'en'): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Get locale
    const locale = language === 'ko' ? ko : language === 'ja' ? ja : enUS;
    
    // For today's dates, just show the time
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm', { locale });
    }
    
    // For yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return language === 'ko' ? '어제' : language === 'ja' ? '昨日' : 'Yesterday';
    }
    
    // For dates within the last 7 days
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return format(date, language === 'ko' ? 'E요일' : language === 'ja' ? 'E曜日' : 'EEEE', { locale });
    }
    
    // For older dates
    return format(date, language === 'ko' ? 'yy.MM.dd' : language === 'ja' ? 'yy.MM.dd' : 'MM/dd/yy', { locale });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
