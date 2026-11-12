import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Flame } from "lucide-react";
import type { Product } from "@shared/schema";

type TrendingProduct = Product & { viewCount?: number };

export default function TrendingProducts() {
  const { data: products, isLoading } = useQuery<TrendingProduct[]>({
    queryKey: ["/api/products/trending"],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Trending Products</h2>
          <Badge variant="secondary" className="ml-2">
            <Flame className="w-3 h-3 mr-1" />
            Most Viewed
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 10).map((product, index) => (
            <a
              key={product.id}
              href={`/products?product=${product.id}`}
              className="group block"
              data-testid={`card-trending-product-${product.id}`}
            >
              <Card className="overflow-hidden hover-elevate transition-all">
                <div className="aspect-square relative bg-muted">
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {index < 3 && (
                    <Badge 
                      className="absolute top-2 left-2"
                      variant={index === 0 ? "default" : "secondary"}
                    >
                      #{index + 1}
                    </Badge>
                  )}
                  {product.isHot && (
                    <Badge className="absolute top-2 right-2 bg-orange-500">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-primary font-semibold">
                    R{product.priceMin} - R{product.priceMax}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MOQ: {product.moq}
                  </p>
                  {product.viewCount && (
                    <p className="text-xs text-muted-foreground">
                      {product.viewCount} views
                    </p>
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
