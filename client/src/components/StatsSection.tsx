import { CheckCircle2, Users, Package, Globe } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Verified Suppliers",
    description: "Rigorously vetted manufacturers",
  },
  {
    icon: Package,
    value: "5 Million+",
    label: "Products Listed",
    description: "Across all major categories",
  },
  {
    icon: Globe,
    value: "180+",
    label: "Countries Served",
    description: "Global marketplace reach",
  },
  {
    icon: CheckCircle2,
    value: "98%",
    label: "Satisfaction Rate",
    description: "From verified buyers",
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" data-testid="text-stats-title">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-lg opacity-90" data-testid="text-stats-subtitle">
            Join thousands of companies sourcing quality products through our platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
              data-testid={`stat-${index}`}
            >
              <stat.icon className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-bold mb-2" data-testid={`text-stat-value-${index}`}>
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-1" data-testid={`text-stat-label-${index}`}>
                {stat.label}
              </div>
              <div className="text-sm opacity-80" data-testid={`text-stat-desc-${index}`}>
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
