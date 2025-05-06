import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/useLanguage";
import { Globe, Lightbulb, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { sendChatMessage, formatTimeAgo, generateRandomTopic, getChatMessages, markMessagesAsRead } from "@/utils/chatHelpers";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChatRoomProps {
  matchId: string;
}

export function ChatRoom({ matchId }: ChatRoomProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const initialMessages = await getChatMessages(matchId);
        setMessages(initialMessages);
        // Mark messages as read when the chat loads
        await markMessagesAsRead(matchId);
      } catch (error) {
        console.error("Error loading initial messages:", error);
        toast({
          title: t("chat.error_loading_messages"),
          description: t("chat.try_again"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, [matchId, t, toast]);

  useEffect(() => {
    // Scroll to bottom on initial load and when new messages are added
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const sentMessage = await sendChatMessage(matchId, newMessage);
      if (sentMessage) {
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setNewMessage(""); // Clear the input field after sending
        scrollToBottom(); // Scroll to the bottom after sending
      } else {
        toast({
          title: t("chat.error_sending_message"),
          description: t("chat.try_again"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t("chat.error_sending_message"),
        description: t("chat.try_again"),
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTopicSuggestion = async () => {
    try {
      const suggestedTopic = await generateRandomTopic(matchId);
      if (suggestedTopic) {
        setTopic(suggestedTopic);
      } else {
        toast({
          title: t("chat.error_getting_topic"),
          description: t("chat.try_again"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating topic:", error);
      toast({
        title: t("chat.error_getting_topic"),
        description: t("chat.try_again"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("chat.chat_with_user")}</h2>
          <div className="flex items-center space-x-2">
            <Toggle
              aria-label="Translate"
              pressed={isTranslating}
              onPressedChange={() => setIsTranslating(!isTranslating)}
            >
              <Globe className="h-5 w-5" />
            </Toggle>
            <Button variant="outline" size="icon" onClick={handleTopicSuggestion}>
              <Lightbulb className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {topic && (
          <div className="mt-2 p-3 bg-secondary rounded-md">
            <p className="text-sm text-muted-foreground">
              {t("chat.suggested_topic")}: {topic}
            </p>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.sender_id === user?.id}
              showOriginal={showOriginal}
              isTranslating={isTranslating}
            />
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="icon" onClick={() => setShowOriginal(!showOriginal)}>
            <ArrowUp className="h-5 w-5" />
          </Button>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.type_message")}
            className="flex-1 p-3 rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none scrollbar-hide"
          />
          <Button onClick={handleSendMessage}>{t("chat.send")}</Button>
        </div>
      </div>
    </div>
  );
}
