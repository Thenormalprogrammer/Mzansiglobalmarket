import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calculator, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const calculatorSchema = z.object({
  hsCode: z.string().min(4, "Enter at least 4 digits of the HS code"),
  declaredValue: z.string().min(1, "Enter the declared value").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Enter a valid positive number"
  ),
  freightCost: z.string().optional(),
  insuranceCost: z.string().optional(),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

type CalculationResult = {
  declaredValue: number;
  freightCost: number;
  insuranceCost: number;
  cifValue: number;
  dutyRate: number;
  customsDuty: number;
  surchargeRate: number;
  surcharge: number;
  vatRate: number;
  vat: number;
  totalLandedCost: number;
  tariffDescription: string;
};

export default function CustomsCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      hsCode: "",
      declaredValue: "",
      freightCost: "",
      insuranceCost: "",
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculatorFormData) => {
      const response = await fetch("/api/customs/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hsCode: data.hsCode,
          declaredValue: parseFloat(data.declaredValue),
          freightCost: parseFloat(data.freightCost || "0"),
          insuranceCost: parseFloat(data.insuranceCost || "0"),
        }),
      });
      if (!response.ok) throw new Error("Calculation failed");
      return response.json() as Promise<CalculationResult>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: CalculatorFormData) => {
    calculateMutation.mutate(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">South African Customs Calculator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estimate import duties, VAT, and total landed cost for goods imported into South Africa
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Calculator Form */}
            <Card>
              <CardHeader>
                <CardTitle>Calculate Import Costs</CardTitle>
                <CardDescription>
                  Enter the details of your import to estimate duties and taxes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="hsCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            HS Code
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>The Harmonized System code classifies goods for customs. Ask your supplier or search SARS for the correct code.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 8471.30"
                              data-testid="input-hs-code"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the first 4-8 digits of the HS tariff code
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="declaredValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Declared Value (ZAR)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>The transaction value of the goods as shown on the commercial invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              data-testid="input-declared-value"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="freightCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Freight/Shipping Cost (ZAR)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              data-testid="input-freight-cost"
                            />
                          </FormControl>
                          <FormDescription>
                            Cost of shipping to South Africa (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Cost (ZAR)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              data-testid="input-insurance-cost"
                            />
                          </FormControl>
                          <FormDescription>
                            Insurance for the shipment (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={calculateMutation.isPending}
                      data-testid="button-calculate"
                    >
                      {calculateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Calculate Import Costs
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {result ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Estimated Import Costs</CardTitle>
                    <CardDescription>{result.tariffDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Declared Value</span>
                        <span data-testid="result-declared-value">{formatCurrency(result.declaredValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Freight Cost</span>
                        <span data-testid="result-freight-cost">{formatCurrency(result.freightCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurance</span>
                        <span data-testid="result-insurance-cost">{formatCurrency(result.insuranceCost)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>CIF Value</span>
                        <span data-testid="result-cif-value">{formatCurrency(result.cifValue)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customs Duty ({result.dutyRate}%)</span>
                        <span data-testid="result-customs-duty">{formatCurrency(result.customsDuty)}</span>
                      </div>
                      {result.surcharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Surcharge ({result.surchargeRate}%)</span>
                          <span data-testid="result-surcharge">{formatCurrency(result.surcharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">VAT ({result.vatRate}%)</span>
                        <span data-testid="result-vat">{formatCurrency(result.vat)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Landed Cost</span>
                      <span className="text-primary" data-testid="result-total-cost">{formatCurrency(result.totalLandedCost)}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Enter your import details to see estimated costs
                    </p>
                  </CardContent>
                </Card>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription className="text-sm">
                  This calculator provides estimates only. Actual duties and taxes may vary based on 
                  current tariff rates, trade agreements, and SARS assessments. Consult a licensed 
                  customs broker for accurate calculations.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Help Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Understanding Import Costs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-semibold mb-2">CIF Value</h3>
                <p className="text-sm text-muted-foreground">
                  Cost, Insurance, and Freight - the total value used to calculate duties. 
                  It includes the product cost, shipping, and insurance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Customs Duty</h3>
                <p className="text-sm text-muted-foreground">
                  A tax on imports based on the HS code classification. Rates vary from 0% to 45% 
                  depending on the product category.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Value Added Tax (VAT)</h3>
                <p className="text-sm text-muted-foreground">
                  South Africa's VAT rate is 15%. It's calculated on the CIF value plus 
                  customs duty and any applicable surcharges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
