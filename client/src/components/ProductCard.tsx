import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, MessageSquare } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  priceRange: string;
  moq: string;
  supplierName: string;
  isVerified: boolean;
  isHot?: boolean;
}

export default function ProductCard({
  id,
  name,
  image,
  priceRange,
  moq,
  supplierName,
  isVerified,
  isHot,
}: ProductCardProps) {
  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-product-${id}`}>
      <div className="relative aspect-square bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${id}`}
        />
        {isHot && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
            Hot Item
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3
          className="font-medium text-base line-clamp-2 mb-2 min-h-[3rem]"
          data-testid={`text-product-name-${id}`}
        >
          {name}
        </h3>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-primary" data-testid={`text-price-${id}`}>
            {priceRange}
          </div>
          <div className="text-sm text-muted-foreground" data-testid={`text-moq-${id}`}>
            MOQ: {moq}
          </div>
          <div className="flex items-center gap-1 text-sm" data-testid={`text-supplier-${id}`}>
            {isVerified && <CheckCircle2 className="w-4 h-4 text-primary" />}
            <span className="text-muted-foreground truncate">{supplierName}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" size="sm" data-testid={`button-contact-${id}`}>
          <MessageSquare className="w-4 h-4 mr-1" />
          Contact
        </Button>
        <Button className="flex-1" size="sm" data-testid={`button-rfq-${id}`}>
          Request Quote
        </Button>
      </CardFooter>
    </Card>
  );
}
