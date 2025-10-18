import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle } from "lucide-react";

const CommunityChat = () => {
  const topics = [
    { title: "Engine Troubleshooting", posts: 245, members: 1203 },
    { title: "Electrical Systems", posts: 189, members: 856 },
    { title: "Transmission Issues", posts: 167, members: 724 },
    { title: "Body & Paint", posts: 134, members: 612 },
    { title: "Diagnostics Tips", posts: 298, members: 1456 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Chat</h1>
                <p className="text-xl text-muted-foreground">
                  Connect with fellow technicians and share knowledge
                </p>
              </div>

              {/* Community Stats */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="text-3xl font-bold mb-2">5,847</h3>
                  <p className="text-muted-foreground">Active Members</p>
                </Card>
                <Card className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="text-3xl font-bold mb-2">1,033</h3>
                  <p className="text-muted-foreground">Discussions</p>
                </Card>
              </div>

              {/* Popular Topics */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
                <div className="space-y-4">
                  {topics.map((topic, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{topic.posts} posts</span>
                            <span>•</span>
                            <span>{topic.members} members</span>
                          </div>
                        </div>
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Join CTA */}
              <Card className="p-8 mt-12 bg-gradient-to-r from-primary/10 to-blue-600/10 text-center">
                <h3 className="text-2xl font-bold mb-4">Join the Conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Connect with thousands of automotive professionals
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
                  Join Community
                </button>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default CommunityChat;
