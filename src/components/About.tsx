import { Card } from "@/components/ui/card";
import { Users, Target, Lightbulb, Award, Shield, Zap } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To revolutionize automotive service with AI-powered assistance that saves time and increases accuracy."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Leveraging cutting-edge RAG technology to deliver instant, context-aware technical solutions."
    },
    {
      icon: Shield,
      title: "Reliability",
      description: "Every answer is backed by verified documentation with transparent source citations."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Service Manuals" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "50K+", label: "Queries Solved" },
    { number: "500+", label: "Service Centers" }
  ];

  const team = [
    {
      role: "AI & Technology",
      description: "Our AI engineers and data scientists work tirelessly to improve accuracy and speed."
    },
    {
      role: "Automotive Experts",
      description: "Industry veterans who ensure our system understands real-world service challenges."
    },
    {
      role: "Support Team",
      description: "Dedicated professionals ready to help you get the most out of Fixora."
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">About Fixora</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering automotive technicians with AI-driven intelligence
            </p>
          </div>

          {/* Story Section */}
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-16">
            <p>
              <span className="text-primary font-semibold">Fixora (Vehicle Service Assistant)</span> was created with a 
              simple mission: to empower automotive technicians with cutting-edge AI technology that makes their 
              jobs easier, faster, and more accurate.
            </p>

            <p>
              We understand the challenges technicians face every day—tight deadlines, complex diagnostics, 
              and the pressure to get it right the first time. That's why we've built an intelligent assistant 
              that instantly retrieves the exact information you need from thousands of pages of technical documentation.
            </p>

            <p>
              Built on state-of-the-art Retrieval-Augmented Generation (RAG) technology, Fixora doesn't just search—it 
              understands context, retrieves relevant information, and generates clear, actionable answers with 
              source citations you can trust.
            </p>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-10">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold mb-3">{value.title}</h4>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-16">
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-blue-600/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-10">Meet Our Team</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="p-6 hover:border-primary transition-all">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{member.role}</h4>
                      <p className="text-sm text-muted-foreground">{member.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Section */}
          <div className="mb-16">
            <Card className="p-8 border-2 border-primary/20">
              <div className="flex items-start gap-4 mb-6">
                <Zap className="w-10 h-10 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold mb-4">Powered by Advanced AI</h3>
                  <p className="text-muted-foreground mb-4">
                    Fixora uses Retrieval-Augmented Generation (RAG), combining the power of large language models 
                    with your specific technical documentation to provide accurate, contextual answers.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Natural language processing for easy queries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Real-time document retrieval from your knowledge base
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Source citations for every answer
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Continuous learning and improvement
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-blue-600/10">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Transform Your Service Center?</h3>
              <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
                Experience the power of AI-driven vehicle service assistance. Join thousands of technicians 
                who have already revolutionized their workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg"
                >
                  Try AI Assistant
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground font-semibold rounded-lg border-2 border-border hover:border-primary transition-all"
                >
                  Learn More
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
