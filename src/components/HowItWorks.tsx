import { Card } from "@/components/ui/card";
import { Upload, Search, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload & Index",
    description: "Connect your service manuals, technical bulletins, or other PDFs. Our system intelligently indexes the content.",
    step: "1",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "When you ask a question, the AI performs a vector search to find the most relevant sections in your documents.",
    step: "2",
  },
  {
    icon: MessageSquare,
    title: "Generate & Cite",
    description: "The AI synthesizes the retrieved information into a clear, actionable answer, complete with source citations.",
    step: "3",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            From Manual to Answer in 3 Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our RAG-powered system transforms how you access technical information
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 -z-10"></div>

            {steps.map((step, index) => (
              <Card
                key={index}
                className="relative bg-card border-border p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step number badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-2xl text-primary-foreground shadow-lg">
                  {step.step}
                </div>

                <div className="mb-6 mt-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-foreground text-center">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
