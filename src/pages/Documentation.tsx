import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { BookOpen, FileText, Code, Video } from "lucide-react";

const Documentation = () => {
  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using Fixora AI Assistant",
      items: ["Quick Start Guide", "First Query", "Understanding Results", "Best Practices"]
    },
    {
      icon: FileText,
      title: "User Guides",
      description: "Detailed guides for all features",
      items: ["Upload Documents", "Search Techniques", "Citation Management", "Advanced Queries"]
    },
    {
      icon: Code,
      title: "API Documentation",
      description: "Integrate Fixora into your workflow",
      items: ["REST API", "Authentication", "Rate Limits", "Code Examples"]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch and learn from video guides",
      items: ["Introduction Video", "Feature Walkthrough", "Tips & Tricks", "Troubleshooting"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Everything you need to know about using Fixora effectively
                </p>
              </div>

              {/* Documentation Sections */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {sections.map((section, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                        <ul className="space-y-2">
                          {section.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                              → {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Links */}
              <Card className="p-8 bg-gradient-to-r from-primary/10 to-blue-600/10">
                <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                    Contact Support
                  </button>
                  <button className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    Community Forum
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Documentation;
