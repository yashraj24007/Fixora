import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Thermometer, AlertTriangle, Battery, Fuel, Wind, Droplets, MessageSquare, BookOpen, Zap } from "lucide-react";
import FixoraLogo from "@/components/FixoraLogo";

const Troubleshooting = () => {
  const navigate = useNavigate();

  // Pre-written diagnostic prompts for common issues
  const diagnosticPrompts = [
    {
      icon: Battery,
      title: "Engine Won't Start",
      description: "Get AI-guided step-by-step diagnosis for starting issues",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      prompt: "My engine won't start. Please help me diagnose the issue step by step. Ask me yes/no questions to narrow down the problem, starting with the most common causes (battery, starter, fuel, ignition). Based on my answers, guide me to the likely cause and solution."
    },
    {
      icon: Thermometer,
      title: "Engine Overheating",
      description: "AI-powered diagnosis for cooling system issues",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      prompt: "My engine is overheating. Please help me diagnose the cooling system issue step by step. Ask me diagnostic questions about coolant level, temperature gauge behavior, leaks, fan operation, and thermostat. Guide me to identify and fix the problem."
    },
    {
      icon: AlertTriangle,
      title: "Brake Problems",
      description: "Comprehensive brake system diagnostics",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      prompt: "I'm experiencing brake problems (specify: squeaking, grinding, soft pedal, pulling, or other). Please diagnose the issue step by step. Ask me about symptoms, brake pad condition, fluid level, pedal feel, and any warning lights. Help me identify what needs repair."
    },
    {
      icon: Wrench,
      title: "Transmission Issues",
      description: "Automatic and manual transmission troubleshooting",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      prompt: "I'm having transmission problems (specify: slipping, rough shifting, no engagement, noise, or other). Please help diagnose whether it's transmission fluid, solenoids, clutch, or something else. Ask diagnostic questions and guide me through the troubleshooting process."
    },
    {
      icon: Fuel,
      title: "Fuel System Problems",
      description: "Diagnose fuel delivery and injection issues",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      prompt: "I'm experiencing fuel system issues (specify: poor fuel economy, hard starting when cold/hot, rough idle, loss of power, or other). Please help diagnose fuel pump, injectors, filter, or pressure regulator issues. Guide me step by step."
    },
    {
      icon: Wind,
      title: "HVAC Issues",
      description: "Heating and air conditioning diagnostics",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      prompt: "My HVAC system isn't working properly (specify: no heat, no AC, weak airflow, strange smells, or other). Please diagnose the issue step by step. Ask about symptoms, blower operation, temperature control, and refrigerant. Help me identify the problem."
    },
  ];

  const handleStartDiagnosis = (prompt: string) => {
    // Store the prompt in sessionStorage so the Assistant page can use it
    sessionStorage.setItem('autoPrompt', prompt);
    // Navigate to the assistant page
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FixoraLogo size={56} className="text-primary animate-pulse" />
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Fixora
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground mb-2">
                  AI-powered troubleshooting - Upload your manual, describe the problem, get step-by-step solutions
                </p>
                <p className="text-sm text-muted-foreground/80">
                  Click any category below to start an intelligent diagnostic conversation with our AI
                </p>
              </div>

              {/* Diagnostic Prompt Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {diagnosticPrompts.map((item, index) => (
                  <Card 
                    key={index} 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleStartDiagnosis(item.prompt)}
                  >
                    <div className={`p-3 ${item.bgColor} rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <Button 
                      variant="default"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start AI Diagnosis →
                    </Button>
                  </Card>
                ))}
              </div>

              {/* How It Works Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">How Fixora Works</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 font-bold">1.</span>
                      <span><strong>Upload Your Manual:</strong> Start by uploading your vehicle's repair manual or service guide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 font-bold">2.</span>
                      <span><strong>Choose a Category:</strong> Click any diagnostic category above to start</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 font-bold">3.</span>
                      <span><strong>AI Conversation:</strong> Our AI asks diagnostic questions based on YOUR manual</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 font-bold">4.</span>
                      <span><strong>Get Solutions:</strong> Receive step-by-step repair instructions with page citations</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 bg-green-500/5 border-green-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-green-500" />
                    <h3 className="text-lg font-semibold">Why Better Than Static Guides?</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span><strong>Vehicle-Specific:</strong> Uses YOUR manual, not generic instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span><strong>Adaptive Questions:</strong> AI asks different questions based on your answers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span><strong>Exact Page Citations:</strong> Shows which page in your manual to reference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span><strong>Video Suggestions:</strong> Can recommend tutorial videos after diagnosis</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Quick Start Guide */}
              <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Don't see your problem? Ask Fixora directly!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can always go to the Assistant and describe any issue in your own words. Examples:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-background/50 p-3 rounded">
                    <span className="text-muted-foreground">💬 "My car makes a squealing noise when I brake"</span>
                  </div>
                  <div className="bg-background/50 p-3 rounded">
                    <span className="text-muted-foreground">💬 "Check engine light is on, code P0420"</span>
                  </div>
                  <div className="bg-background/50 p-3 rounded">
                    <span className="text-muted-foreground">💬 "Transmission slipping in 3rd gear"</span>
                  </div>
                  <div className="bg-background/50 p-3 rounded">
                    <span className="text-muted-foreground">💬 "AC blows warm air after 10 minutes"</span>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  className="w-full mt-4"
                  onClick={() => navigate('/')}
                >
                  Go to AI Assistant →
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Troubleshooting;
