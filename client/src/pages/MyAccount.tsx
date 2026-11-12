import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Mail, Phone, CheckCircle, XCircle, Clock, History, Package, MessageSquare, Loader2 } from "lucide-react";
import type { Product, RFQ, Message } from "@shared/schema";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof updateProfileSchema>;

type UserProfile = {
  id: number;
  email: string;
  name: string;
  userType: string;
  phone: string | null;
  isEmailVerified: boolean;
  verificationCodeExpiry: string | null;
};

type BrowsingHistoryItem = Product & {
  lastViewedAt: string;
  viewCount: number;
};

export default function MyAccount() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: isAuthenticated,
  });

  const { data: browsingHistory, isLoading: historyLoading } = useQuery<BrowsingHistoryItem[]>({
    queryKey: ["/api/user/browsing-history"],
    enabled: isAuthenticated,
  });

  const { data: rfqs, isLoading: rfqsLoading } = useQuery<RFQ[]>({
    queryKey: ["/api/rfqs"],
    enabled: isAuthenticated && user?.userType === "buyer",
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  });

  // Reset form when profile loads
  if (profile && form.getValues("name") !== profile.name) {
    form.reset({
      name: profile.name || "",
      phone: profile.phone || "",
    });
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/send-verification");
    },
    onSuccess: () => {
      setIsVerifying(true);
      toast({ title: "Code Sent", description: "Check your email for the verification code" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send verification code", variant: "destructive" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/auth/verify-email", { code });
    },
    onSuccess: () => {
      setIsVerifying(false);
      setVerificationCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({ title: "Success", description: "Email verified successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Invalid or expired verification code", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access your account</p>
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your profile and view your activity</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex gap-1">
              <TabsTrigger value="profile" data-testid="tab-profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="rfqs" data-testid="tab-rfqs">
                <Package className="w-4 h-4 mr-2" />
                RFQs
              </TabsTrigger>
              <TabsTrigger value="messages" data-testid="tab-messages">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="+27 XX XXX XXXX"
                                    data-testid="input-phone"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            data-testid="button-update-profile"
                          >
                            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>

                {/* Email Verification Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Verification
                    </CardTitle>
                    <CardDescription>Verify your email address for enhanced security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : profile?.isEmailVerified ? (
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-400">Email Verified</p>
                          <p className="text-sm text-green-600 dark:text-green-500">{profile.email}</p>
                        </div>
                      </div>
                    ) : isVerifying ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <Clock className="w-8 h-8 text-amber-600" />
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-400">Enter Verification Code</p>
                            <p className="text-sm text-amber-600 dark:text-amber-500">Check your email for the 6-digit code</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            data-testid="input-verification-code"
                          />
                          <Button
                            onClick={() => verifyEmailMutation.mutate(verificationCode)}
                            disabled={verificationCode.length !== 6 || verifyEmailMutation.isPending}
                            data-testid="button-verify-code"
                          >
                            {verifyEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendVerificationMutation.mutate()}
                          disabled={sendVerificationMutation.isPending}
                          data-testid="button-resend-code"
                        >
                          Resend Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <XCircle className="w-8 h-8 text-amber-600" />
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-400">Email Not Verified</p>
                            <p className="text-sm text-amber-600 dark:text-amber-500">{profile?.email}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => sendVerificationMutation.mutate()}
                          disabled={sendVerificationMutation.isPending}
                          data-testid="button-send-verification"
                        >
                          {sendVerificationMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Send Verification Code
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Info Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profileLoading ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium" data-testid="text-email">{profile?.email}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Account Type</p>
                          <Badge variant="secondary" data-testid="badge-user-type">
                            {profile?.userType === "buyer" ? "Buyer" : profile?.userType === "supplier" ? "Supplier" : profile?.userType}
                          </Badge>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium" data-testid="text-phone">{profile?.phone || "Not provided"}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Browsing History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recently Viewed Products
                  </CardTitle>
                  <CardDescription>Products you've viewed recently</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                      ))}
                    </div>
                  ) : browsingHistory && browsingHistory.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {browsingHistory.map((product) => (
                        <a
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="block border rounded-lg overflow-hidden hover-elevate transition-all"
                          data-testid={`card-history-product-${product.id}`}
                        >
                          <div className="aspect-video bg-muted relative">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">From R{product.priceMin}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Viewed {product.viewCount} times
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No browsing history yet</p>
                      <Button asChild className="mt-4">
                        <a href="/products">Browse Products</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RFQs Tab */}
            <TabsContent value="rfqs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    My RFQ Submissions
                  </CardTitle>
                  <CardDescription>Request for quotations you've submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  {rfqsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : rfqs && rfqs.length > 0 ? (
                    <div className="space-y-4">
                      {rfqs.map((rfq) => (
                        <div
                          key={rfq.id}
                          className="p-4 border rounded-lg hover-elevate transition-all"
                          data-testid={`card-rfq-${rfq.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{rfq.productName}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{rfq.specifications || rfq.category}</p>
                            </div>
                            <Badge
                              variant={
                                rfq.status === "open" ? "default" :
                                rfq.status === "closed" ? "secondary" : "outline"
                              }
                            >
                              {rfq.status}
                            </Badge>
                          </div>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Qty: {rfq.quantity}</span>
                            {rfq.targetPrice && <span>Target: R{rfq.targetPrice}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No RFQs submitted yet</p>
                      <Button asChild className="mt-4">
                        <a href="/submit-rfq">Submit an RFQ</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messages
                  </CardTitle>
                  <CardDescription>Your conversations with suppliers and buyers</CardDescription>
                </CardHeader>
                <CardContent>
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.slice(0, 10).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 border rounded-lg ${!msg.isRead ? 'bg-primary/5' : ''}`}
                          data-testid={`card-message-${msg.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{msg.subject}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                            </div>
                            {!msg.isRead && <Badge variant="default" className="ml-2">New</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
