/**
 * SOS Emergency Page
 * Accessible to all users via header button
 * Shows nearby service centers based on GPS location
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SOSEmergency } from "@/components/SOSEmergency";

const SOSEmergencyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <SOSEmergency />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SOSEmergencyPage;
