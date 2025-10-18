import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ErrorDiagnosis = () => {
  const commonErrors = [
    { code: "P0420", description: "Catalyst System Efficiency Below Threshold", severity: "warning" },
    { code: "P0300", description: "Random/Multiple Cylinder Misfire Detected", severity: "critical" },
    { code: "P0171", description: "System Too Lean (Bank 1)", severity: "warning" },
    { code: "P0401", description: "Exhaust Gas Recirculation Flow Insufficient", severity: "moderate" },
    { code: "P0128", description: "Coolant Thermostat Temperature Below Regulating", severity: "moderate" },
    { code: "P0442", description: "Evaporative Emission Control System Leak Detected", severity: "warning" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Error Code Diagnosis</h1>
                <p className="text-xl text-muted-foreground">
                  Instantly diagnose and understand vehicle error codes
                </p>
              </div>

              {/* Search Box */}
              <Card className="p-6 mb-12">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter error code (e.g., P0420)" 
                    className="flex-1"
                  />
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-500">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </Card>

              {/* Common Error Codes */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Common Error Codes</h2>
                <div className="space-y-4">
                  {commonErrors.map((error, index) => (
                    <Card key={index} className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          error.severity === 'critical' ? 'bg-red-500/10' :
                          error.severity === 'warning' ? 'bg-yellow-500/10' :
                          'bg-blue-500/10'
                        }`}>
                          <AlertCircle className={`h-5 w-5 ${
                            error.severity === 'critical' ? 'text-red-500' :
                            error.severity === 'warning' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono font-bold text-lg">{error.code}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              error.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                              error.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {error.severity}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{error.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorDiagnosis;
