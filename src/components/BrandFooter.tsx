import { memo } from 'react';
import { Globe, Store, Zap, ArrowRight } from 'lucide-react';
import PrivacyShield from '@/components/PrivacyShield';
import { BRAND_LINKS, BRAND_NAME, LEGAL_NOTICE } from '@/config/brand';

const PRODUCT_LINKS = [
  {
    title: 'Official Website',
    subtitle: 'Explore the full brand',
    description: 'Discover all Dollhouse products & digital tools',
    icon: Globe,
    href: BRAND_LINKS.officialWebsite,
    color: 'hsl(210 50% 75%)',
    bgColor: 'hsl(210 50% 75% / 0.1)',
  },
  {
    title: 'Etsy Shop',
    subtitle: 'Interactive apps & resources',
    description: 'Digital templates, checklists & planning tools',
    icon: Store,
    href: BRAND_LINKS.interactiveApps,
    color: 'hsl(45 60% 75%)',
    bgColor: 'hsl(45 60% 75% / 0.1)',
  },
  {
    title: 'Stan Store',
    subtitle: 'Business & course tools',
    description: 'Courses, coaching & business resources',
    icon: Zap,
    href: BRAND_LINKS.businessTools,
    color: 'hsl(270 35% 75%)',
    bgColor: 'hsl(270 35% 75% / 0.1)',
  },
];

const BrandFooter = memo(function BrandFooter() {
  return (
    <footer className="pt-16 pb-8" aria-label="Brand and legal information">
      {/* Product Links Section */}
      <div className="mb-12">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.22em] font-sans text-muted-foreground mb-2">Explore More</p>
          <h3 className="text-lg font-display font-semibold text-foreground">
            The Dollhouse Ecosystem
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
          {PRODUCT_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  background: link.bgColor,
                  border: `1px solid ${link.color}40`,
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: link.color, color: '#fff' }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-display font-semibold leading-tight text-foreground">
                      {link.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{link.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-3 leading-relaxed">
                  {link.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2" style={{ color: link.color }}>
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
      </div>

      {/* Bottom Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2">
          <PrivacyShield />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-sans font-semibold text-foreground">
            {BRAND_NAME} — ADHD Cleaning Planner
          </p>
          <p className="text-[10px] leading-relaxed font-sans text-muted-foreground/70">
            {LEGAL_NOTICE}
          </p>
        </div>
      </div>
    </footer>
  );
});

export default BrandFooter;
