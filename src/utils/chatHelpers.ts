
import { supabase } from "@/integrations/supabase/client";

// Define chat message interface
export interface ChatMessage {
  id: string;
  sender_id: string | null;
  content: string;
  translated_content: string | null;
  is_icebreaker: boolean;
  read_at: string | null;
  created_at: string;
}

// Define chat session interface
export interface ChatSession {
  match_id: string;
  partner_id: string;
  partner_nickname: string;
  partner_photo: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

// Function to get user's chat sessions
export const getUserChats = async (): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_user_chats');
    
    if (error) {
      throw error;
    }
    
    return data as ChatSession[] || [];
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return [];
  }
};

// Function to get chat messages for a specific match
export const getChatMessages = async (matchId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_chat_messages', {
      body: { match_id: matchId }
    });
    
    if (error) {
      throw error;
    }
    
    return data as ChatMessage[] || [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};

// Function to send a chat message
export const sendMessage = async (matchId: string, content: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('send_chat_message', {
      body: { 
        match_id: matchId, 
        content 
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data as string;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Function to mark messages as read
export const markMessagesAsRead = async (matchId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('mark_messages_as_read', {
      body: { match_id: matchId }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// Function to generate a random conversation topic
export const generateRandomTopic = async (matchId: string): Promise<string> => {
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
    throw error;
  }
};

// Function to translate a message
export const translateMessage = async (messageId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('translate_message', {
      body: { message_id: messageId }
    });
    
    if (error) {
      throw error;
    }
    
    return data as string;
  } catch (error) {
    console.error("Error translating message:", error);
    throw error;
  }
};
