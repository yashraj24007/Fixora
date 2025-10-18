import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, CheckCircle, TrendingUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/components/Footer";

interface Manual {
  id: number;
  title: string;
  manufacturer: string;
  year: string;
  category: string;
  pages: number;
  accuracy: number;
  queries: number;
  status: "verified" | "beta" | "new";
}

const dummyManuals: Manual[] = [
  {
    id: 1,
    title: "Honda Civic Service Manual",
    manufacturer: "Honda",
    year: "2018-2023",
    category: "Passenger Vehicle",
    pages: 1247,
    accuracy: 98.5,
    queries: 15420,
    status: "verified"
  },
  {
    id: 2,
    title: "Toyota Camry Hybrid Repair Guide",
    manufacturer: "Toyota",
    year: "2020-2024",
    category: "Hybrid Vehicle",
    pages: 1850,
    accuracy: 97.2,
    queries: 12350,
    status: "verified"
  },
  {
    id: 3,
    title: "Ford F-150 Workshop Manual",
    manufacturer: "Ford",
    year: "2019-2024",
    category: "Light Truck",
    pages: 2100,
    accuracy: 96.8,
    queries: 18970,
    status: "verified"
  },
  {
    id: 4,
    title: "BMW X5 Electrical Systems Guide",
    manufacturer: "BMW",
    year: "2021-2024",
    category: "Luxury SUV",
    pages: 950,
    accuracy: 95.3,
    queries: 8540,
    status: "verified"
  },
  {
    id: 5,
    title: "Mercedes-Benz C-Class Diagnostic Manual",
    manufacturer: "Mercedes-Benz",
    year: "2020-2024",
    category: "Luxury Sedan",
    pages: 1320,
    accuracy: 94.7,
    queries: 9870,
    status: "verified"
  },
  {
    id: 6,
    title: "Chevrolet Silverado Engine Manual",
    manufacturer: "Chevrolet",
    year: "2019-2023",
    category: "Heavy Duty Truck",
    pages: 1680,
    accuracy: 97.1,
    queries: 11230,
    status: "verified"
  },
  {
    id: 7,
    title: "Tesla Model 3 Service Documentation",
    manufacturer: "Tesla",
    year: "2021-2024",
    category: "Electric Vehicle",
    pages: 890,
    accuracy: 93.2,
    queries: 6540,
    status: "beta"
  },
  {
    id: 8,
    title: "Volkswagen Golf GTI Performance Manual",
    manufacturer: "Volkswagen",
    year: "2020-2024",
    category: "Performance Vehicle",
    pages: 1150,
    accuracy: 96.4,
    queries: 7890,
    status: "verified"
  },
  {
    id: 9,
    title: "Jeep Wrangler Off-Road Service Guide",
    manufacturer: "Jeep",
    year: "2018-2024",
    category: "Off-Road Vehicle",
    pages: 1420,
    accuracy: 95.8,
    queries: 10350,
    status: "verified"
  },
  {
    id: 10,
    title: "Audi A4 Advanced Diagnostics",
    manufacturer: "Audi",
    year: "2021-2024",
    category: "Luxury Sedan",
    pages: 1080,
    accuracy: 94.1,
    queries: 5670,
    status: "new"
  },
  {
    id: 11,
    title: "Subaru Outback AWD Systems Manual",
    manufacturer: "Subaru",
    year: "2020-2024",
    category: "All-Wheel Drive",
    pages: 980,
    accuracy: 96.7,
    queries: 6890,
    status: "verified"
  },
  {
    id: 12,
    title: "Nissan Altima CVT Transmission Guide",
    manufacturer: "Nissan",
    year: "2019-2023",
    category: "Passenger Vehicle",
    pages: 780,
    accuracy: 95.5,
    queries: 8970,
    status: "verified"
  }
];

const TestedManuals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterManufacturer, setFilterManufacturer] = useState("all");

  // Get unique categories and manufacturers for filters
  const categories = Array.from(new Set(dummyManuals.map(manual => manual.category)));
  const manufacturers = Array.from(new Set(dummyManuals.map(manual => manual.manufacturer)));

  // Filter manuals based on search and filters
  const filteredManuals = dummyManuals.filter(manual => {
    const matchesSearch = manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manual.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || manual.category === filterCategory;
    const matchesManufacturer = filterManufacturer === "all" || manual.manufacturer === filterManufacturer;
    
    return matchesSearch && matchesCategory && matchesManufacturer;
  });

  // Calculate overall stats
  const totalManuals = dummyManuals.length;
  const avgAccuracy = (dummyManuals.reduce((sum, manual) => sum + manual.accuracy, 0) / totalManuals).toFixed(1);
  const totalQueries = dummyManuals.reduce((sum, manual) => sum + manual.queries, 0);
  const totalPages = dummyManuals.reduce((sum, manual) => sum + manual.pages, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Verified</Badge>;
      case "beta":
        return <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700">Beta</Badge>;
      case "new":
        return <Badge variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">New</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 97) return "text-green-600";
    if (accuracy >= 95) return "text-blue-600";
    if (accuracy >= 93) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-blue-50 dark:to-blue-950/20 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Tested Manual Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore our comprehensive collection of 1000+ tested vehicle service manuals with 95% average accuracy across all automotive brands and models.
          </p>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalManuals}+</div>
                <div className="text-sm text-muted-foreground">Tested Manuals</div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{avgAccuracy}%</div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalQueries.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Queries</div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPages.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Pages</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Manual Library */}
      <div className="container mx-auto px-4 py-16">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search manuals by title or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  {manufacturers.map(manufacturer => (
                    <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Manual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManuals.map((manual) => (
            <Card key={manual.id} className="hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg font-semibold text-foreground leading-tight">
                    {manual.title}
                  </CardTitle>
                  {getStatusBadge(manual.status)}
                </div>
                <CardDescription className="text-sm">
                  {manual.manufacturer} • {manual.year} • {manual.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Accuracy Score */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AI Accuracy</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className={`font-semibold ${getAccuracyColor(manual.accuracy)}`}>
                        {manual.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Pages</div>
                      <div className="font-semibold">{manual.pages.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Queries</div>
                      <div className="font-semibold">{manual.queries.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Progress Bar for Accuracy */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Accuracy Score</span>
                      <span>{manual.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          manual.accuracy >= 97 ? "bg-green-600" :
                          manual.accuracy >= 95 ? "bg-blue-600" :
                          manual.accuracy >= 93 ? "bg-yellow-600" : "bg-red-600"
                        }`}
                        style={{ width: `${manual.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredManuals.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No manuals found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-50 dark:to-blue-950/20 border-primary/20">
            <CardContent className="p-8">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Want to Test Your Manual?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Upload your vehicle service manual to our AI assistant and see how it performs. 
                Join thousands of mechanics and technicians who trust Fixora for accurate, instant answers.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Try AI Assistant Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestedManuals;