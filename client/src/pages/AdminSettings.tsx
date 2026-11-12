import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Upload, Image, Save, ArrowLeft, Loader2, Trash2, Type } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient, getAuthHeaders } from "@/lib/queryClient";

interface CategoryImage {
  id: string;
  name: string;
  image: string;
}

interface HeroText {
  title: string;
  subtitle: string;
}

interface SiteSettings {
  heroImage?: string;
  categoryImages?: CategoryImage[];
  heroText?: HeroText;
}

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const heroInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const isAdmin = user?.email === "mzansiglobalmarket@gmail.com";

  // Hero text state
  const [heroTitle, setHeroTitle] = useState("Find Quality Suppliers Worldwide");
  const [heroSubtitle, setHeroSubtitle] = useState("Connect with verified manufacturers and get competitive quotes");

  const { data: heroSetting } = useQuery({
    queryKey: ["/api/settings", "hero_image"],
    enabled: isAdmin,
  });

  const { data: categorySetting } = useQuery({
    queryKey: ["/api/settings", "category_images"],
    enabled: isAdmin,
  });

  const { data: heroTextSetting } = useQuery({
    queryKey: ["/api/settings", "hero_text"],
    enabled: isAdmin,
  });

  // Update local state when hero text setting loads
  useEffect(() => {
    if (heroTextSetting) {
      const textValue = (heroTextSetting as any)?.value;
      if (textValue?.title) setHeroTitle(textValue.title);
      if (textValue?.subtitle) setHeroSubtitle(textValue.subtitle);
    }
  }, [heroTextSetting]);

  const heroImage = (heroSetting as any)?.value?.url || "";
  const categoryImages: CategoryImage[] = (categorySetting as any)?.value || [
    { id: "1", name: "Electronics & Technology", image: "" },
    { id: "2", name: "Machinery & Equipment", image: "" },
    { id: "3", name: "Textiles & Apparel", image: "" },
    { id: "4", name: "Home & Garden", image: "" },
    { id: "5", name: "Auto Parts & Accessories", image: "" },
    { id: "6", name: "Chemicals & Materials", image: "" },
    { id: "7", name: "Packaging & Printing", image: "" },
    { id: "8", name: "Construction & Building", image: "" },
  ];

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/admin/settings/upload", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
  });

  const saveHeroMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return apiRequest("PUT", "/api/admin/settings/hero_image", { value: { url: imageUrl } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings", "hero_image"] });
      toast({ title: "Success", description: "Hero image updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save hero image", variant: "destructive" });
    },
  });

  const saveCategoriesMutation = useMutation({
    mutationFn: async (categories: CategoryImage[]) => {
      return apiRequest("PUT", "/api/admin/settings/category_images", { value: categories });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings", "category_images"] });
      toast({ title: "Success", description: "Category images updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save category images", variant: "destructive" });
    },
  });

  const saveHeroTextMutation = useMutation({
    mutationFn: async (heroText: HeroText) => {
      return apiRequest("PUT", "/api/admin/settings/hero_text", { value: heroText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings", "hero_text"] });
      toast({ title: "Success", description: "Hero text updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save hero text", variant: "destructive" });
    },
  });

  const handleSaveHeroText = () => {
    saveHeroTextMutation.mutate({ title: heroTitle, subtitle: heroSubtitle });
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMutation.mutateAsync(file);
      await saveHeroMutation.mutateAsync(result.path);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    }
  };

  const handleCategoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategoryId) return;

    try {
      const result = await uploadMutation.mutateAsync(file);
      const updatedCategories = categoryImages.map((cat) =>
        cat.id === selectedCategoryId ? { ...cat, image: result.path } : cat
      );
      await saveCategoriesMutation.mutateAsync(updatedCategories);
      setSelectedCategoryId(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-settings-title">Site Settings</h1>
              <p className="text-muted-foreground mt-1">Manage homepage images and content</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/admin/dashboard")} data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid gap-6">
            {/* Hero Text Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Hero Text
                </CardTitle>
                <CardDescription>
                  Customize the title and subtitle shown above the search bar on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Title</Label>
                  <Input
                    id="heroTitle"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Find Quality Suppliers Worldwide"
                    data-testid="input-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Connect with verified manufacturers and get competitive quotes"
                    rows={2}
                    data-testid="input-hero-subtitle"
                  />
                </div>
                <Button 
                  onClick={handleSaveHeroText}
                  disabled={saveHeroTextMutation.isPending}
                  data-testid="button-save-hero-text"
                >
                  {saveHeroTextMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Hero Text
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Hero Background Image
                </CardTitle>
                <CardDescription>
                  The main background image shown in the search section at the top of the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-64 h-40 bg-muted rounded-lg overflow-hidden">
                    {heroImage ? (
                      <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image set
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={heroInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroUpload}
                      className="hidden"
                      data-testid="input-hero-upload"
                    />
                    <Button
                      onClick={() => heroInputRef.current?.click()}
                      disabled={uploadMutation.isPending || saveHeroMutation.isPending}
                      data-testid="button-upload-hero"
                    >
                      {uploadMutation.isPending || saveHeroMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload New Image
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Recommended: 1920x600 pixels, JPEG or PNG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Category Images
                </CardTitle>
                <CardDescription>
                  Images for each product category shown on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={categoryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryUpload}
                  className="hidden"
                  data-testid="input-category-upload"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categoryImages.map((category) => (
                    <div key={category.id} className="border rounded-lg p-3">
                      <div className="aspect-[4/3] bg-muted rounded overflow-hidden mb-2">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-2 truncate" title={category.name}>
                        {category.name}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          categoryInputRef.current?.click();
                        }}
                        disabled={uploadMutation.isPending || saveCategoriesMutation.isPending}
                        data-testid={`button-upload-category-${category.id}`}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Change
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
