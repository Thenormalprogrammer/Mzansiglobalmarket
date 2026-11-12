import ProductCard from "./ProductCard";
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
];

export default function ProductGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" data-testid="text-products-title">
              Trending Products
            </h2>
            <p className="text-muted-foreground" data-testid="text-products-subtitle">
              Discover popular items from verified suppliers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
