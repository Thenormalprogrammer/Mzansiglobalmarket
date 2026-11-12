import { Card, CardContent } from "@/components/ui/card";
import electronicsImg from "@assets/generated_images/electronics_category_image.png";
import machineryImg from "@assets/generated_images/machinery_category_image.png";
import textilesImg from "@assets/generated_images/textiles_category_image.png";

const categories = [
  { id: "1", name: "Electronics & Technology", image: electronicsImg, count: "1.2M+" },
  { id: "2", name: "Machinery & Equipment", image: machineryImg, count: "850K+" },
  { id: "3", name: "Textiles & Apparel", image: textilesImg, count: "920K+" },
  { id: "4", name: "Home & Garden", image: electronicsImg, count: "650K+" },
  { id: "5", name: "Auto Parts & Accessories", image: machineryImg, count: "580K+" },
  { id: "6", name: "Chemicals & Materials", image: textilesImg, count: "420K+" },
  { id: "7", name: "Packaging & Printing", image: electronicsImg, count: "380K+" },
  { id: "8", name: "Construction & Building", image: machineryImg, count: "540K+" },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" data-testid="text-categories-title">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-lg" data-testid="text-categories-subtitle">
            Explore millions of products from verified suppliers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden"
              data-testid={`card-category-${category.id}`}
            >
              <div className="aspect-[4/3] bg-muted">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1" data-testid={`text-category-name-${category.id}`}>
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-category-count-${category.id}`}>
                  {category.count} products
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
