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
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 md:pt-32 lg:pt-36">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/hero.jpg" 
          alt="Vehicle Service" 
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent leading-tight">
            {t.heroTitle}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
            {t.heroDescription}
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-blue-600/10 dark:bg-blue-600/20 px-4 py-2 rounded-full border border-blue-600/30">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Instant Answers</span>
            </div>
            <div className="flex items-center gap-2 bg-green-600/10 dark:bg-green-600/20 px-4 py-2 rounded-full border border-green-600/30">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">95% Accuracy</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-600/10 dark:bg-purple-600/20 px-4 py-2 rounded-full border border-purple-600/30">
              <span className="text-2xl">📚</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">1000+ Manuals</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleLaunchDemo}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg px-10 py-7 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="relative z-10">{t.tryAIAssistant}</span>
            </Button>
            <Button
              onClick={() => navigate('/about')}
              size="lg"
              variant="outline"
              className="group relative overflow-hidden font-bold text-lg px-10 py-7 border-2 border-foreground/20 text-foreground hover:text-foreground hover:border-foreground/40 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 shadow-lg hover:shadow-2xl hover:shadow-foreground/20 active:scale-95"
            >
              <span className="absolute inset-0 bg-foreground/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="relative z-10">{t.learnMore}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
