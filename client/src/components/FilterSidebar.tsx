import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    certifications: true,
    location: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="w-full lg:w-64 bg-card border border-card-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" data-testid="text-filters-title">Filters</h3>
        <Button variant="ghost" size="sm" data-testid="button-clear-filters">
          Clear All
        </Button>
      </div>

      <Separator />

      <Collapsible open={openSections.category}>
        <CollapsibleTrigger
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full"
          data-testid="button-toggle-category"
        >
          <span className="font-medium">Category</span>
          {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          {["Electronics", "Machinery", "Textiles", "Home & Garden"].map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox id={cat} data-testid={`checkbox-category-${cat.toLowerCase().replace(/\s+/g, '-')}`} />
              <Label htmlFor={cat} className="text-sm cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible open={openSections.price}>
        <CollapsibleTrigger
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full"
          data-testid="button-toggle-price"
        >
          <span className="font-medium">Price Range</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
            data-testid="slider-price"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span data-testid="text-price-min">${priceRange[0]}</span>
            <span data-testid="text-price-max">${priceRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible open={openSections.certifications}>
        <CollapsibleTrigger
          onClick={() => toggleSection("certifications")}
          className="flex items-center justify-between w-full"
          data-testid="button-toggle-certifications"
        >
          <span className="font-medium">Certifications</span>
          {openSections.certifications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          {["ISO 9001", "CE Certified", "FDA Approved", "RoHS Compliant"].map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox id={cert} data-testid={`checkbox-cert-${cert.toLowerCase().replace(/\s+/g, '-')}`} />
              <Label htmlFor={cert} className="text-sm cursor-pointer">
                {cert}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible open={openSections.location}>
        <CollapsibleTrigger
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full"
          data-testid="button-toggle-location"
        >
          <span className="font-medium">Supplier Location</span>
          {openSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          {["China", "India", "USA", "Germany", "Vietnam"].map((loc) => (
            <div key={loc} className="flex items-center space-x-2">
              <Checkbox id={loc} data-testid={`checkbox-location-${loc.toLowerCase()}`} />
              <Label htmlFor={loc} className="text-sm cursor-pointer">
                {loc}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
