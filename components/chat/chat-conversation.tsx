"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSWRConfig } from "swr";
import useSWR from "swr";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  ChevronLeft
} from "lucide-react";
import { chatService } from "@/lib/chat-service";
import { formatDistanceToNow } from "date-fns";

interface ChatConversationProps {
  conversationId: string;
  userId: string;
  onBack?: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChatConversation({ conversationId, userId, onBack }: ChatConversationProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutate } = useSWRConfig();

  const { data: messages, error, mutate: mutateMessages } = useSWR(
    `/api/chat/conversations/${conversationId}/messages`,
    fetcher,
    { refreshInterval: 3000 } // Poll every 3 seconds for new messages
  );

  const { data: conversations } = useSWR("/api/chat/conversations", fetcher);
  const conversation = conversations?.find((c: any) => c.id === conversationId);

  const otherUser = conversation?.buyerId === userId ? conversation?.trader : conversation?.buyer;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when opening
  useEffect(() => {
    if (conversationId) {
      chatService.markAsRead(conversationId, userId);
    }
  }, [conversationId, userId]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const content = message;
    setMessage("");

    try {
      await chatService.sendMessage(conversationId, userId, content);
      mutateMessages();
      mutate("/api/chat/conversations");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation && !messages) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-t-2 border-accent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/5">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="relative">
            <Avatar className="h-10 w-10 rounded-none">
              <AvatarImage src={otherUser?.image} />
              <AvatarFallback className="rounded-none bg-accent text-white font-black">
                {otherUser?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-tighter">{otherUser?.name || "User"}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-accent">Online</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 hover:opacity-100">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 hover:opacity-100">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Banner (if applicable) */}
      {conversation?.product && (
        <div className="p-3 bg-accent/5 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted border border-border/50 overflow-hidden relative">
              {conversation.product.imageUrl && (
                <Image 
                  src={conversation.product.imageUrl} 
                  alt={conversation.product.name} 
                  fill 
                  className="object-cover" 
                />
              )}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[150px]">
                {conversation.product.name}
              </div>
              <div className="text-[9px] font-bold text-accent">KSh {Number(conversation.product.price).toLocaleString()}</div>
            </div>
          </div>
          <Button variant="outline" className="h-8 rounded-none text-[8px] font-black uppercase tracking-widest border-accent/30 text-accent">
            View Item
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-accent/20">
        {messages?.map((msg: any, index: number) => {
          const isMe = msg.senderId === userId;
          const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <Avatar className="h-8 w-8 rounded-none">
                        <AvatarImage src={msg.sender.image} />
                        <AvatarFallback className="rounded-none text-[10px] bg-muted font-bold">
                          {msg.sender.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className={`p-4 text-sm ${
                    isMe 
                      ? "bg-accent text-white rounded-none rounded-tl-xl" 
                      : "bg-muted/50 text-foreground rounded-none rounded-tr-xl border border-border/50"
                  }`}>
                    <p className="leading-relaxed font-medium">{msg.content}</p>
                    {msg.attachments?.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {msg.attachments.map((url: string, i: number) => (
                          <div key={i} className="relative w-full h-24">
                            <Image 
                              src={url} 
                              alt="Attachment" 
                              fill 
                              className="object-cover border border-white/10" 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest opacity-40 ${isMe ? "text-right" : "text-left"}`}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-muted/5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none opacity-40 hover:opacity-100 hover:bg-accent/10">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="TRANSMIT MESSAGE..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 rounded-none border-border/50 bg-background px-4 font-mono text-[11px] uppercase tracking-wider focus-visible:ring-accent/50"
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className="h-12 w-12 rounded-none bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
          >
            <Send className={`h-4 w-4 ${isSending ? "animate-pulse" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
