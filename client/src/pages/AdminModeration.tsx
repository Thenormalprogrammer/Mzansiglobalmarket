import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Loader2, Ban, CheckCircle, AlertTriangle, Eye, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function AdminModeration() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restrictReason, setRestrictReason] = useState("");
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [showUnrestrictDialog, setShowUnrestrictDialog] = useState(false);

  const isAdmin = user?.email === "mzansiglobalmarket@gmail.com";

  const { data: allProducts = [], isLoading: loadingAll } = useQuery<Product[]>({
    queryKey: ["/api/admin/products/all"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAdmin,
  });

  const { data: restrictedProducts = [], isLoading: loadingRestricted } = useQuery<Product[]>({
    queryKey: ["/api/admin/products/restricted"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAdmin,
  });

  const restrictMutation = useMutation({
    mutationFn: async ({ id, isRestricted, reason }: { id: number; isRestricted: boolean; reason?: string }) => {
      return apiRequest("POST", `/api/admin/products/${id}/restrict`, {
        isRestricted,
        restrictionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/restricted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: selectedProduct?.isRestricted ? "Product has been restored" : "Product has been restricted",
      });
      setShowRestrictDialog(false);
      setShowUnrestrictDialog(false);
      setSelectedProduct(null);
      setRestrictReason("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update product status", variant: "destructive" });
    },
  });

  const activeProducts = allProducts.filter((p) => !p.isRestricted);

  const handleRestrict = () => {
    if (!selectedProduct) return;
    restrictMutation.mutate({
      id: selectedProduct.id,
      isRestricted: true,
      reason: restrictReason,
    });
  };

  const handleUnrestrict = () => {
    if (!selectedProduct) return;
    restrictMutation.mutate({
      id: selectedProduct.id,
      isRestricted: false,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const ProductCard = ({ product, showRestrictButton = true }: { product: Product; showRestrictButton?: boolean }) => (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-32 h-32 bg-muted flex-shrink-0">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <p className="text-sm mt-1">
                ${product.priceMin} - ${product.priceMax}
              </p>
              {product.isRestricted && product.restrictionReason && (
                <p className="text-sm text-destructive mt-2">
                  Reason: {product.restrictionReason}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {product.isRestricted ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Ban className="w-3 h-3" />
                  Restricted
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLocation(`/products/${product.id}`)}
              data-testid={`button-view-product-${product.id}`}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {showRestrictButton && !product.isRestricted && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedProduct(product);
                  setShowRestrictDialog(true);
                }}
                data-testid={`button-restrict-product-${product.id}`}
              >
                <Ban className="w-3 h-3 mr-1" />
                Restrict
              </Button>
            )}
            {product.isRestricted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedProduct(product);
                  setShowUnrestrictDialog(true);
                }}
                data-testid={`button-unrestrict-product-${product.id}`}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Restore
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" data-testid="text-moderation-title">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                Product Moderation
              </h1>
              <p className="text-muted-foreground mt-1">Review and manage product listings</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/admin/dashboard")} data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-products">{allProducts.length}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-active-products">{activeProducts.length}</p>
                    <p className="text-sm text-muted-foreground">Active Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <Ban className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-restricted-products">{restrictedProducts.length}</p>
                    <p className="text-sm text-muted-foreground">Restricted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all-products">All Products</TabsTrigger>
              <TabsTrigger value="restricted" data-testid="tab-restricted-products">
                Restricted
                {restrictedProducts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{restrictedProducts.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loadingAll ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : allProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-muted-foreground">Products will appear here once suppliers add them</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {allProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="restricted">
              {loadingRestricted ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : restrictedProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium">No restricted products</p>
                    <p className="text-muted-foreground">All products are currently active</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {restrictedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} showRestrictButton={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <Dialog open={showRestrictDialog} onOpenChange={setShowRestrictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Restrict Product
            </DialogTitle>
            <DialogDescription>
              This product will be hidden from the marketplace. You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for restriction</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Inappropriate content, Policy violation, etc."
              value={restrictReason}
              onChange={(e) => setRestrictReason(e.target.value)}
              className="mt-2"
              data-testid="input-restrict-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestrictDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestrict}
              disabled={restrictMutation.isPending}
              data-testid="button-confirm-restrict"
            >
              {restrictMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Restrict Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnrestrictDialog} onOpenChange={setShowUnrestrictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Restore Product
            </DialogTitle>
            <DialogDescription>
              This product will be visible again on the marketplace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnrestrictDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnrestrict}
              disabled={restrictMutation.isPending}
              data-testid="button-confirm-unrestrict"
            >
              {restrictMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Restore Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
