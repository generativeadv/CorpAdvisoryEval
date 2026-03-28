import Link from "next/link";
import { BarChart3, Grid3X3, Users, FileText } from "lucide-react";

const COMPARE_LINKS = [
  {
    href: "/compare/matrix",
    icon: Grid3X3,
    title: "Summary Matrix",
    description: "All firms ranked by maturity, score, and confidence",
  },
  {
    href: "/compare/heatmap",
    icon: BarChart3,
    title: "Dimension Heatmap",
    description: "22 firms x 10 dimensions, color-coded comparison",
  },
  {
    href: "/compare/archetypes",
    icon: Users,
    title: "Archetype Classification",
    description:
      "Firms grouped by strategic AI posture: Builders, Positioners, Acquirers, Lagging",
  },
  {
    href: "/compare/findings",
    icon: FileText,
    title: "Key Findings",
    description: "Board-ready narrative observations from cross-firm analysis",
  },
];

export default function ComparePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cross-Firm Comparison</h1>
        <p className="text-muted-foreground mt-1">
          Comparative analysis across all evaluated firms
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPARE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-start gap-3">
              <link.icon size={24} className="text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">{link.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
