import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { 
  Upload, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Building2, 
  Phone, 
  Mail,
  AlertCircle
} from "lucide-react";
import type { Supplier } from "@shared/schema";

export default function SupplierVerification() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const { data: supplier, isLoading } = useQuery<Supplier>({
    queryKey: ["/api/suppliers/user", user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.id,
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: { contactEmail?: string; contactPhone?: string; whatsappNumber?: string }) => {
      const response = await apiRequest("PATCH", `/api/suppliers/${supplier?.id}/verification`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers/user", user?.id] });
      toast({ title: "Contact details updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ field, file }: { field: string; file: File }) => {
      const formData = new FormData();
      formData.append(field, file);
      
      const response = await fetch(`/api/suppliers/${supplier?.id}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers/user", user?.id] });
      toast({ title: "Document uploaded successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const submitVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/suppliers/${supplier?.id}/submit-verification`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers/user", user?.id] });
      toast({ title: "Verification submitted", description: "Your documents are being reviewed" });
    },
    onError: (error: any) => {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate({ field, file });
    }
  };

  const handleSaveContactDetails = () => {
    updateContactMutation.mutate({
      contactEmail: contactEmail || supplier?.contactEmail || undefined,
      contactPhone: contactPhone || supplier?.contactPhone || undefined,
      whatsappNumber: whatsappNumber || supplier?.whatsappNumber || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>;
      case "submitted":
        return <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Supplier Profile</CardTitle>
              <CardDescription>
                Please create your supplier profile first in the Vendor Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/vendor/dashboard"} data-testid="button-go-vendor">
                Go to Vendor Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const allDocsUploaded = supplier.businessRegistrationDoc && 
    supplier.taxComplianceDoc && 
    supplier.proofOfResidenceDoc && 
    supplier.bankAccountDoc;

  const hasContactDetails = supplier.contactEmail && supplier.contactPhone;

  const canSubmit = allDocsUploaded && hasContactDetails && supplier.verificationStatus === "pending";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Verification Center</h1>
                <p className="text-muted-foreground">
                  Complete your verification to start selling on MzansiGlobalMarket
                </p>
              </div>
              {getStatusBadge(supplier.verificationStatus)}
            </div>
          </div>

          {supplier.verificationStatus === "rejected" && supplier.verificationNotes && (
            <Card className="mb-6 border-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-destructive flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Verification Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{supplier.verificationNotes}</p>
                <p className="mt-2 text-sm">Please update your documents and resubmit.</p>
              </CardContent>
            </Card>
          )}

          {supplier.isVerified && (
            <Card className="mb-6 border-green-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  You're Verified!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your account has been verified. You can now list products and receive inquiries from buyers.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Contact Details
                </CardTitle>
                <CardDescription>
                  Provide your business contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactEmail">Business Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="business@example.com"
                      defaultValue={supplier.contactEmail || ""}
                      onChange={(e) => setContactEmail(e.target.value)}
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      defaultValue={supplier.contactPhone || ""}
                      onChange={(e) => setContactPhone(e.target.value)}
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      defaultValue={supplier.whatsappNumber || ""}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      data-testid="input-whatsapp"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveContactDetails}
                  disabled={updateContactMutation.isPending}
                  data-testid="button-save-contact"
                >
                  {updateContactMutation.isPending ? "Saving..." : "Save Contact Details"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Required Documents
                </CardTitle>
                <CardDescription>
                  Upload the following documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <DocumentUpload
                    label="Business Registration"
                    fieldName="businessRegistration"
                    isUploaded={!!supplier.businessRegistrationDoc}
                    onUpload={(e) => handleFileUpload("businessRegistration", e)}
                    disabled={uploadDocumentMutation.isPending}
                  />
                  <DocumentUpload
                    label="Tax & Compliance Certificate"
                    fieldName="taxCompliance"
                    isUploaded={!!supplier.taxComplianceDoc}
                    onUpload={(e) => handleFileUpload("taxCompliance", e)}
                    disabled={uploadDocumentMutation.isPending}
                  />
                  <DocumentUpload
                    label="Proof of Residence"
                    fieldName="proofOfResidence"
                    isUploaded={!!supplier.proofOfResidenceDoc}
                    onUpload={(e) => handleFileUpload("proofOfResidence", e)}
                    disabled={uploadDocumentMutation.isPending}
                  />
                  <DocumentUpload
                    label="Proof of Bank Account"
                    fieldName="bankAccount"
                    isUploaded={!!supplier.bankAccountDoc}
                    onUpload={(e) => handleFileUpload("bankAccount", e)}
                    disabled={uploadDocumentMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {supplier.verificationStatus === "pending" && (
            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={() => submitVerificationMutation.mutate()}
                disabled={!canSubmit || submitVerificationMutation.isPending}
                data-testid="button-submit-verification"
              >
                {submitVerificationMutation.isPending ? "Submitting..." : "Submit for Verification"}
              </Button>
              {!canSubmit && (
                <p className="text-sm text-muted-foreground mt-2">
                  Complete all sections above to submit for verification
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DocumentUpload({ 
  label, 
  fieldName, 
  isUploaded, 
  onUpload, 
  disabled 
}: { 
  label: string; 
  fieldName: string; 
  isUploaded: boolean; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {isUploaded ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Upload className="w-5 h-5 text-muted-foreground" />
        )}
        <span className={isUploaded ? "text-green-600" : ""}>{label}</span>
      </div>
      <div>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          id={`file-${fieldName}`}
          onChange={onUpload}
          disabled={disabled}
          data-testid={`input-file-${fieldName}`}
        />
        <Label
          htmlFor={`file-${fieldName}`}
          className="cursor-pointer"
        >
          <Button 
            variant={isUploaded ? "outline" : "default"} 
            size="sm" 
            asChild
            disabled={disabled}
          >
            <span data-testid={`button-upload-${fieldName}`}>
              {isUploaded ? "Replace" : "Upload"}
            </span>
          </Button>
        </Label>
      </div>
    </div>
  );
}
