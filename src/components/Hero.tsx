import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

const Hero = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const handleLaunchDemo = () => {
    navigate('/demo');
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-24 lg:pt-28">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/hero.jpg" 
          alt="Vehicle Service" 
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Lighter overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/75 to-background/85"></div>
      </div>
      
      {/* Subtle accent gradients */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent leading-tight pb-2">
            {t.heroTitle}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
            {t.heroDescription}
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-md border border-blue-600/30 px-4 py-2 rounded-full shadow-lg">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold text-blue-100 dark:text-blue-200">Instant Answers</span>
            </div>
            <div className="flex items-center gap-2 bg-green-600/20 backdrop-blur-md border border-green-600/30 px-4 py-2 rounded-full shadow-lg">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-semibold text-green-100 dark:text-green-200">95% Accuracy</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-600/20 backdrop-blur-md border border-purple-600/30 px-4 py-2 rounded-full shadow-lg">
              <span className="text-2xl">📚</span>
              <span className="text-sm font-semibold text-purple-100 dark:text-purple-200">1000+ Manuals</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleLaunchDemo}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white font-bold text-lg px-10 py-7 rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 active:scale-95 backdrop-blur-sm border border-white/20"
            >
              {/* Animated gradient overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-2xl"></span>
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out skew-x-12"></span>
              <span className="relative z-10 flex items-center gap-2">
                <span>⚡</span>
                {t.tryAIAssistant}
              </span>
            </Button>
            <Button
              onClick={() => navigate('/about')}
              size="lg"
              variant="outline"
              className="group relative overflow-hidden font-bold text-lg px-10 py-7 rounded-2xl border-2 bg-black/20 backdrop-blur-md border-white/30 text-white hover:text-white hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl active:scale-95"
            >
              {/* Glassmorphism background */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></span>
              {/* Border glow effect */}
              <span className="absolute inset-0 rounded-2xl border-2 border-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center gap-2">
                <span>📖</span>
                {t.learnMore}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
