import { Card } from "@/components/ui/card";
import { Wrench, AlertCircle, FileText, Search } from "lucide-react";

const UseCases = () => {
  const useCases = [
    {
      icon: Wrench,
      title: "Repair Procedures",
      description: "Get step-by-step instructions for any repair job",
      example: "\"How do I replace the timing belt on a 2023 Honda Accord?\"",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: AlertCircle,
      title: "Error Code Diagnosis",
      description: "Quickly diagnose and resolve error codes",
      example: "\"What does error code P0420 mean and how do I fix it?\"",
      color: "bg-red-500/10 text-red-500"
    },
    {
      icon: FileText,
      title: "Technical Specifications",
      description: "Find torque specs, fluid capacities, and more",
      example: "\"What are the torque specs for Ford F-150 cylinder head bolts?\"",
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: Search,
      title: "Troubleshooting Guides",
      description: "Systematic approaches to diagnose complex issues",
      example: "\"Why is my vehicle overheating? Walk me through diagnostics.\"",
      color: "bg-purple-500/10 text-purple-500"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Can Fixora Do For You?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From simple queries to complex diagnostics, Fixora handles it all with AI precision
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${useCase.color}`}>
                  <useCase.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-3">{useCase.description}</p>
                  <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                    <p className="text-sm italic text-muted-foreground">
                      {useCase.example}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Workshop?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of technicians who have already reduced their diagnostic time by up to 90%. 
              Experience the power of AI-driven service assistance today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                Try AI Assistant Free
              </a>
              <a 
                href="/features" 
                className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground font-semibold rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Learn More
              </a>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
