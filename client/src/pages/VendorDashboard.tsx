import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import type { Supplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { UploadCloud, Plus, AlertCircle, CheckCircle2, Clock, XCircle, Shield, Building2 } from "lucide-react";
import { z } from "zod";

const createSupplierSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  yearsInBusiness: z.number().min(0, "Years in business must be 0 or more"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  description: z.string().optional(),
});

type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;

const SUPPLIER_CATEGORIES = [
  "Electronics",
  "Machinery",
  "Textiles & Apparel",
  "Home & Garden",
  "Agriculture",
  "Automotive",
  "Construction",
  "Food & Beverages",
  "Health & Beauty",
  "Office Supplies",
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: supplier, isLoading: supplierLoading } = useQuery<Supplier>({
    queryKey: ["/api/suppliers/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      priceMin: "0",
      priceMax: "0",
      moq: "",
      specifications: {},
      images: [],
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isVerified = supplier?.isVerified === true && supplier?.verificationStatus === "verified";

  const onSubmit = async (data: any) => {
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "You must complete supplier verification before listing products",
        variant: "destructive",
      });
      return;
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("priceMin", data.priceMin);
      formData.append("priceMax", data.priceMax);
      formData.append("moq", data.moq);
      formData.append("specifications", JSON.stringify(data.specifications));

      uploadedImages.forEach((file) => {
        formData.append("images", file);
      });

      const token = localStorage.getItem("token");
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      toast({
        title: "Success",
        description: "Product uploaded successfully",
      });
      form.reset();
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supplier profile creation form
  const supplierForm = useForm<CreateSupplierFormData>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      companyName: "",
      location: "",
      yearsInBusiness: 0,
      categories: [],
      description: "",
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: CreateSupplierFormData) => {
      const res = await apiRequest("POST", "/api/suppliers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers/user", user?.id] });
      toast({
        title: "Success",
        description: "Supplier profile created! Now complete your verification.",
      });
      setLocation("/vendor/verification");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onCreateSupplierProfile = (data: CreateSupplierFormData) => {
    createSupplierMutation.mutate(data);
  };

  if (!user || user.userType !== "supplier") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only suppliers can access the vendor dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (supplierLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show supplier profile creation form if no supplier profile exists
  if (!supplier) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="mb-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h1 className="text-3xl font-bold mb-2">Create Your Supplier Profile</h1>
              <p className="text-muted-foreground">
                Set up your business profile to start selling on MzansiGlobalMarket
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Tell us about your company. This information will be visible to buyers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...supplierForm}>
                  <form onSubmit={supplierForm.handleSubmit(onCreateSupplierProfile)} className="space-y-6">
                    <FormField
                      control={supplierForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., ABC Trading Ltd" 
                              {...field} 
                              data-testid="input-company-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Location *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Johannesburg, South Africa" 
                              {...field} 
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierForm.control}
                      name="yearsInBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              placeholder="e.g., 5" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-years-in-business"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierForm.control}
                      name="categories"
                      render={() => (
                        <FormItem>
                          <FormLabel>Product Categories *</FormLabel>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            {SUPPLIER_CATEGORIES.map((category) => (
                              <FormField
                                key={category}
                                control={supplierForm.control}
                                name="categories"
                                render={({ field }) => (
                                  <FormItem
                                    key={category}
                                    className="flex items-center space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category)}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...(field.value || []), category]
                                            : field.value?.filter((v) => v !== category) || [];
                                          field.onChange(newValue);
                                        }}
                                        data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {category}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell buyers about your company, products, and services..." 
                              rows={4}
                              {...field} 
                              data-testid="input-company-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createSupplierMutation.isPending}
                      data-testid="button-create-supplier-profile"
                    >
                      {createSupplierMutation.isPending ? "Creating Profile..." : "Create Supplier Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const getVerificationStatus = () => {
    switch (supplier.verificationStatus) {
      case "verified":
        return (
          <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Verified Supplier</AlertTitle>
            <AlertDescription>
              Your account is verified. You can list products and receive inquiries.
            </AlertDescription>
          </Alert>
        );
      case "submitted":
        return (
          <Alert className="border-yellow-600 bg-yellow-50 dark:bg-yellow-950">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-600">Verification Pending</AlertTitle>
            <AlertDescription>
              Your documents are being reviewed. This usually takes 1-2 business days.
            </AlertDescription>
          </Alert>
        );
      case "rejected":
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              {supplier.verificationNotes || "Please update your documents and resubmit."}
              <Button 
                variant="ghost" 
                className="p-0 h-auto ml-1 underline"
                onClick={() => setLocation("/vendor/verification")}
              >
                Go to Verification Center
              </Button>
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Complete Your Verification</AlertTitle>
            <AlertDescription>
              To start selling on MzansiGlobalMarket, please complete the verification process.
              <Button 
                variant="ghost" 
                className="p-0 h-auto ml-1 underline"
                onClick={() => setLocation("/vendor/verification")}
                data-testid="link-complete-verification"
              >
                Start Verification
              </Button>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
              {supplier?.isVerified && (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Manage your products and view quote requests</p>
          </div>

          {!supplierLoading && getVerificationStatus()}

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upload New Product</CardTitle>
                  <CardDescription>Add a new product to your catalog</CardDescription>
                </div>
                {!isVerified && !supplierLoading && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="w-3 h-3" /> Verification Required
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isVerified && !supplierLoading && (
                <div className="mb-6 p-4 border border-dashed rounded-lg bg-muted/50 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium mb-1">Verification Required</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete your supplier verification to start listing products on MzansiGlobalMarket.
                  </p>
                  <Button onClick={() => setLocation("/vendor/verification")} data-testid="button-start-verification">
                    Start Verification
                  </Button>
                </div>
              )}
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)} 
                  className={`space-y-6 ${!isVerified && !supplierLoading ? 'pointer-events-none select-none opacity-50' : ''}`}
                  aria-disabled={!isVerified}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wireless Headphones" {...field} data-testid="input-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Product details and features..." {...field} data-testid="input-product-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Machinery">Machinery</SelectItem>
                            <SelectItem value="Textiles">Textiles & Apparel</SelectItem>
                            <SelectItem value="Home">Home & Garden</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} data-testid="input-price-min" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priceMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} data-testid="input-price-max" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="moq"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100 pieces" {...field} data-testid="input-moq" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="mb-3 block">Product Images</FormLabel>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="images"
                        data-testid="input-images"
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">Click to upload images</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB each</p>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                              data-testid={`button-remove-image-${index}`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isVerified || supplierLoading}
                    className="w-full"
                    data-testid="button-submit-product"
                  >
                    {isSubmitting ? "Uploading..." : !isVerified ? "Verification Required" : "Upload Product"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
