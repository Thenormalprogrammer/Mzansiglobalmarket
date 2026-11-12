import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, XCircle, Clock, FileText, Settings, FileEdit, Shield, Image, FolderTree } from "lucide-react";
import { Link } from "wouter";
import type { User, Supplier, Product, RFQ } from "@shared/schema";

function PendingVerificationCard({ suppliers, isLoading }: { suppliers: Supplier[]; isLoading: boolean }) {
  const { toast } = useToast();
  const pendingSuppliers = suppliers.filter(s => s.verificationStatus === "submitted" && !s.isVerified);

  const verifyMutation = useMutation({
    mutationFn: async ({ supplierId, action, notes }: { supplierId: number; action: "approve" | "reject"; notes?: string }) => {
      const res = await apiRequest("POST", `/api/admin/suppliers/${supplierId}/verify`, { 
        verified: action === "approve", 
        notes 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Success",
        description: "Supplier verification status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update verification status",
      });
    },
  });

  const handleVerify = (supplierId: number, action: "approve" | "reject") => {
    verifyMutation.mutate({ supplierId, action });
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-yellow-600">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <CardTitle>Pending Verifications</CardTitle>
          {pendingSuppliers.length > 0 && (
            <Badge className="bg-yellow-600">{pendingSuppliers.length}</Badge>
          )}
        </div>
        <CardDescription>Suppliers awaiting document verification</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingSuppliers.length === 0 ? (
          <p className="text-muted-foreground">No pending verifications</p>
        ) : (
          <div className="space-y-4">
            {pendingSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-card"
                data-testid={`pending-supplier-${supplier.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-lg">{supplier.companyName}</p>
                    <Badge variant="secondary">{supplier.location}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{supplier.categories?.join(", ")}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {supplier.businessRegistrationDoc && (
                      <a 
                        href={supplier.businessRegistrationDoc.startsWith('data:') ? supplier.businessRegistrationDoc : `data:application/octet-stream;base64,${supplier.businessRegistrationDoc}`}
                        download="business-registration"
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid={`link-doc-business-${supplier.id}`}
                      >
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <FileText className="w-3 h-3" /> Business Reg
                        </Badge>
                      </a>
                    )}
                    {supplier.taxComplianceDoc && (
                      <a 
                        href={supplier.taxComplianceDoc.startsWith('data:') ? supplier.taxComplianceDoc : `data:application/octet-stream;base64,${supplier.taxComplianceDoc}`}
                        download="tax-compliance"
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid={`link-doc-tax-${supplier.id}`}
                      >
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <FileText className="w-3 h-3" /> Tax Compliance
                        </Badge>
                      </a>
                    )}
                    {supplier.proofOfResidenceDoc && (
                      <a 
                        href={supplier.proofOfResidenceDoc.startsWith('data:') ? supplier.proofOfResidenceDoc : `data:application/octet-stream;base64,${supplier.proofOfResidenceDoc}`}
                        download="proof-of-residence"
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid={`link-doc-residence-${supplier.id}`}
                      >
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <FileText className="w-3 h-3" /> Proof of Residence
                        </Badge>
                      </a>
                    )}
                    {supplier.bankAccountDoc && (
                      <a 
                        href={supplier.bankAccountDoc.startsWith('data:') ? supplier.bankAccountDoc : `data:application/octet-stream;base64,${supplier.bankAccountDoc}`}
                        download="bank-account"
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid={`link-doc-bank-${supplier.id}`}
                      >
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <FileText className="w-3 h-3" /> Bank Account
                        </Badge>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleVerify(supplier.id, "reject")}
                    disabled={verifyMutation.isPending}
                    data-testid={`button-reject-${supplier.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerify(supplier.id, "approve")}
                    disabled={verifyMutation.isPending}
                    data-testid={`button-approve-${supplier.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  // For now, we'll just show an admin panel summary
  // In a real app, you'd check if user has admin role
  const isAdmin = user?.email === "mzansiglobalmarket@gmail.com";

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: rfqsData, isLoading: rfqsLoading } = useQuery<RFQ[]>({
    queryKey: ["/api/rfqs"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const rfqs = rfqsData ?? [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only administrators can access this page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Marketplace overview and management</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/cms">
                <Button variant="outline" data-testid="link-admin-cms">
                  <FileEdit className="w-4 h-4 mr-2" />
                  Content
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" data-testid="link-admin-categories">
                  <FolderTree className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" data-testid="link-admin-settings">
                  <Image className="w-4 h-4 mr-2" />
                  Site Images
                </Button>
              </Link>
              <Link href="/admin/moderation">
                <Button variant="outline" data-testid="link-admin-moderation">
                  <Shield className="w-4 h-4 mr-2" />
                  Moderation
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-suppliers">
                  {suppliersLoading ? "..." : suppliers.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-products">
                  {productsLoading ? "..." : products.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active RFQs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-rfqs">
                  {rfqsLoading ? "..." : rfqs.filter((r) => r.status === "open").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Verification */}
          <PendingVerificationCard suppliers={suppliers} isLoading={suppliersLoading} />

          {/* Recent Suppliers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>All Suppliers</CardTitle>
              <CardDescription>Registered suppliers on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : suppliers.length === 0 ? (
                <p className="text-muted-foreground">No suppliers yet</p>
              ) : (
                <div className="space-y-4">
                  {suppliers.slice(0, 5).map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`supplier-row-${supplier.id}`}
                    >
                      <div>
                        <p className="font-medium" data-testid={`text-supplier-${supplier.id}`}>
                          {supplier.companyName}
                        </p>
                        <p className="text-sm text-muted-foreground">{supplier.location}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        {supplier.isVerified ? (
                          <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>
                        ) : supplier.verificationStatus === "submitted" ? (
                          <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                        ) : (
                          <Badge variant="secondary">Not Submitted</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent RFQs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent RFQs</CardTitle>
              <CardDescription>Latest quote requests from buyers</CardDescription>
            </CardHeader>
            <CardContent>
              {rfqsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : rfqs.length === 0 ? (
                <p className="text-muted-foreground">No RFQs yet</p>
              ) : (
                <div className="space-y-4">
                  {rfqs.slice(0, 5).map((rfq) => (
                    <div
                      key={rfq.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`rfq-row-${rfq.id}`}
                    >
                      <div>
                        <p className="font-medium" data-testid={`text-rfq-product-${rfq.id}`}>
                          {rfq.productName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {rfq.quantity} | Category: {rfq.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{rfq.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rfq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
