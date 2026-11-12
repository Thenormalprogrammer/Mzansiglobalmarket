import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient, getAuthHeaders } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, ChevronRight, FolderTree, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Category } from "@shared/schema";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
}

function CategoryFormDialog({
  category,
  categories,
  isOpen,
  onOpenChange,
  onSuccess,
}: {
  category?: Category;
  categories: Category[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!category;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    parentId: category?.parentId || null,
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  });

  // Reset form when category changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || "",
        slug: category?.slug || "",
        description: category?.description || "",
        parentId: category?.parentId || null,
        sortOrder: category?.sortOrder || 0,
        isActive: category?.isActive ?? true,
      });
    }
  }, [category, isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Success", description: "Category created successfully" });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest("PATCH", `/api/admin/categories/${category!.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Success", description: "Category updated successfully" });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: !isEditing || formData.slug === generateSlug(category?.name || "") 
        ? generateSlug(name) 
        : formData.slug,
    });
  };

  const topLevelCategories = categories.filter(c => c.parentId === null && c.id !== category?.id);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the category details below" : "Create a new category or subcategory"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Electronics"
                required
                data-testid="input-category-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., electronics"
                required
                data-testid="input-category-slug"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Auto-generated from name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category (optional)</Label>
              <Select
                value={formData.parentId?.toString() || "none"}
                onValueChange={(value) => 
                  setFormData({ ...formData, parentId: value === "none" ? null : parseInt(value) })
                }
              >
                <SelectTrigger data-testid="select-parent-category">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-level category)</SelectItem>
                  {topLevelCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leave empty for a main category, or select a parent for a subcategory.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category..."
                rows={3}
                data-testid="input-category-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                data-testid="input-category-sort-order"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-category-active"
              />
              <Label htmlFor="isActive">Active (visible to users)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-category"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({
  category,
  categories,
  subcategories,
  onEdit,
  onDelete,
}: {
  category: Category;
  categories: Category[];
  subcategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg" data-testid={`category-row-${category.id}`}>
      <div className="flex items-center justify-between p-4 bg-card hover-elevate">
        <div className="flex items-center gap-3 flex-1">
          {subcategories.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              data-testid={`button-expand-${category.id}`}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </Button>
          )}
          {subcategories.length === 0 && <div className="w-9" />}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium" data-testid={`text-category-name-${category.id}`}>{category.name}</p>
              {!category.isActive && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">/{category.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {subcategories.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {subcategories.length} subcategories
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
            data-testid={`button-edit-${category.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700"
                data-testid={`button-delete-${category.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  {subcategories.length > 0 
                    ? "This category has subcategories. You must delete all subcategories first."
                    : `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {subcategories.length === 0 && (
                  <AlertDialogAction
                    onClick={() => onDelete(category)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {expanded && subcategories.length > 0 && (
        <div className="pl-12 pr-4 pb-4 space-y-2">
          {subcategories.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
              data-testid={`subcategory-row-${sub.id}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium" data-testid={`text-subcategory-name-${sub.id}`}>{sub.name}</p>
                  {!sub.isActive && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">/{sub.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sub)}
                  data-testid={`button-edit-sub-${sub.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-delete-sub-${sub.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{sub.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(sub)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCategories() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.email === "mzansiglobalmarket@gmail.com";

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const topLevelCategories = categories.filter(c => c.parentId === null);

  const getSubcategories = (parentId: number) => 
    categories.filter(c => c.parentId === parentId);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    deleteMutation.mutate(category.id);
  };

  const handleAddNew = () => {
    setEditingCategory(undefined);
    setFormOpen(true);
  };

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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" data-testid="text-categories-title">
                <FolderTree className="h-8 w-8" />
                Category Management
              </h1>
              <p className="text-muted-foreground">Add, edit, and organize product categories</p>
            </div>
            <Button onClick={handleAddNew} data-testid="button-add-category">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize your products with categories and subcategories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading categories...</p>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No categories yet</p>
                  <Button onClick={handleAddNew} data-testid="button-add-first-category">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Category
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {topLevelCategories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      categories={categories}
                      subcategories={getSubcategories(category.id)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <CategoryFormDialog
            category={editingCategory}
            categories={categories}
            isOpen={formOpen}
            onOpenChange={setFormOpen}
            onSuccess={() => setEditingCategory(undefined)}
          />
        </div>
      </main>
    </div>
  );
}
