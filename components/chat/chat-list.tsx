"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChatListProps {
  userId: string;
  onSelectConversation: (id: string) => void;
  selectedId?: string;
}

export function ChatList({ userId, onSelectConversation, selectedId }: ChatListProps) {
  const [search, setSearch] = useState("");
  const { data: conversations, error, isLoading } = useSWR("/api/chat/conversations", fetcher, {
    refreshInterval: 5000,
  });

  const filteredConversations = conversations?.filter((c: any) => {
    const otherUser = c.buyerId === userId ? c.trader : c.buyer;
    return otherUser.name.toLowerCase().includes(search.toLowerCase()) || 
           c.product?.name.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading && !conversations) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4 opacity-40">
        <div className="w-6 h-6 border-t-2 border-accent rounded-full animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-widest">Retrieving Logs...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-r border-border/50">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent/60">
            COMMUNICATIONS // LOGS
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Messages</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            placeholder="Search Archives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-10 rounded-none border-border/50 bg-muted/5 font-mono text-[10px] uppercase tracking-widest focus-visible:ring-accent/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {filteredConversations?.length === 0 ? (
          <div className="p-12 text-center space-y-4 opacity-30">
            <MessageSquare className="h-12 w-12 mx-auto" />
            <div className="text-[10px] font-black uppercase tracking-widest">No Transmissions Found</div>
          </div>
        ) : (
          <div className="space-y-1 px-3">
            {filteredConversations?.map((conv: any) => {
              const otherUser = conv.buyerId === userId ? conv.trader : conv.buyer;
              const lastMessage = conv.messages[0];
              const isSelected = selectedId === conv.id;
              const hasUnread = lastMessage && !lastMessage.isRead && lastMessage.senderId !== userId;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-4 transition-all duration-200 flex items-center gap-4 group relative overflow-hidden ${
                    isSelected 
                      ? "bg-accent text-white" 
                      : "hover:bg-muted/50 border border-transparent hover:border-border/50"
                  }`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="active-bg"
                      className="absolute inset-0 bg-accent z-0"
                    />
                  )}
                  
                  <div className="relative z-10">
                    <Avatar className="h-12 w-12 rounded-none border border-white/10">
                      <AvatarImage src={otherUser.image} />
                      <AvatarFallback className={`rounded-none font-black ${isSelected ? "bg-white/10" : "bg-accent text-white"}`}>
                        {otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-background rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                        {otherUser.name}
                      </div>
                      {lastMessage && (
                        <div className={`text-[8px] font-bold uppercase ${isSelected ? "text-white/60" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-[10px] font-medium truncate ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                      {lastMessage ? lastMessage.content : "Start a conversation"}
                    </div>
                    
                    {conv.product && (
                      <div className={`mt-2 text-[8px] font-black uppercase tracking-widest py-1 px-2 w-fit ${
                        isSelected ? "bg-white/10 text-white" : "bg-accent/10 text-accent"
                      }`}>
                        Item: {conv.product.name}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
