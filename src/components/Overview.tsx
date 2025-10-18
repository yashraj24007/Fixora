import { Card } from "@/components/ui/card";
import { Zap, Clock, BookOpen, TrendingUp } from "lucide-react";

const Overview = () => {
  const stats = [
    {
      icon: Clock,
      value: "90%",
      label: "Faster Diagnostics",
      description: "Reduce repair time dramatically"
    },
    {
      icon: BookOpen,
      value: "1000+",
      label: "Service Manuals",
      description: "Comprehensive knowledge base"
    },
    {
      icon: Zap,
      value: "Instant",
      label: "Query Response",
      description: "Get answers in seconds"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Accuracy Rate",
      description: "AI-powered precision"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Main Overview */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to the Future of Vehicle Service
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fixora (Vehicle Service Assistant) is a cutting-edge RAG-based AI system designed specifically 
            for automotive technicians. Say goodbye to bulky manuals and endless searches. Our intelligent 
            assistant understands your queries in natural language and retrieves exact information from 
            your service documentation instantly.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-foreground mb-2">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </Card>
          ))}
        </div>

        {/* Problem & Solution */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 bg-card border-2 border-destructive/20">
            <h3 className="text-2xl font-bold mb-4 text-destructive">The Problem</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Technicians waste hours searching through massive service manuals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Vehicle breakdowns lead to frustrated customers and lost revenue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Complex troubleshooting guides are hard to navigate under pressure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Critical specifications are buried deep in documentation</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 bg-card border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-primary">The Solution</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Ask questions in plain English and get instant, accurate answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Step-by-step troubleshooting guides delivered in seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Exact specifications and torque values at your fingertips</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Source citations so you can verify every recommendation</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Why Choose Fixora */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">Why Choose Fixora?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold mb-2">Precision</h4>
              <p className="text-sm text-muted-foreground">
                Retrieval-Augmented Generation ensures every answer is backed by your official documentation
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-semibold mb-2">Speed</h4>
              <p className="text-sm text-muted-foreground">
                Get answers in seconds instead of hours, keeping repairs on track and customers happy
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-semibold mb-2">Security</h4>
              <p className="text-sm text-muted-foreground">
                Your service manuals and proprietary data stay secure in your own knowledge base
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;
