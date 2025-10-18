import { Card } from "@/components/ui/card";
import { Zap, Shield, Rocket } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Answers",
    description: "Get step-by-step troubleshooting guidance in seconds. No more manual searching.",
  },
  {
    icon: Shield,
    title: "Increase Accuracy",
    description: "Our RAG-powered AI pulls answers directly from your official service documents, ensuring high precision.",
  },
  {
    icon: Rocket,
    title: "Boost Efficiency",
    description: "Reduce vehicle downtime, improve technician productivity, and increase customer satisfaction.",
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
