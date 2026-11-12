import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, MessageSquare, Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Supplier } from "@shared/schema";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier;
  receiverId: number;
  contactName: string;
}

export default function ContactModal({
  open,
  onOpenChange,
  supplier,
  receiverId,
  contactName,
}: ContactModalProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [contactMethod, setContactMethod] = useState<"message" | "email" | "whatsapp">("message");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number; subject: string; message: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully", description: "The supplier will receive an email notification" });
      setSubject("");
      setMessage("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    sendMessageMutation.mutate({
      receiverId,
      subject,
      message,
    });
  };

  const handleEmailContact = () => {
    if (!supplier.contactEmail) {
      toast({ title: "Email not available", description: "This supplier hasn't provided an email address", variant: "destructive" });
      return;
    }
    const emailSubject = encodeURIComponent(`Inquiry from MzansiGlobalMarket: ${subject || "Product Inquiry"}`);
    const emailBody = encodeURIComponent(`Hi ${contactName},\n\nI found your business on MzansiGlobalMarket and would like to inquire about your products.\n\n${message || ""}\n\nBest regards`);
    window.open(`mailto:${supplier.contactEmail}?subject=${emailSubject}&body=${emailBody}`, "_blank");
    onOpenChange(false);
  };

  const handleWhatsAppContact = () => {
    if (!supplier.whatsappNumber) {
      toast({ title: "WhatsApp not available", description: "This supplier hasn't provided a WhatsApp number", variant: "destructive" });
      return;
    }
    const cleanNumber = supplier.whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappMessage = encodeURIComponent(
      `Hi ${contactName}, I found your business through MzansiGlobalMarket and I'm interested in your products.\n\n${message || "I would like to learn more about what you offer."}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${whatsappMessage}`, "_blank");
    onOpenChange(false);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              Please sign in to contact this supplier
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => window.location.href = "/login"} data-testid="button-login-contact">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/register"} data-testid="button-register-contact">
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact {supplier.companyName}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to get in touch with this supplier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <RadioGroup
            value={contactMethod}
            onValueChange={(v) => setContactMethod(v as "message" | "email" | "whatsapp")}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="message" id="message" className="peer sr-only" />
              <Label
                htmlFor="message"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                data-testid="option-message"
              >
                <MessageSquare className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">Website</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="email" id="email" className="peer sr-only" disabled={!supplier.contactEmail} />
              <Label
                htmlFor="email"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${!supplier.contactEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid="option-email"
              >
                <Mail className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">Email</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="whatsapp" id="whatsapp" className="peer sr-only" disabled={!supplier.whatsappNumber} />
              <Label
                htmlFor="whatsapp"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${!supplier.whatsappNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid="option-whatsapp"
              >
                <SiWhatsapp className="mb-2 h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">WhatsApp</span>
              </Label>
            </div>
          </RadioGroup>

          {contactMethod === "message" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Inquiry about your products"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="input-subject"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  data-testid="input-message"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                The supplier will receive an email notification about your message
              </p>
            </div>
          )}

          {contactMethod === "email" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-subject">Subject (optional)</Label>
                <Input
                  id="email-subject"
                  placeholder="e.g., Product inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="input-email-subject"
                />
              </div>
              <div>
                <Label htmlFor="email-message">Message (optional)</Label>
                <Textarea
                  id="email-message"
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  data-testid="input-email-message"
                />
              </div>
              <Button className="w-full" onClick={handleEmailContact} data-testid="button-send-email">
                <Mail className="w-4 h-4 mr-2" />
                Open Email Client
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This will open your default email application
              </p>
            </div>
          )}

          {contactMethod === "whatsapp" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp-message">Message (optional)</Label>
                <Textarea
                  id="whatsapp-message"
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  data-testid="input-whatsapp-message"
                />
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={handleWhatsAppContact}
                data-testid="button-send-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4 mr-2" />
                Open WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your message will mention that you found them on MzansiGlobalMarket
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
