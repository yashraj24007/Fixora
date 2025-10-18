import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Search, FileText, Wrench, Droplet, Gauge, Cog, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TechnicalSpecs = () => {
  const [expandedVehicle, setExpandedVehicle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const vehicles = [
    { 
      make: "Ford", 
      model: "F-150", 
      year: "2023", 
      category: "Light Truck",
      specs: ["Engine: 3.5L EcoBoost V6", "Torque: 500 lb-ft", "Horsepower: 400 HP"],
      details: {
        engine: {
          type: "3.5L EcoBoost V6 Twin-Turbo",
          displacement: "3.5L (213 cu in)",
          horsepower: "400 HP @ 6,000 RPM",
          torque: "500 lb-ft @ 3,100 RPM",
          transmission: "10-Speed Automatic"
        },
        fluids: {
          engineOil: "5W-30 Full Synthetic",
          oilCapacity: "6.0 quarts (with filter)",
          coolant: "Motorcraft Orange",
          coolantCapacity: "16.0 quarts",
          fuelCapacity: "26 gallons",
          brakeFluid: "DOT 3"
        },
        torqueSpecs: {
          headBolt: "Step 1: 30 lb-ft, Step 2: 50 lb-ft, Step 3: +90°",
          wheelLug: "150 lb-ft",
          sparkPlug: "11 lb-ft",
          oilDrain: "10 lb-ft"
        },
        maintenance: {
          oilChange: "Every 10,000 miles",
          airFilter: "Every 30,000 miles",
          sparkPlugs: "Every 100,000 miles",
          coolant: "Every 100,000 miles"
        }
      }
    },
    { 
      make: "Toyota", 
      model: "Camry", 
      year: "2024", 
      category: "Sedan",
      specs: ["Engine: 2.5L I4", "Torque: 184 lb-ft", "Horsepower: 203 HP"],
      details: {
        engine: {
          type: "2.5L Inline-4",
          displacement: "2.5L (152 cu in)",
          horsepower: "203 HP @ 6,600 RPM",
          torque: "184 lb-ft @ 5,000 RPM",
          transmission: "8-Speed Automatic"
        },
        fluids: {
          engineOil: "0W-20 Synthetic",
          oilCapacity: "4.8 quarts (with filter)",
          coolant: "Toyota Super Long Life",
          coolantCapacity: "7.0 quarts",
          fuelCapacity: "15.8 gallons",
          brakeFluid: "DOT 3"
        },
        torqueSpecs: {
          headBolt: "Step 1: 27 lb-ft, Step 2: +90°, Step 3: +90°",
          wheelLug: "76 lb-ft",
          sparkPlug: "18 lb-ft",
          oilDrain: "27 lb-ft"
        },
        maintenance: {
          oilChange: "Every 10,000 miles",
          airFilter: "Every 30,000 miles",
          sparkPlugs: "Every 120,000 miles",
          coolant: "Every 100,000 miles"
        }
      }
    },
    { 
      make: "Honda", 
      model: "Accord", 
      year: "2023", 
      category: "Sedan",
      specs: ["Engine: 1.5L Turbo", "Torque: 192 lb-ft", "Horsepower: 192 HP"],
      details: {
        engine: {
          type: "1.5L Turbo I4",
          displacement: "1.5L (91 cu in)",
          horsepower: "192 HP @ 5,500 RPM",
          torque: "192 lb-ft @ 1,600-5,000 RPM",
          transmission: "CVT"
        },
        fluids: {
          engineOil: "0W-20 Synthetic",
          oilCapacity: "3.7 quarts (with filter)",
          coolant: "Honda Type 2 Blue",
          coolantCapacity: "6.4 quarts",
          fuelCapacity: "14.8 gallons",
          brakeFluid: "DOT 3"
        },
        torqueSpecs: {
          headBolt: "Step 1: 22 lb-ft, Step 2: +130°",
          wheelLug: "80 lb-ft",
          sparkPlug: "13 lb-ft",
          oilDrain: "30 lb-ft"
        },
        maintenance: {
          oilChange: "Every 7,500 miles",
          airFilter: "Every 30,000 miles",
          sparkPlugs: "Every 60,000 miles",
          coolant: "Every 120,000 miles"
        }
      }
    },
    { 
      make: "Chevrolet", 
      model: "Silverado 1500", 
      year: "2024", 
      category: "Full-Size Truck",
      specs: ["Engine: 5.3L V8", "Torque: 383 lb-ft", "Horsepower: 355 HP"],
      details: {
        engine: {
          type: "5.3L V8",
          displacement: "5.3L (325 cu in)",
          horsepower: "355 HP @ 5,600 RPM",
          torque: "383 lb-ft @ 4,100 RPM",
          transmission: "10-Speed Automatic"
        },
        fluids: {
          engineOil: "5W-30 Dexos",
          oilCapacity: "8.0 quarts (with filter)",
          coolant: "Dex-Cool Orange",
          coolantCapacity: "13.4 quarts",
          fuelCapacity: "24 gallons",
          brakeFluid: "DOT 3"
        },
        torqueSpecs: {
          headBolt: "Step 1: 22 lb-ft, Step 2: +90° (short), +120° (long)",
          wheelLug: "140 lb-ft",
          sparkPlug: "11 lb-ft",
          oilDrain: "18 lb-ft"
        },
        maintenance: {
          oilChange: "Every 7,500 miles",
          airFilter: "Every 45,000 miles",
          sparkPlugs: "Every 100,000 miles",
          coolant: "Every 150,000 miles"
        }
      }
    },
  ];

  const filteredVehicles = vehicles.filter(v =>
    searchQuery === "" ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.year.includes(searchQuery)
  );

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
                  <Input 
                    placeholder="Search by make, model, or year..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                  {filteredVehicles.map((vehicle, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-all border-border">
                      <div 
                        className="flex items-start gap-4 cursor-pointer"
                        onClick={() => setExpandedVehicle(expandedVehicle === index ? null : index)}
                      >
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                            <Badge variant="outline">{vehicle.category}</Badge>
                          </div>
                          <ul className="space-y-2 mt-3">
                            {vehicle.specs.map((spec, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {spec}
                              </li>
                            ))}
                          </ul>
                          <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
                            {expandedVehicle === index ? (
                              <>Hide Details <ChevronUp className="w-4 h-4" /></>
                            ) : (
                              <>View Full Specs <ChevronDown className="w-4 h-4" /></>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedVehicle === index && (
                        <div className="mt-6 pt-6 border-t border-border space-y-6">
                          {/* Engine Specifications */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Cog className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold text-lg">Engine Specifications</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-sm bg-muted/30 p-4 rounded-lg">
                              <div><span className="text-muted-foreground">Type:</span> <span className="font-medium ml-2">{vehicle.details.engine.type}</span></div>
                              <div><span className="text-muted-foreground">Displacement:</span> <span className="font-medium ml-2">{vehicle.details.engine.displacement}</span></div>
                              <div><span className="text-muted-foreground">Horsepower:</span> <span className="font-medium ml-2">{vehicle.details.engine.horsepower}</span></div>
                              <div><span className="text-muted-foreground">Torque:</span> <span className="font-medium ml-2">{vehicle.details.engine.torque}</span></div>
                              <div className="md:col-span-2"><span className="text-muted-foreground">Transmission:</span> <span className="font-medium ml-2">{vehicle.details.engine.transmission}</span></div>
                            </div>
                          </div>

                          {/* Fluid Capacities */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Droplet className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold text-lg">Fluid Capacities & Types</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-sm bg-muted/30 p-4 rounded-lg">
                              <div><span className="text-muted-foreground">Engine Oil:</span> <span className="font-medium ml-2">{vehicle.details.fluids.engineOil}</span></div>
                              <div><span className="text-muted-foreground">Oil Capacity:</span> <span className="font-medium ml-2">{vehicle.details.fluids.oilCapacity}</span></div>
                              <div><span className="text-muted-foreground">Coolant Type:</span> <span className="font-medium ml-2">{vehicle.details.fluids.coolant}</span></div>
                              <div><span className="text-muted-foreground">Coolant Cap:</span> <span className="font-medium ml-2">{vehicle.details.fluids.coolantCapacity}</span></div>
                              <div><span className="text-muted-foreground">Fuel Capacity:</span> <span className="font-medium ml-2">{vehicle.details.fluids.fuelCapacity}</span></div>
                              <div><span className="text-muted-foreground">Brake Fluid:</span> <span className="font-medium ml-2">{vehicle.details.fluids.brakeFluid}</span></div>
                            </div>
                          </div>

                          {/* Torque Specifications */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Wrench className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold text-lg">Torque Specifications</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="bg-primary/5 p-3 rounded border border-primary/20">
                                <span className="text-muted-foreground font-medium">Cylinder Head Bolt:</span>
                                <p className="font-medium mt-1 text-foreground">{vehicle.details.torqueSpecs.headBolt}</p>
                              </div>
                              <div className="grid md:grid-cols-3 gap-2">
                                <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground">Wheel Lug:</span> <span className="font-medium block">{vehicle.details.torqueSpecs.wheelLug}</span></div>
                                <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground">Spark Plug:</span> <span className="font-medium block">{vehicle.details.torqueSpecs.sparkPlug}</span></div>
                                <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground">Oil Drain:</span> <span className="font-medium block">{vehicle.details.torqueSpecs.oilDrain}</span></div>
                              </div>
                            </div>
                          </div>

                          {/* Maintenance Schedule */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Gauge className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold text-lg">Maintenance Schedule</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-sm bg-muted/30 p-4 rounded-lg">
                              <div><span className="text-muted-foreground">Oil Change:</span> <span className="font-medium ml-2">{vehicle.details.maintenance.oilChange}</span></div>
                              <div><span className="text-muted-foreground">Air Filter:</span> <span className="font-medium ml-2">{vehicle.details.maintenance.airFilter}</span></div>
                              <div><span className="text-muted-foreground">Spark Plugs:</span> <span className="font-medium ml-2">{vehicle.details.maintenance.sparkPlugs}</span></div>
                              <div><span className="text-muted-foreground">Coolant Flush:</span> <span className="font-medium ml-2">{vehicle.details.maintenance.coolant}</span></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Assistant CTA */}
              <Card className="p-6 mt-12 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Need More Detailed Specifications?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your vehicle's service manual to our AI Assistant for instant access to complete technical specifications, 
                      detailed repair procedures, and specific torque values for your exact model and year.
                    </p>
                    <Button className="bg-primary" onClick={() => navigate('/demo')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Try AI Assistant
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TechnicalSpecs;
