"use client"
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Paperclip, Send, Smile, Timer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MessageBubble from "./Message_Bubble";
import { useAuth } from "@/All_Components/screen/AuthContext";

export default function ChatDetail({ chat, onBack, onSendMessage }) {
  const [messageInput, setMessageInput] = useState("");
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };
const toggleTimer = () => {
  setTimerActive((prev) => !prev);
};
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat?.image || "/placeholder.svg"} alt={chat?.name} />
          <AvatarFallback>{chat?.name?.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{chat?.name}</h2>
            <span className="text-xs text-muted-foreground">{chat?.type} Specialist</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {chat?.rate?.perMinute}/min • {chat?.rate?.perMessage}/message
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={timerActive ? "destructive" : "outline"}
                size="sm"
                onClick={toggleTimer}
                className="gap-1"
              >
                <Timer className="h-4 w-4" />
                {timerActive && <span className="text-xs">{formatTimerDuration(timerDuration)}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {timerActive ? "Stop session timer" : "Start session timer (billed per minute)"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {(chat?.messages || []).map((message) => (
            <MessageBubble 
              key={message._id || message.id} 
              message={message} 
              isMe={message.role === 'user'} 
              isLoading={message.isLoading}
            />
          ))}
          {isSending && (
           <div className="flex justify-start">
  <div className="max-w-[75%] rounded-lg bg-muted px-4 py-2">
    <div className="flex space-x-1">
      <p className="text-muted-foreground">Typing</p>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="pr-10"
              disabled={isSending}
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0">
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="brand" 
            onClick={handleSendMessage} 
            disabled={!messageInput.trim() || isSending} 
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}