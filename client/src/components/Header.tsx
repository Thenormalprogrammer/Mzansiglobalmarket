import { useState } from "react";
import { Search, ShoppingCart, MessageSquare, User, ChevronDown, Menu, LogOut, X, Home, Users, FileText, Package, Calculator, UserCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import logoImg from "@assets/MGM 2_1764159628233.png";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-card border-b border-card-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-menu">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logoImg} alt="Logo" className="h-8 w-auto" />
                    MzansiGlobalMarket
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo("/")}
                    data-testid="mobile-link-home"
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo("/products")}
                    data-testid="mobile-link-products"
                  >
                    <Package className="w-4 h-4 mr-3" />
                    Products
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo("/suppliers")}
                    data-testid="mobile-link-suppliers"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Suppliers
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo("/rfq")}
                    data-testid="mobile-link-rfq"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Submit RFQ
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo("/customs-calculator")}
                    data-testid="mobile-link-customs"
                  >
                    <Calculator className="w-4 h-4 mr-3" />
                    Customs Calculator
                  </Button>
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigateTo("/account")}
                      data-testid="mobile-link-account"
                    >
                      <UserCircle className="w-4 h-4 mr-3" />
                      My Account
                    </Button>
                  )}
                  <div className="my-4 border-t" />
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-10"
                      data-testid="mobile-input-search"
                    />
                  </div>
                  {!isAuthenticated && (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => navigateTo("/login")}
                        data-testid="mobile-link-login"
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => navigateTo("/register")}
                        data-testid="mobile-link-register"
                      >
                        Register
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              data-testid="logo-button"
            >
              <img
                src={logoImg}
                alt="MzansiGlobalMarket"
                className="h-12 w-auto"
                data-testid="img-logo"
              />
              <span className="hidden sm:inline text-lg font-bold text-primary" data-testid="text-logo">
                MzansiGlobalMarket
              </span>
            </button>
            <nav className="hidden lg:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-categories">
                    Categories <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem data-testid="link-category-electronics">Electronics</DropdownMenuItem>
                  <DropdownMenuItem data-testid="link-category-machinery">Machinery</DropdownMenuItem>
                  <DropdownMenuItem data-testid="link-category-textiles">Textiles & Apparel</DropdownMenuItem>
                  <DropdownMenuItem data-testid="link-category-home">Home & Garden</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/suppliers")}
                data-testid="link-suppliers"
              >
                Suppliers
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/rfq")}
                data-testid="link-rfq"
              >
                Submit RFQ
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/customs-calculator")}
                data-testid="link-customs-calculator"
              >
                <Calculator className="w-4 h-4 mr-1" />
                Customs
              </Button>
            </nav>
          </div>

          <div className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products, suppliers..."
                className="pl-10 pr-4"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-messages">
              <MessageSquare className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-cart">
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-account">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium" data-testid="text-username">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.userType}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setLocation("/account")}
                      data-testid="link-my-account"
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      My Account
                    </DropdownMenuItem>
                    {user.userType === "supplier" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => setLocation("/vendor/dashboard")}
                          data-testid="link-vendor-dashboard"
                        >
                          Vendor Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setLocation("/vendor/verification")}
                          data-testid="link-verification"
                        >
                          Verification Center
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.email === "mzansiglobalmarket@gmail.com" && (
                      <DropdownMenuItem
                        onClick={() => setLocation("/admin/dashboard")}
                        data-testid="link-admin-dashboard"
                      >
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => setLocation("/login")}
                      data-testid="link-login"
                    >
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLocation("/register")}
                      data-testid="link-register"
                    >
                      Register
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
