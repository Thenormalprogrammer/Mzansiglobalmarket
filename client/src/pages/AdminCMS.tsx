import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff, 
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import type { CmsPage, FaqItem } from "@shared/schema";

function CmsPageEditor({ page, onSave, isSaving }: { 
  page?: CmsPage; 
  onSave: (data: Partial<CmsPage>) => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(page?.title || "");
  const [content, setContent] = useState(page?.content || "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || "");
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? true);

  const handleSave = () => {
    onSave({
      title,
      content,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      isPublished,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="page-title">Page Title</Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title"
          data-testid="input-cms-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="page-content">Content (HTML supported)</Label>
        <Textarea
          id="page-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter page content. HTML tags are supported for formatting."
          className="min-h-[300px] font-mono text-sm"
          data-testid="input-cms-content"
        />
        <p className="text-xs text-muted-foreground">
          Supported HTML tags: &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">SEO Settings</h4>
        <div className="space-y-2">
          <Label htmlFor="meta-title">Meta Title (for search engines)</Label>
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Page Title | MzansiGlobalMarket"
            data-testid="input-cms-meta-title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta Description</Label>
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief description for search results"
            className="h-20"
            data-testid="input-cms-meta-description"
          />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="is-published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
            data-testid="switch-cms-published"
          />
          <Label htmlFor="is-published" className="flex items-center gap-1">
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isPublished ? "Published" : "Draft"}
          </Label>
        </div>

        <Button onClick={handleSave} disabled={isSaving || !title || !content} data-testid="button-save-cms">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Page"}
        </Button>
      </div>
    </div>
  );
}

function FaqManager() {
  const { toast } = useToast();
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const { data: faqs = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; category?: string }) => {
      const res = await apiRequest("POST", "/api/admin/faq", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      setNewQuestion("");
      setNewAnswer("");
      setNewCategory("");
      toast({ title: "FAQ Created", description: "The FAQ item has been added successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FaqItem> }) => {
      const res = await apiRequest("PATCH", `/api/admin/faq/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      setEditingFaq(null);
      toast({ title: "FAQ Updated", description: "The FAQ item has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "FAQ Deleted", description: "The FAQ item has been removed." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleCreateFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    createMutation.mutate({
      question: newQuestion,
      answer: newAnswer,
      category: newCategory || undefined,
    });
  };

  const handleUpdateOrder = (faqId: number, direction: "up" | "down") => {
    const faq = faqs.find(f => f.id === faqId);
    if (!faq) return;
    const newOrder = direction === "up" ? faq.sortOrder - 1 : faq.sortOrder + 1;
    updateMutation.mutate({ id: faqId, data: { sortOrder: newOrder } });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter the frequently asked question"
              data-testid="input-faq-question"
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter the answer"
              className="min-h-[100px]"
              data-testid="input-faq-answer"
            />
          </div>
          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g., Payments, Shipping, Account"
              data-testid="input-faq-category"
            />
          </div>
          <Button 
            onClick={handleCreateFaq} 
            disabled={createMutation.isPending || !newQuestion.trim() || !newAnswer.trim()}
            data-testid="button-add-faq"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Existing FAQs ({faqs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="text-muted-foreground">No FAQ items yet. Add your first question above.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className="border rounded-lg p-4"
                  data-testid={`faq-item-${faq.id}`}
                >
                  {editingFaq?.id === faq.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        data-testid={`input-edit-faq-question-${faq.id}`}
                      />
                      <Textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        className="min-h-[80px]"
                        data-testid={`input-edit-faq-answer-${faq.id}`}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateMutation.mutate({ id: faq.id, data: editingFaq })}
                          disabled={updateMutation.isPending}
                          data-testid={`button-save-faq-${faq.id}`}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingFaq(null)}
                          data-testid={`button-cancel-edit-faq-${faq.id}`}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4 text-primary" />
                            <h4 className="font-medium">{faq.question}</h4>
                            {faq.category && (
                              <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                            )}
                            {!faq.isPublished && (
                              <Badge variant="outline" className="text-xs">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleUpdateOrder(faq.id, "up")}
                            disabled={index === 0}
                            data-testid={`button-faq-up-${faq.id}`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleUpdateOrder(faq.id, "down")}
                            disabled={index === faqs.length - 1}
                            data-testid={`button-faq-down-${faq.id}`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setEditingFaq(faq)}
                            data-testid={`button-edit-faq-${faq.id}`}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(faq.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-faq-${faq.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const DEFAULT_PAGES = [
  { slug: "terms", title: "Terms & Conditions", description: "Legal terms for using the platform" },
  { slug: "privacy", title: "Privacy Policy", description: "How user data is collected and used" },
  { slug: "about", title: "About Us", description: "Information about MzansiGlobalMarket" },
];

export default function AdminCMS() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("terms");
  const [isCreating, setIsCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  const isAdmin = user?.email === "mzansiglobalmarket@gmail.com";

  const { data: pages = [], isLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/admin/cms"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { slug: string; title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/admin/cms", data);
      return res.json();
    },
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      setActiveTab(newPage.slug);
      setIsCreating(false);
      setNewSlug("");
      toast({ title: "Page Created", description: "The new page has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<CmsPage> }) => {
      const res = await apiRequest("PATCH", `/api/admin/cms/${slug}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      toast({ title: "Page Saved", description: "Your changes have been saved successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await apiRequest("DELETE", `/api/admin/cms/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      setActiveTab("terms");
      toast({ title: "Page Deleted", description: "The page has been removed." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleSavePage = (slug: string, data: Partial<CmsPage>) => {
    const existingPage = pages.find(p => p.slug === slug);
    if (existingPage) {
      updateMutation.mutate({ slug, data });
    } else {
      const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
      createMutation.mutate({
        slug,
        title: data.title || defaultPage?.title || slug,
        content: data.content || "",
        ...data,
      });
    }
  };

  const handleCreateNewPage = () => {
    if (!newSlug.trim()) return;
    const cleanSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    createMutation.mutate({
      slug: cleanSlug,
      title: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1).replace(/-/g, " "),
      content: "<p>Enter your content here...</p>",
    });
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

  const allTabs = [
    ...DEFAULT_PAGES,
    ...pages.filter(p => !DEFAULT_PAGES.some(dp => dp.slug === p.slug)).map(p => ({
      slug: p.slug,
      title: p.title,
      description: "Custom page",
    })),
    { slug: "faq", title: "FAQ Manager", description: "Frequently asked questions" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="sm" data-testid="link-back-to-admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Content Management</h1>
            <p className="text-muted-foreground">
              Edit website pages, terms, privacy policy, and FAQs
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <TabsList className="flex-wrap h-auto gap-1">
                {allTabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.slug} 
                    value={tab.slug}
                    className="gap-1"
                    data-testid={`tab-cms-${tab.slug}`}
                  >
                    <FileText className="w-3 h-3" />
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCreating(true)}
                data-testid="button-new-page"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Page
              </Button>
            </div>

            {isCreating && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Create New Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      placeholder="page-slug (e.g., shipping-policy)"
                      data-testid="input-new-page-slug"
                    />
                    <Button 
                      onClick={handleCreateNewPage}
                      disabled={createMutation.isPending || !newSlug.trim()}
                      data-testid="button-create-page"
                    >
                      Create
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => { setIsCreating(false); setNewSlug(""); }}
                      data-testid="button-cancel-new-page"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {allTabs.filter(t => t.slug !== "faq").map((tab) => {
              const page = pages.find(p => p.slug === tab.slug);
              return (
                <TabsContent key={tab.slug} value={tab.slug}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <CardTitle>{tab.title}</CardTitle>
                          <CardDescription>{tab.description}</CardDescription>
                        </div>
                        {page && !DEFAULT_PAGES.some(dp => dp.slug === tab.slug) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(tab.slug)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-page-${tab.slug}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Page
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CmsPageEditor
                        page={page}
                        onSave={(data) => handleSavePage(tab.slug, data)}
                        isSaving={updateMutation.isPending || createMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}

            <TabsContent value="faq">
              <FaqManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
