"use client"

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'trader' | 'transporter';
  avatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system';
  status: 'sent' | 'delivered' | 'read';
}

interface LiveChatProps {
  user: User;
}

export function LiveChat({ user }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(12);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        senderId: 'system',
        senderName: 'ADAZE Support',
        content: 'Welcome to ADAZE! How can we help you today?',
        timestamp: new Date(Date.now() - 300000),
        type: 'system',
        status: 'read'
      },
      {
        id: '2',
        senderId: 'support-1',
        senderName: 'Sarah (Support)',
        senderAvatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
        content: 'Hi! I\'m here to help you with any questions about our marketplace. Feel free to ask anything!',
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
        status: 'read'
      }
    ];
    setMessages(initialMessages);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: message,
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate support response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const supportResponse: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'support-1',
          senderName: 'Sarah (Support)',
          senderAvatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
          content: 'Thanks for your message! I\'ll help you with that right away. Let me check our system...',
          timestamp: new Date(),
          type: 'text',
          status: 'sent'
        };
        setMessages(prev => [...prev, supportResponse]);
        setIsTyping(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full african-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 relative mobile-button"
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
          
          {/* Notification badge */}
          <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 text-xs bg-red-500 text-white">
            2
          </Badge>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-96 z-40"
          >
            <Card className="h-full flex flex-col border-0 shadow-2xl bg-card/95 backdrop-blur-md">
              {/* Header */}
              <CardHeader className="p-3 sm:p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base truncate">ADAZE Support</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {onlineUsers} agents online
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="w-6 h-6 sm:w-8 sm:h-8 p-0 mobile-button">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-6 h-6 sm:w-8 sm:h-8 p-0 mobile-button">
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-6 h-6 sm:w-8 sm:h-8 p-0 mobile-button">
                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-1 sm:space-x-2 max-w-[85%] ${
                        msg.senderId === user.id ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {msg.senderId !== user.id && msg.type !== 'system' && (
                          <Avatar className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0">
                            <AvatarImage src={msg.senderAvatar} />
                            <AvatarFallback className="text-xs">
                              {msg.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`rounded-2xl px-3 py-2 ${
                          msg.type === 'system' 
                            ? 'bg-muted text-muted-foreground text-center text-xs'
                            : msg.senderId === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-xs sm:text-sm break-words">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end space-x-1 sm:space-x-2"
                    >
                      <Avatar className="h-4 w-4 sm:h-6 sm:w-6">
                        <AvatarImage src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg" />
                        <AvatarFallback className="text-xs">S</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="w-6 h-6 sm:w-8 sm:h-8 p-0 mobile-button flex-shrink-0">
                    <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-8 sm:pr-10 text-sm h-8 sm:h-10 focus-ring"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-0.5 sm:top-1 w-6 h-6 sm:w-8 sm:h-8 p-0 mobile-button"
                    >
                      <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="w-6 h-6 sm:w-8 sm:h-8 p-0 african-gradient text-white mobile-button flex-shrink-0"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}