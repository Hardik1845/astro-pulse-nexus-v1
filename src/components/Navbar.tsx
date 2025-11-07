import { Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  const tabs = [
    { name: "Dashboard", path: "/" },
    { name: "Predictions", path: "/predictions" },
    { name: "Insights", path: "/insights" },
    { name: "3D View", path: "/3d-view" },
    { name: "Chat AI", path: "/chat" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-8 h-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 animate-pulse-glow">
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AstroPulse
            </h1>
          </Link>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`text-sm font-medium transition-colors duration-300 relative group ${
                  location.pathname === tab.path ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {tab.name}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    location.pathname === tab.path ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            ))}
          </div>

          {/* Solar Status Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-accent/30">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow"></div>
            <span className="text-xs font-medium text-accent">Solar Stable</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
