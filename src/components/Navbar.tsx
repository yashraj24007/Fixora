import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Languages, ChevronDown, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import { translations, languageNames, languageEmojis } from "@/lib/translations";
import FixoraLogo from "@/components/FixoraLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="relative">
              <FixoraLogo size={40} className="text-primary transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Fixora
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground tracking-wide hidden xs:block">
                {t.vehicleServiceAssistant}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <div className="relative group">
              <button
                onClick={() => navigate('/')}
                className={`relative px-5 py-2 rounded-t-lg font-medium transition-all duration-300 ease-out ${
                  isActive('/') 
                    ? 'text-primary font-bold' 
                    : 'text-muted-foreground hover:text-primary group-hover:transform group-hover:-translate-y-0.5'
                }`}
              >
                {t.home}
              </button>
              {/* Blue underline with smooth animation */}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 transition-all duration-300 ease-out origin-left ${
                isActive('/') 
                  ? 'w-full opacity-100' 
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`} />
            </div>
            <div className="relative group">
              <button
                onClick={() => navigate('/demo')}
                className={`relative px-5 py-2 rounded-t-lg font-medium transition-all duration-300 ease-out ${
                  isActive('/demo') 
                    ? 'text-primary font-bold' 
                    : 'text-muted-foreground hover:text-primary group-hover:transform group-hover:-translate-y-0.5'
                }`}
              >
                {t.aiAssistant}
              </button>
              {/* Blue underline with smooth animation */}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 transition-all duration-300 ease-out origin-left ${
                isActive('/demo') 
                  ? 'w-full opacity-100' 
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`} />
            </div>
            <div className="relative group">
              <button
                onClick={() => navigate('/about')}
                className={`relative px-5 py-2 rounded-t-lg font-medium transition-all duration-300 ease-out ${
                  isActive('/about') 
                    ? 'text-primary font-bold' 
                    : 'text-muted-foreground hover:text-primary group-hover:transform group-hover:-translate-y-0.5'
                }`}
              >
                {t.about}
              </button>
              {/* Blue underline with smooth animation */}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 transition-all duration-300 ease-out origin-left ${
                isActive('/about') 
                  ? 'w-full opacity-100' 
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`} />
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="group gap-2 bg-card hover:bg-accent border-border hover:border-primary/50 transition-all duration-300"
                >
                  <Languages className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium hidden lg:inline">
                    {language === "en" ? "English" : "हिंदी"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-y-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-card border-border">
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={`gap-2 cursor-pointer ${
                    language === "en" 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "hover:bg-accent"
                  }`}
                >
                  <span className="text-base">{languageEmojis.en}</span>
                  <span>{languageNames.en}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("hi")}
                  className={`gap-2 cursor-pointer ${
                    language === "hi" 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "hover:bg-accent"
                  }`}
                >
                  <span className="text-base">{languageEmojis.hi}</span>
                  <span>{languageNames.hi}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="group gap-2 bg-card hover:bg-accent border-border hover:border-primary/50 transition-all duration-300"
            >
              {theme === "dark" ? (
                <>
                  <svg className="h-4 w-4 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium hidden lg:inline">Light</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-blue-500 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span className="text-sm font-medium hidden lg:inline">Dark</span>
                </>
              )}
            </Button>

            {/* Login Button */}
            <Button
              onClick={() => navigate('/login')}
              size="icon"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              title="Login"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              onClick={() => navigate('/login')}
              size="icon"
              variant="outline"
              className="h-9 w-9"
              title="Login"
            >
              <User className="h-4 w-4" />
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={isActive('/') ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/')}
                    >
                      {t.home}
                    </Button>
                    <Button
                      variant={isActive('/demo') ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/demo')}
                    >
                      {t.aiAssistant}
                    </Button>
                    <Button
                      variant={isActive('/about') ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/about')}
                    >
                      {t.about}
                    </Button>
                  </div>

                  {/* Mobile Settings */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Settings</h3>
                    
                    {/* Language Selection */}
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">Language</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={language === "en" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage("en")}
                          className="w-full"
                        >
                          {languageEmojis.en} English
                        </Button>
                        <Button
                          variant={language === "hi" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage("hi")}
                          className="w-full"
                        >
                          {languageEmojis.hi} हिंदी
                        </Button>
                      </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Theme</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        className="w-full justify-start gap-2"
                      >
                        {theme === "dark" ? (
                          <>
                            <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                            Switch to Light Mode
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                            Switch to Dark Mode
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
