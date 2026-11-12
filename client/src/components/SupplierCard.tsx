import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Star, MapPin } from "lucide-react";

interface SupplierCardProps {
  id: string;
  companyName: string;
  logo: string;
  location: string;
  yearsInBusiness: number;
  categories: string[];
  rating: number;
  responseRate: string;
  isVerified: boolean;
  isGoldSupplier?: boolean;
}

export default function SupplierCard({
  id,
  companyName,
  logo,
  location,
  yearsInBusiness,
  categories,
  rating,
  responseRate,
  isVerified,
  isGoldSupplier,
}: SupplierCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-supplier-${id}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
            <img
              src={logo}
              alt={companyName}
              className="w-full h-full object-contain p-2"
              data-testid={`img-supplier-logo-${id}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-lg truncate mb-1"
                  data-testid={`text-supplier-name-${id}`}
                >
                  {companyName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {isGoldSupplier && (
                    <Badge className="text-xs bg-yellow-600 text-white">
                      Gold Supplier
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2" data-testid={`text-location-${id}`}>
              <MapPin className="w-4 h-4" />
              {location} • {yearsInBusiness} years
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {categories.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium" data-testid={`text-rating-${id}`}>{rating}</span>
              </div>
              <div className="text-sm text-muted-foreground" data-testid={`text-response-${id}`}>
                {responseRate} response rate
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" data-testid={`button-contact-supplier-${id}`}>
                Contact Supplier
              </Button>
              <Button variant="outline" data-testid={`button-view-profile-${id}`}>
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
