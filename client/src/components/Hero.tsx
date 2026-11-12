import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@assets/generated_images/b2b_warehouse_hero_image.png";

const quickCategories = [
  "Electronics",
  "Machinery",
  "Textiles",
  "Home & Garden",
  "Auto Parts",
  "Chemicals",
];

export default function Hero() {
  // Fetch hero text from settings
  const { data: heroTextSetting } = useQuery({
    queryKey: ["/api/settings", "hero_text"],
  });

  const heroTitle = (heroTextSetting as any)?.value?.title || "Find Quality Suppliers Worldwide";
  const heroSubtitle = (heroTextSetting as any)?.value?.subtitle || "Connect with verified manufacturers and get competitive quotes";

  return (
    <div className="relative h-[600px] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-white mb-4" data-testid="text-hero-title">
          {heroTitle}
        </h1>
        <p className="text-xl text-white/90 mb-8" data-testid="text-hero-subtitle">
          {heroSubtitle}
        </p>

        <div className="backdrop-blur-lg bg-white/95 rounded-lg p-6 shadow-xl">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="What are you looking for?"
                className="pl-10 h-12 text-base"
                data-testid="input-hero-search"
              />
            </div>
            <Button size="lg" className="px-8" data-testid="button-search">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {quickCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover-elevate active-elevate-2"
                data-testid={`badge-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-white">
          <div data-testid="stat-suppliers">
            <div className="text-3xl font-bold">50K+</div>
            <div className="text-sm text-white/80">Verified Suppliers</div>
          </div>
          <div data-testid="stat-products">
            <div className="text-3xl font-bold">5M+</div>
            <div className="text-sm text-white/80">Products</div>
          </div>
          <div data-testid="stat-countries">
            <div className="text-3xl font-bold">180+</div>
            <div className="text-sm text-white/80">Countries</div>
          </div>
        </div>
      </div>
    </div>
  );
}
