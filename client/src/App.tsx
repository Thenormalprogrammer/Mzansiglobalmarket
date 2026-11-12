import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import ProductCatalog from "@/pages/ProductCatalog";
import SupplierDirectory from "@/pages/SupplierDirectory";
import SupplierProfile from "@/pages/SupplierProfile";
import SupplierVerification from "@/pages/SupplierVerification";
import SubmitRFQ from "@/pages/SubmitRFQ";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import VendorDashboard from "@/pages/VendorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCMS from "@/pages/AdminCMS";
import AdminSettings from "@/pages/AdminSettings";
import AdminModeration from "@/pages/AdminModeration";
import AdminCategories from "@/pages/AdminCategories";
import ContactUs from "@/pages/ContactUs";
import CmsPage from "@/pages/CmsPage";
import MyAccount from "@/pages/MyAccount";
import CustomsCalculator from "@/pages/CustomsCalculator";
import NotFound from "@/pages/not-found";
import RegionalNotice from "@/components/RegionalNotice";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/products" component={ProductCatalog} />
      <Route path="/suppliers" component={SupplierDirectory} />
      <Route path="/suppliers/:id" component={SupplierProfile} />
      <Route path="/rfq" component={SubmitRFQ} />
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/vendor/verification" component={SupplierVerification} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cms" component={AdminCMS} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/account" component={MyAccount} />
      <Route path="/customs-calculator" component={CustomsCalculator} />
      <Route path="/page/:slug">{() => <CmsPage />}</Route>
      <Route path="/terms">{() => <CmsPage slug="terms" />}</Route>
      <Route path="/privacy">{() => <CmsPage slug="privacy" />}</Route>
      <Route path="/about">{() => <CmsPage slug="about" />}</Route>
      <Route path="/faq">{() => <CmsPage slug="faq" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <RegionalNotice />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
