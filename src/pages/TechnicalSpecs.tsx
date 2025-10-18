import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TechnicalSpecs = () => {
  const vehicles = [
    { make: "Ford", model: "F-150", year: "2023", specs: ["Engine: 3.5L V6", "Torque: 400 lb-ft", "Horsepower: 400 HP"] },
    { make: "Toyota", model: "Camry", year: "2024", specs: ["Engine: 2.5L I4", "Torque: 184 lb-ft", "Horsepower: 203 HP"] },
    { make: "Honda", model: "Accord", year: "2023", specs: ["Engine: 1.5L Turbo", "Torque: 192 lb-ft", "Horsepower: 192 HP"] },
    { make: "Chevrolet", model: "Silverado", year: "2024", specs: ["Engine: 5.3L V8", "Torque: 383 lb-ft", "Horsepower: 355 HP"] },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Technical Specifications</h1>
                <p className="text-xl text-muted-foreground">
                  Find detailed technical specs, torque values, and capacities for any vehicle
                </p>
              </div>

              {/* Search */}
              <Card className="p-6 mb-12">
                <div className="flex gap-2">
                  <Input placeholder="Search by make, model, or year..." className="flex-1" />
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-500">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </Card>

              {/* Popular Vehicles */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Popular Vehicles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {vehicles.map((vehicle, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <ul className="space-y-2 mt-3">
                            {vehicle.specs.map((spec, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {spec}
                              </li>
                            ))}
                          </ul>
                          <button className="mt-4 text-sm text-primary hover:underline">View Full Specs →</button>
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

export default TechnicalSpecs;
