import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

type FooterLinkItem = { name: string; href: string };

const footerLinks: Record<string, FooterLinkItem[]> = {
  "For Buyers": [
    { name: "Find Suppliers", href: "/suppliers" },
    { name: "Request Quotes", href: "/rfq" },
    { name: "Browse Products", href: "/products" },
    { name: "Post RFQ", href: "/rfq" },
  ],
  "For Suppliers": [
    { name: "Become a Supplier", href: "/register" },
    { name: "Supplier Dashboard", href: "/vendor/dashboard" },
    { name: "Verification", href: "/vendor/verification" },
    { name: "Success Stories", href: "/about" },
  ],
  "Support": [
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
    { name: "Help Center", href: "/faq" },
    { name: "Safety & Security", href: "/terms" },
  ],
  "Company": [
    { name: "About Us", href: "/about" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "FAQ", href: "/faq" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-1">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer" data-testid="text-footer-logo">
                MzansiGlobalMarket
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Connecting businesses worldwide with quality suppliers and manufacturers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4" data-testid={`text-footer-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p data-testid="text-copyright">
            © {new Date().getFullYear()} MzansiGlobalMarket B2B Marketplace. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </Link>
            <Link href="/faq" className="hover:text-foreground transition-colors" data-testid="link-faq">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
