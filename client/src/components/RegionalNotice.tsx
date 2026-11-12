import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

export default function RegionalNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem("regional_notice_dismissed");
    if (hasSeenNotice) {
      setDismissed(true);
      return;
    }

    const checkLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.country_code !== "ZA") {
            setShowNotice(true);
          }
        }
      } catch (error) {
        console.log("Could not determine location");
      }
    };

    checkLocation();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("regional_notice_dismissed", "true");
  };

  if (dismissed || !showNotice) {
    return null;
  }

  return (
    <Alert className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 border-primary bg-primary/5">
      <MapPin className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          South African Marketplace
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            data-testid="button-dismiss-regional-notice"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="text-sm">
          MzansiGlobalMarket currently serves the South African market only. 
          Shipping and delivery are available within South Africa. 
          International shipping is not available at this time.
        </AlertDescription>
      </div>
    </Alert>
  );
}
