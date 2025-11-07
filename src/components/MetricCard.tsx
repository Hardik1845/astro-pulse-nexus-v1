import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  glowColor?: "cyan" | "green" | "yellow";
}

const MetricCard = ({ title, value, unit, icon: Icon, trend = "stable", glowColor = "cyan" }: MetricCardProps) => {
  const glowClass = {
    cyan: "shadow-glow-cyan",
    green: "shadow-glow-green",
    yellow: "shadow-glow-yellow",
  }[glowColor];

  const trendColors = {
    up: "text-accent",
    down: "text-destructive",
    stable: "text-muted-foreground",
  };

  return (
    <Card className={`border-border bg-card/80 backdrop-blur-sm hover:${glowClass} transition-all duration-300 group`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-foreground">{value}</h3>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 group-hover:animate-pulse-glow">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${trendColors[trend]} animate-pulse`}></div>
          <span className="text-xs text-muted-foreground">
            {trend === "stable" ? "Stable" : trend === "up" ? "Increasing" : "Decreasing"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
