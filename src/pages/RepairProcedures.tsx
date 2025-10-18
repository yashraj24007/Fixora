import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Wrench, Car, Cog, Battery } from "lucide-react";

const RepairProcedures = () => {
  const categories = [
    {
      icon: Wrench,
      title: "Engine Repairs",
      procedures: ["Timing Belt Replacement", "Oil Change", "Spark Plug Replacement", "Head Gasket Repair"]
    },
    {
      icon: Battery,
      title: "Electrical Systems",
      procedures: ["Battery Replacement", "Alternator Repair", "Starter Motor", "Fuse Box Diagnostics"]
    },
    {
      icon: Cog,
      title: "Transmission",
      procedures: ["Transmission Fluid Change", "Clutch Replacement", "Gear Box Repair", "CV Joint Repair"]
    },
    {
      icon: Car,
      title: "Body & Suspension",
      procedures: ["Brake Pad Replacement", "Shock Absorber", "Wheel Alignment", "Body Panel Repair"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Repair Procedures</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Comprehensive step-by-step repair guides for all vehicle types
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-4">{category.title}</h3>
                        <ul className="space-y-3">
                          {category.procedures.map((procedure, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                              <span className="text-primary">•</span>
                              {procedure}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default RepairProcedures;
