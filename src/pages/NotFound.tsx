import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations-new";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background p-6">
          <Card className="max-w-2xl w-full p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              404
            </h1>
            
            <h2 className="text-2xl font-semibold mb-4">
              {t.pageNotFound}
            </h2>
            
            <p className="text-muted-foreground mb-8 text-lg">
              {t.pageNotFoundDesc}
            </p>

            <div className="bg-muted/50 p-4 rounded-lg mb-8 text-left">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Requested URL:</span>
                <code className="ml-2 text-primary">{location.pathname}</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500"
                aria-label={t.backToHome}
              >
                <Home className="w-4 h-4 mr-2" />
                {t.backToHome}
              </Button>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'पिछला पेज' : 'Go Back'}
              </Button>
              
              <Button
                onClick={() => navigate('/help-center')}
                variant="outline"
                aria-label="Visit help center"
              >
                <Search className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}
              </Button>
            </div>

            {/* Quick Links */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'hi' ? 'या हमारे लोकप्रिय पेजों पर जाएं:' : 'Or visit our popular pages:'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => navigate('/demo')}
                  variant="link"
                  size="sm"
                  className="text-primary hover:underline"
                >
                  {language === 'hi' ? 'AI असिस्टेंट' : 'AI Assistant'}
                </Button>
                <Button
                  onClick={() => navigate('/features')}
                  variant="link"
                  size="sm"
                  className="text-primary hover:underline"
                >
                  {language === 'hi' ? 'विशेषताएँ' : 'Features'}
                </Button>
                <Button
                  onClick={() => navigate('/documentation')}
                  variant="link"
                  size="sm"
                  className="text-primary hover:underline"
                >
                  {language === 'hi' ? 'डॉक्यूमेंटेशन' : 'Documentation'}
                </Button>
                <Button
                  onClick={() => navigate('/contact-us')}
                  variant="link"
                  size="sm"
                  className="text-primary hover:underline"
                >
                  {language === 'hi' ? 'हमसे संपर्क करें' : 'Contact Us'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
