import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, List, X } from "lucide-react";
import headphonesImg from "@assets/generated_images/product_example_headphones.png";
import bottlesImg from "@assets/generated_images/product_example_bottles.png";
import officeImg from "@assets/generated_images/product_example_office_supplies.png";
import lampImg from "@assets/generated_images/product_example_desk_lamp.png";

const products = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones with Active Noise Cancellation",
    image: headphonesImg,
    priceRange: "$15.00 - $25.00",
    moq: "100 pieces",
    supplierName: "TechAudio Manufacturing Co.",
    isVerified: true,
    isHot: true,
  },
  {
    id: "2",
    name: "Stainless Steel Water Bottles - Eco Friendly Insulated",
    image: bottlesImg,
    priceRange: "$5.00 - $12.00",
    moq: "500 pieces",
    supplierName: "EcoDrink Solutions Ltd.",
    isVerified: true,
    isHot: false,
  },
  {
    id: "3",
    name: "Premium Office Supplies Set - Corporate Gift Pack",
    image: officeImg,
    priceRange: "$8.00 - $15.00",
    moq: "200 sets",
    supplierName: "OfficeMax Industries",
    isVerified: true,
    isHot: false,
  },
  {
    id: "4",
    name: "Modern LED Desk Lamp with Adjustable Brightness",
    image: lampImg,
    priceRange: "$18.00 - $30.00",
    moq: "150 pieces",
    supplierName: "BrightLight Electronics",
    isVerified: false,
    isHot: true,
  },
  {
    id: "5",
    name: "Wireless Bluetooth Headphones - Premium Edition",
    image: headphonesImg,
    priceRange: "$20.00 - $35.00",
    moq: "100 pieces",
    supplierName: "AudioTech Pro",
    isVerified: true,
    isHot: false,
  },
  {
    id: "6",
    name: "Insulated Water Bottle - Sports Collection",
    image: bottlesImg,
    priceRange: "$6.00 - $14.00",
    moq: "300 pieces",
    supplierName: "SportGear Manufacturing",
    isVerified: true,
    isHot: false,
  },
  {
    id: "7",
    name: "Executive Office Stationery Collection",
    image: officeImg,
    priceRange: "$10.00 - $18.00",
    moq: "150 sets",
    supplierName: "PremiumOffice Ltd.",
    isVerified: true,
    isHot: false,
  },
  {
    id: "8",
    name: "Smart LED Table Lamp - RGB Color Changing",
    image: lampImg,
    priceRange: "$22.00 - $38.00",
    moq: "200 pieces",
    supplierName: "SmartHome Electronics",
    isVerified: true,
    isHot: true,
  },
];

export default function ProductCatalog() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-catalog-title">
              Electronics & Technology
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Active filters:</span>
              <Badge variant="secondary" className="gap-1">
                Electronics
                <X className="w-3 h-3 cursor-pointer" />
              </Badge>
              <Badge variant="secondary" className="gap-1">
                $0 - $1000
                <X className="w-3 h-3 cursor-pointer" />
              </Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar />
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 p-4 bg-card border border-card-border rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground" data-testid="text-result-count">
                    <span className="font-semibold text-foreground">2,847</span> products found
                  </span>
                  <div className="hidden md:flex items-center gap-2">
                    <Button size="icon" variant="ghost" data-testid="button-view-grid">
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" data-testid="button-view-list">
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-40" data-testid="select-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <Button variant="outline" disabled data-testid="button-prev-page">
                    Previous
                  </Button>
                  <Button variant="default" data-testid="button-page-1">1</Button>
                  <Button variant="outline" data-testid="button-page-2">2</Button>
                  <Button variant="outline" data-testid="button-page-3">3</Button>
                  <Button variant="outline" data-testid="button-next-page">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
