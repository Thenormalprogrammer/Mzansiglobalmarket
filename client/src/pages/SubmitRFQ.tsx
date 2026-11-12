import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RFQForm from "@/components/RFQForm";

export default function SubmitRFQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-rfq-page-title">
              Request for Quotation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-rfq-page-subtitle">
              Tell us what you need and receive competitive quotes from verified suppliers within 24 hours
            </p>
          </div>

          <RFQForm />

          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center" data-testid="text-how-it-works">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2" data-testid="text-step-1-title">Submit Your Request</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-step-1-desc">
                  Fill out the RFQ form with your product requirements and specifications
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2" data-testid="text-step-2-title">Receive Quotes</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-step-2-desc">
                  Get competitive quotes from multiple verified suppliers within 24 hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2" data-testid="text-step-3-title">Compare & Choose</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-step-3-desc">
                  Review proposals, communicate with suppliers, and select the best option
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
