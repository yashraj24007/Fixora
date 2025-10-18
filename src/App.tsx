import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Eager load critical pages (Index for initial load performance)
import Index from "./pages/Index";

// Lazy load all other pages for code splitting
const Demo = lazy(() => import("./pages/Demo"));
const FeaturesPage = lazy(() => import("./pages/Features"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorks"));
const AboutPage = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const Documentation = lazy(() => import("./pages/Documentation"));
const RepairProcedures = lazy(() => import("./pages/RepairProcedures"));
const ErrorDiagnosis = lazy(() => import("./pages/ErrorDiagnosis"));
const TechnicalSpecs = lazy(() => import("./pages/TechnicalSpecs"));
const Troubleshooting = lazy(() => import("./pages/Troubleshooting"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const CommunityChat = lazy(() => import("./pages/CommunityChat"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const VideoTutorials = lazy(() => import("./pages/VideoTutorials"));
const TestedManuals = lazy(() => import("./pages/TestedManuals"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar skeleton */}
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="pt-24 container mx-auto px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="fixora-ui-theme">
      <LanguageProvider defaultLanguage="en" storageKey="fixora-language">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <ErrorBoundary>
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/documentation" element={<Documentation />} />
                  <Route path="/repair-procedures" element={<RepairProcedures />} />
                  <Route path="/error-diagnosis" element={<ErrorDiagnosis />} />
                  <Route path="/technical-specs" element={<TechnicalSpecs />} />
                  <Route path="/troubleshooting" element={<Troubleshooting />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/video-tutorials" element={<VideoTutorials />} />
                  <Route path="/tested-manuals" element={<TestedManuals />} />
                  <Route path="/community-chat" element={<CommunityChat />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
