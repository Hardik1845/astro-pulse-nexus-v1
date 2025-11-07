import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";

const AIInsightsPanel = () => {
  const insights = [
    {
      title: "Solar Activity Summary",
      content: "Current solar flux levels are within normal ranges. No major flares detected in the past 24 hours.",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Prediction Alert",
      content: "Moderate geomagnetic storm expected in 48-72 hours. Satellite operators should prepare for minor disruptions.",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "AI Risk Assessment",
      content: "Overall risk level: LOW. Systems operating normally with 98% confidence in current predictions.",
      icon: Brain,
      color: "text-primary",
    },
  ];

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary animate-pulse-glow" />
          AI Intelligence Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background/50">
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-foreground">{insight.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
