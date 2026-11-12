import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, KeyRound, Check } from "lucide-react";

type Step = "email" | "code" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Check Your Email",
          description: "If an account exists with this email, you will receive a reset code.",
        });
        setStep("code");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Your password has been reset successfully!",
        });
        setStep("success");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleRequestReset} className="space-y-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a code to reset your password.
        </p>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="input-reset-email"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        data-testid="button-send-code"
      >
        {isLoading ? "Sending..." : "Send Reset Code"}
      </Button>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to <strong>{email}</strong> and your new password.
        </p>
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-2">
          Reset Code
        </label>
        <Input
          id="code"
          type="text"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
          className="text-center text-lg tracking-widest"
          data-testid="input-reset-code"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
          New Password
        </label>
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
          data-testid="input-new-password"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
          data-testid="input-confirm-password"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || code.length !== 6}
        data-testid="button-reset-password"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setStep("email")}
        data-testid="button-back-to-email"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Email
      </Button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Password Reset Complete!</h3>
      <p className="text-sm text-muted-foreground">
        Your password has been successfully reset. You can now login with your new password.
      </p>
      <Button
        className="w-full"
        onClick={() => setLocation("/login")}
        data-testid="button-go-to-login"
      >
        Go to Login
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {step === "success" ? "Success!" : "Forgot Password"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Reset your MzansiGlobalMarket password"}
            {step === "code" && "Enter your reset code"}
            {step === "success" && "Your password has been updated"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && renderEmailStep()}
          {step === "code" && renderCodeStep()}
          {step === "success" && renderSuccessStep()}
          
          {step !== "success" && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-primary hover:underline"
                data-testid="link-back-to-login"
              >
                Back to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
