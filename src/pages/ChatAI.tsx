import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle,
  Send,
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import StarfieldBackground from "@/components/StarfieldBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { askAstroPulse } from "@/lib/api";

const ChatAI = () => {
  const [isThinking, setIsThinking] = useState(false);
  // --- ADD THIS NEW BLOCK ---
// Define the default message as a constant
const defaultMessage = {
  role: "ai",
  content:
    "Hello! I'm AstroPulse AI, your space weather intelligence assistant. I can help you understand solar activity, predict space weather events, analyze satellite risks, and answer questions about our monitoring systems. What would you like to know?",
  timestamp: new Date().toISOString(),
};

// Tell useState to "lazy load" its initial state
const [messages, setMessages] = useState(() => {
  // Try to get the history from sessionStorage
  const savedMessages = sessionStorage.getItem("astropulse_chat_history");
  if (savedMessages) {
    return JSON.parse(savedMessages);
  }
  // Otherwise, return the default message
  return [defaultMessage];
});
// --- END OF NEW BLOCK ---
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<string[]>([]); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, trace, isThinking]);

   useEffect(() => {
  // Save the current chat history to sessionStorage
  sessionStorage.setItem("astropulse_chat_history", JSON.stringify(messages));
}, [messages]);
  

  const quickQuestions = [
    "Generate a solar activity report for the last 7 days",
    "Predict potential magnetosphere impact from recent X-class flares",
    "Analyze satellite vulnerability based on recent Kp index",
    "Summarize current solar storm risks",
    "Show detailed space weather forecast",
  ];

 const handleSend = async (messageContent?: string) => {
    const content = (messageContent || input).trim();
    if (!content) return;

    const userMessage = {
      role: "user",
      content: content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsThinking(true); // show “AI is thinking…”
    setTrace([]); // clear previous trace

    // MODIFIED: Simplified the fake steps to be just strings
    const fakeSteps = [
      "Processing your request...",
      "Analyzing query context...",
      "Retrieving relevant information...",
      "Synthesizing findings...",
      "Compiling final response...",
    ];

    let stepIndex = 0;
    // Show the first step immediately
    if (fakeSteps.length > 0) {
      setTrace([fakeSteps[0]]);
      stepIndex = 1;
    }

    // MODIFIED: Store interval ref to clear it properly
    const intervalId = setInterval(() => {
      if (stepIndex >= fakeSteps.length) {
        clearInterval(intervalId);
        return;
      }
      // MODIFIED: Just push the string
      setTrace((prev) => [...prev, fakeSteps[stepIndex]]);
      stepIndex++;
    }, 1200);

    try {
      // NOTE: Ensure your real `askAstroPulse` function is calling
      // the /agent endpoint with the `trace=true` query parameter!
      const response = await askAstroPulse(content);

      clearInterval(intervalId); // Stop the fake steps

      // ✅ capture REAL trace (if backend sent it)
      if (
        response.trace &&
        Array.isArray(response.trace) &&
        response.trace.length > 0
      ) {
        // MODIFIED: Format the real trace (which might be complex objects) into simple strings
        const realTraceSteps = response.trace
          .map((step: any, index: number) => {
            if (typeof step === "string") return step;
            
            // --- This part is a guess based on LangChain's typical trace structure ---
            // --- You may need to adjust this to match your agent's `intermediate_steps` ---
            if (step && step.thought) {
              return `🧠 ${step.thought}`;
            }
            if (step && step.action && step.action.tool) {
              return `🛠️ Using tool: ${step.action.tool}`;
            }
            if (step && step.action) {
               return `▶️ Performing action...`;
            }
            // --- End of guess ---

            return `Executing Step ${index + 1}`; // Fallback
          })
          .filter(Boolean); // remove any null/undefined

        setTrace(realTraceSteps);

        // Wait a moment so the user can see the REAL trace
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        // If no trace, just wait a little
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const aiMessage = {
        role: "ai",
        content:
          response.report ||
          response.output ||
          "⚠️ No valid response received from the backend.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      clearInterval(intervalId); // MODIFIED: Also clear interval on error
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "❌ Error connecting to AstroPulse AI backend.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      clearInterval(intervalId); // MODIFIED: Ensure interval is cleared
      // ✅ remove “thinking” block
      setIsThinking(false);
      setTrace([]); // Clear trace so it's hidden
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-primary animate-pulse-glow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              Chat with AstroPulse AI
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask questions, get insights, and explore space weather
              intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat Area */}
            <Card className="lg:col-span-2 border-border bg-card/80 backdrop-blur-sm shadow-glow-cyan flex flex-col h-[600px]">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary animate-pulse-glow" />
                  Conversation
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 animate-fade-in ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        message.role === "ai"
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-accent/10 border border-accent/30"
                      }`}
                    >
                      {message.role === "ai" ? (
                        <Brain className="w-5 h-5 text-primary" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-4 rounded-lg ${
                        message.role === "ai"
                          ? "bg-secondary/50 border border-border"
                          : "bg-accent/10 border border-accent/30"
                      } max-w-[80%]`}
                    >
                      <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* 🧠 Instead of a separate block, show loading inside chat */}
                 {isThinking && (
                    <div className="flex items-start gap-3 animate-fade-in">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                        <Brain className="w-5 h-5 text-primary animate-pulse" />
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-secondary/50 border border-border max-w-[80%]">
                        <div className="space-y-2">
                          {trace.length === 0 ? (
                            // Default message if trace is empty
                            <p className="text-sm text-foreground animate-pulse">
                              🧠 AstroPulse AI is thinking...
                            </p>
                          ) : (
                            // Map over and render each step in the trace array
                            trace.map((step, index) => (
                              <p
                                key={index}
                                className="text-sm text-foreground animate-pulse"
                              >
                                {step}
                              </p>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* This ref is for auto-scrolling */}
              <div ref={chatEndRef} />  {/* <-- ADD THIS */}
              </CardContent>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AstroPulse AI anything..."
                    className="flex-1 bg-secondary/50"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                  />
                  <Button
                    size="icon"
                    className="bg-primary hover:bg-primary/80 shadow-glow-cyan"
                    onClick={() => handleSend()}
                    disabled={loading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Sidebar (Unchanged) */}
            <div className="space-y-6">
              {/* Quick Questions */}
              <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Quick Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="w-full text-left p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 text-sm text-foreground"
                    >
                      {question}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* AI Capabilities */}
              {/* <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      icon: TrendingUp,
                      label: "Trend Analysis",
                      color: "text-primary",
                    },
                    {
                      icon: AlertCircle,
                      label: "Risk Assessment",
                      color: "text-accent",
                    },
                    {
                      icon: Sparkles,
                      label: "Pattern Recognition",
                      color: "text-warning",
                    },
                    {
                      icon: MessageCircle,
                      label: "Q&A Support",
                      color: "text-primary",
                    },
                  ].map((capability, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                    >
                      <capability.icon
                        className={`w-5 h-5 ${capability.color}`}
                      />
                      <span className="text-sm text-foreground">
                        {capability.label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card> */}

              {/* AI Status */}
              {/* <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">AI Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Model</span>
                    <Badge
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Gemini 2.5 Flash
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <span className="text-sm text-accent">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Response Time
                    </span>
                    <span className="text-sm text-foreground">~1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Accuracy
                    </span>
                    <span className="text-sm text-primary font-medium">
                      94.7%
                    </span>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatAI;