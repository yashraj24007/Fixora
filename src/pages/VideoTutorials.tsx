import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Clock, TrendingUp, Wrench, Cog, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";

const VideoTutorials = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: Cog,
      name: "Engine Repair",
      count: 45,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Wrench,
      name: "Maintenance",
      count: 38,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Zap,
      name: "Electrical",
      count: 32,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: TrendingUp,
      name: "Diagnostics",
      count: 28,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const popularVideos = [
    {
      title: "How to Change Engine Oil - Complete Guide",
      duration: "12:45",
      views: "125K",
      thumbnail: "🛢️",
      difficulty: "Beginner",
      category: "Maintenance"
    },
    {
      title: "Brake Pad Replacement Step by Step",
      duration: "18:30",
      views: "98K",
      thumbnail: "🔧",
      difficulty: "Intermediate",
      category: "Maintenance"
    },
    {
      title: "Diagnosing Check Engine Light P0420",
      duration: "15:20",
      views: "87K",
      thumbnail: "⚠️",
      difficulty: "Advanced",
      category: "Diagnostics"
    },
    {
      title: "Battery Testing and Replacement",
      duration: "10:15",
      views: "156K",
      thumbnail: "🔋",
      difficulty: "Beginner",
      category: "Electrical"
    },
    {
      title: "Timing Belt Replacement - Honda",
      duration: "25:40",
      views: "76K",
      thumbnail: "⚙️",
      difficulty: "Advanced",
      category: "Engine Repair"
    },
    {
      title: "Air Filter Change - Quick Fix",
      duration: "8:30",
      views: "210K",
      thumbnail: "🌬️",
      difficulty: "Beginner",
      category: "Maintenance"
    },
    {
      title: "Spark Plug Inspection and Replacement",
      duration: "14:20",
      views: "92K",
      thumbnail: "⚡",
      difficulty: "Intermediate",
      category: "Engine Repair"
    },
    {
      title: "Troubleshooting Engine Overheating",
      duration: "20:10",
      views: "68K",
      thumbnail: "🌡️",
      difficulty: "Intermediate",
      category: "Diagnostics"
    },
    {
      title: "Wheel Alignment Basics",
      duration: "16:45",
      views: "103K",
      thumbnail: "🎯",
      difficulty: "Intermediate",
      category: "Maintenance"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Beginner": return "text-green-500 bg-green-500/10";
      case "Intermediate": return "text-yellow-500 bg-yellow-500/10";
      case "Advanced": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Play className="w-4 h-4" />
              <span className="text-sm font-semibold">Video Learning Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Learn Vehicle Repair
              <span className="block text-primary mt-2">Through Video Tutorials</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Step-by-step video guides to help you diagnose, repair, and maintain your vehicle with confidence
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for repair tutorials... (e.g., 'oil change', 'brake repair')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-card border-2 border-border focus:border-primary rounded-xl"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 bg-card border-border"
              >
                <div className={`w-14 h-14 rounded-lg ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className={`w-7 h-7 ${category.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} video tutorials
                </p>
              </Card>
            ))}
          </div>

          {/* Popular Videos */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Popular Tutorials</h2>
              <Button variant="ghost" className="gap-2 group">
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularVideos.map((video, index) => (
                <Card 
                  key={index}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group bg-card border-border"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-6xl">{video.thumbnail}</span>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(video.difficulty)}`}>
                        {video.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {video.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {video.views} views
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="p-8 text-center bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Ask our AI Assistant! Get instant answers and personalized guidance for your specific vehicle issue.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white px-8 shadow-lg"
              onClick={() => window.location.href = '/demo'}
            >
              Try AI Assistant
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VideoTutorials;
