import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { Search, CheckCircle2, MapPin, Star, Building2 } from "lucide-react";
import type { Supplier } from "@shared/schema";

export default function SupplierDirectory() {
  const [, setLocation] = useLocation();

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const verifiedSuppliers = suppliers.filter(s => s.isVerified);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-card border-b border-card-border py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-bold mb-4 text-center" data-testid="text-directory-title">
              Find Verified Suppliers
            </h1>
            <p className="text-center text-muted-foreground text-lg mb-8" data-testid="text-directory-subtitle">
              Connect with trusted manufacturers and wholesalers from South Africa and beyond
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by company name, product, or industry..."
                    className="pl-10 h-12"
                    data-testid="input-supplier-search"
                  />
                </div>
                <Button size="lg" className="px-8" data-testid="button-search-suppliers">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1" data-testid="text-results-title">
                {verifiedSuppliers.length > 0 ? "Verified Suppliers" : "All Suppliers"}
              </h2>
              <p className="text-muted-foreground" data-testid="text-results-count">
                Showing <span className="font-semibold text-foreground">{suppliers.length}</span> suppliers
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading suppliers...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Suppliers Yet</h3>
              <p className="text-muted-foreground">
                Be the first to register as a supplier on MzansiGlobalMarket!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {suppliers.map((supplier) => (
                <Card 
                  key={supplier.id} 
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => setLocation(`/suppliers/${supplier.id}`)}
                  data-testid={`supplier-card-${supplier.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        {supplier.logo ? (
                          <img
                            src={supplier.logo}
                            alt={supplier.companyName}
                            className="w-20 h-20 rounded-lg object-cover border"
                            data-testid={`img-supplier-${supplier.id}`}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2" data-testid={`text-supplier-name-${supplier.id}`}>
                              {supplier.companyName}
                              {supplier.isVerified && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                              {supplier.isGoldSupplier && (
                                <Badge className="bg-yellow-500 ml-1">Gold</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {supplier.location}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {supplier.rating && parseFloat(supplier.rating) > 0 && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold">{supplier.rating}</span>
                              </div>
                            )}
                            {supplier.responseRate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Response: {supplier.responseRate}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {supplier.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {supplier.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {supplier.categories?.slice(0, 4).map((cat, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {supplier.categories && supplier.categories.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{supplier.categories.length - 4} more
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.yearsInBusiness} years in business
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {suppliers.length > 10 && (
            <div className="mt-12 flex justify-center">
              <div className="flex gap-2">
                <Button variant="outline" disabled data-testid="button-prev-suppliers">
                  Previous
                </Button>
                <Button variant="default" data-testid="button-supplier-page-1">1</Button>
                <Button variant="outline" data-testid="button-supplier-page-2">2</Button>
                <Button variant="outline" data-testid="button-supplier-page-3">3</Button>
                <Button variant="outline" data-testid="button-next-suppliers">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
