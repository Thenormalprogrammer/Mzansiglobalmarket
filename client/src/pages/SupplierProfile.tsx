import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQueryFn } from "@/lib/queryClient";
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Star,
  MessageSquare,
  Phone,
  Mail,
  Building2,
  Package
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Product, Supplier } from "@shared/schema";
import ContactModal from "@/components/ContactModal";

interface SupplierProfileData {
  supplier: Supplier;
  products: Product[];
  userId: number;
  contactName: string;
}

export default function SupplierProfile() {
  const { id } = useParams();
  const [showContactModal, setShowContactModal] = useState(false);

  const { data, isLoading, error } = useQuery<SupplierProfileData>({
    queryKey: ["/api/suppliers", id, "profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading supplier profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Supplier Not Found</CardTitle>
              <CardDescription>
                The supplier you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/suppliers"} data-testid="button-back-suppliers">
                Browse Suppliers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { supplier, products, userId, contactName } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="text-center">
                  {supplier.logo ? (
                    <img
                      src={supplier.logo}
                      alt={supplier.companyName}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/20"
                      data-testid="img-supplier-logo"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <CardTitle className="mt-4 flex items-center justify-center gap-2" data-testid="text-company-name">
                    {supplier.companyName}
                    {supplier.isVerified && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {supplier.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Years in Business
                    </span>
                    <span className="font-medium">{supplier.yearsInBusiness}</span>
                  </div>
                  
                  {supplier.rating && parseFloat(supplier.rating) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4" />
                        Rating
                      </span>
                      <span className="font-medium">{supplier.rating}/5.0</span>
                    </div>
                  )}

                  {supplier.isGoldSupplier && (
                    <Badge className="w-full justify-center bg-yellow-500 hover:bg-yellow-600">
                      Gold Supplier
                    </Badge>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => setShowContactModal(true)}
                      data-testid="button-contact-supplier"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Supplier
                    </Button>
                  </div>

                  {supplier.categories && supplier.categories.length > 0 && (
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map((cat, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {supplier.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground" data-testid="text-description">
                      {supplier.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Products ({products.length})
                  </CardTitle>
                  <CardDescription>
                    Browse products from this supplier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      This supplier hasn't listed any products yet.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover-elevate" data-testid={`product-card-${product.id}`}>
                          {product.images && product.images.length > 0 && (
                            <div className="aspect-video relative overflow-hidden bg-muted">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                data-testid={`img-product-${product.id}`}
                              />
                              {product.isHot && (
                                <Badge className="absolute top-2 left-2 bg-orange-500">
                                  Hot
                                </Badge>
                              )}
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h3 className="font-semibold line-clamp-1" data-testid={`text-product-name-${product.id}`}>
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {product.description || "No description available"}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-primary font-bold" data-testid={`text-product-price-${product.id}`}>
                                R{product.priceMin} - R{product.priceMax}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                MOQ: {product.moq}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <ContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        supplier={supplier}
        receiverId={userId}
        contactName={contactName}
      />
    </div>
  );
}
