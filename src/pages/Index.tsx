import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import UseCases from "@/components/UseCases";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content">
        <Hero />
      <Overview />
      <Features />
      <UseCases />
      <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
