"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, 
  X, 
} from "lucide-react";
import { ChatList } from "./chat-list";
import { ChatConversation } from "./chat-conversation";
import { useNotifications } from "@/hooks/use-notifications";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'trader' | 'transporter' | 'wholesaler';
  avatar?: string;
}

interface LiveChatProps {
  user: User;
}

export function LiveChat({ user }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { notifications } = useNotifications();

  const unreadMessages = notifications.filter(n => n.type === 'new_message' && !n.is_read).length;

  return (

    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-accent text-white shadow-2xl hover:shadow-accent/20 transition-all duration-300 relative"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {unreadMessages > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-background">
              {unreadMessages}
            </div>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-120px)] z-40 shadow-2xl overflow-hidden"
          >
            <Card className="h-full border-border/50 bg-background/95 backdrop-blur-xl rounded-none flex flex-col">
              {selectedConversationId ? (
                <ChatConversation 
                  conversationId={selectedConversationId} 
                  userId={user.id} 
                  onBack={() => setSelectedConversationId(null)}
                />
              ) : (
                <ChatList 
                  userId={user.id} 
                  onSelectConversation={setSelectedConversationId}
                  selectedId={selectedConversationId || undefined}
                />
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}