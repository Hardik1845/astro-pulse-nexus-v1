import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-glow-cyan hover:scale-110 transition-all duration-300 z-50 animate-pulse-glow"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] border-border bg-card/95 backdrop-blur-md shadow-glow-cyan z-50 flex flex-col animate-fade-in">
          <CardHeader className="border-b border-border flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary animate-pulse-glow" />
              Ask AstroPulse AI
            </CardTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Sample AI Message */}
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-foreground">
                  Hello! I'm AstroPulse AI. I can help you understand space weather patterns, predict solar events, and
                  analyze satellite risks. What would you like to know?
                </p>
              </div>
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about space weather..."
                className="flex-1 bg-secondary/50"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    // Handle send message
                    setMessage("");
                  }
                }}
              />
              <Button
                size="icon"
                className="bg-primary hover:bg-primary/80 shadow-glow-cyan"
                onClick={() => {
                  if (message.trim()) {
                    // Handle send message
                    setMessage("");
                  }
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatInterface;
