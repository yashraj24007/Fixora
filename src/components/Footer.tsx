import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import FixoraLogo from "@/components/FixoraLogo";

// Newsletter form validation schema
const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const Footer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmitNewsletter = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    
    toast({
      title: "Successfully subscribed!",
      description: `Thank you for subscribing with ${data.email}`,
    });
    
    reset();
    
    // Reset success state after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FixoraLogo size={40} className="text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Fixora</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover AI-powered vehicle service solutions through intelligent assistance
            </p>
            <div className="space-y-2">
              <a 
                href="mailto:support@fixora.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" />
                support@fixora.com
              </a>
              <a 
                href="tel:+91 9876543210" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                +91 9876543210
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/repair-procedures" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Repair Procedures
                </Link>
              </li>
              <li>
                <Link to="/error-diagnosis" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Error Diagnosis
                </Link>
              </li>
              <li>
                <Link to="/technical-specs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Technical Specs
                </Link>
              </li>
              <li>
                <Link to="/troubleshooting" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Troubleshooting
                </Link>
              </li>
              <li>
                <Link to="/video-tutorials" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Video Tutorials
                </Link>
              </li>
              <li>
                <Link to="/tested-manuals" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tested Manuals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help-center" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/community-chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Community Chat
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Stay Connected</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe for vehicle service updates and exclusive AI assistant features.
            </p>
            <form 
              onSubmit={handleSubmit(onSubmitNewsletter)}
              className="max-w-md mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className={`bg-background border-border focus:border-primary ${
                      errors.email ? "border-destructive focus:border-destructive" : ""
                    }`}
                    aria-label="Email address for newsletter"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    disabled={isSubmitting || isSubscribed}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p 
                      id="email-error" 
                      className="text-sm text-destructive mt-1 text-left"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white px-8 shadow-lg transition-all duration-300"
                  disabled={isSubmitting || isSubscribed}
                  aria-label="Subscribe to newsletter"
                >
                  {isSubscribed ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Subscribed!
                    </>
                  ) : isSubmitting ? (
                    "Subscribing..."
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 flex items-center justify-center transition-all group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 flex items-center justify-center transition-all group"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 flex items-center justify-center transition-all group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} Fixora. All rights reserved. Built with ❤️ for vehicle service excellence.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
