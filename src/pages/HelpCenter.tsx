import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { HelpCircle, MessageSquare, Mail, Phone } from "lucide-react";

const HelpCenter = () => {
  const faqs = [
    { question: "How do I upload my service manuals?", answer: "Navigate to the AI Assistant page and click on the upload area in the Knowledge Base section." },
    { question: "What file formats are supported?", answer: "We support PDF, DOC, DOCX, and TXT files for service manuals and technical documentation." },
    { question: "How accurate are the AI responses?", answer: "Our AI maintains a 95% accuracy rate by sourcing answers directly from your uploaded documentation." },
    { question: "Can I use Fixora on mobile devices?", answer: "Yes! Fixora is fully responsive and works seamlessly on all mobile devices and tablets." },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
                <p className="text-xl text-muted-foreground">
                  Find answers to common questions and get support
                </p>
              </div>

              {/* Contact Options */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
                  <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Chat with our team</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
                  <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground">support@fixora.com</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
                  <Phone className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p className="text-sm text-muted-foreground">+91 9876543210</p>
                </Card>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start gap-4">
                        <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;
