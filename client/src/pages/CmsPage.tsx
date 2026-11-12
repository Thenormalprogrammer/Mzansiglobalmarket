import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { HelpCircle, Loader2 } from "lucide-react";
import type { CmsPage as CmsPageType, FaqItem } from "@shared/schema";

interface CmsPageProps {
  slug?: string;
}

export default function CmsPage({ slug: propSlug }: CmsPageProps) {
  const params = useParams<{ slug: string }>();
  const slug = propSlug || params.slug;

  const isFaqPage = slug === "faq";

  const { data: page, isLoading: pageLoading, error: pageError } = useQuery<CmsPageType>({
    queryKey: ["/api/cms", slug],
    queryFn: async () => {
      const res = await fetch(`/api/cms/${slug}`);
      if (!res.ok) {
        throw new Error("Page not found");
      }
      return res.json();
    },
    enabled: !isFaqPage && !!slug,
  });

  const { data: faqs = [], isLoading: faqsLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isFaqPage,
  });

  const isLoading = isFaqPage ? faqsLoading : pageLoading;

  if (!slug) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Page not specified</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isFaqPage && (pageError || !page)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground">The requested page could not be found.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isFaqPage) {
    const groupedFaqs = faqs.reduce((acc, faq) => {
      const category = faq.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FaqItem[]>);

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h1 className="text-3xl font-bold mb-4" data-testid="text-faq-title">
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about MzansiGlobalMarket
              </p>
            </div>

            {faqs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No FAQs available at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                  <div key={category}>
                    {Object.keys(groupedFaqs).length > 1 && (
                      <h2 className="text-xl font-semibold mb-4" data-testid={`text-faq-category-${category}`}>
                        {category}
                      </h2>
                    )}
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFaqs.map((faq) => (
                        <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                          <AccordionTrigger 
                            className="text-left"
                            data-testid={`accordion-faq-${faq.id}`}
                          >
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground" data-testid={`text-faq-answer-${faq.id}`}>
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-8" data-testid="text-cms-title">
            {page?.title}
          </h1>
          <Card>
            <CardContent className="py-8">
              <div 
                className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: page?.content || "" }}
                data-testid="text-cms-content"
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
