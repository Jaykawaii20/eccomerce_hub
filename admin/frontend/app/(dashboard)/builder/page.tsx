'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  Save,
  Check,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Megaphone,
  Navigation,
  Image,
  Star,
  ShoppingBag,
  Tag,
  Gift,
  MessageSquare,
  Mail,
  FootprintsIcon,
  Settings2,
  ExternalLink,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionConfig {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  props: Record<string, unknown>;
}

interface GlobalStyles {
  primaryColor: string;
  storeName: string;
  logoText: string;
}

interface PageConfig {
  globalStyles: GlobalStyles;
  sections: SectionConfig[];
}

type SectionType =
  | 'announcement'
  | 'navbar'
  | 'hero'
  | 'features'
  | 'featured-categories'
  | 'featured-products'
  | 'promo-banner'
  | 'testimonials'
  | 'newsletter'
  | 'footer';

// ─── Section metadata ─────────────────────────────────────────────────────────

interface SectionMeta {
  type: SectionType;
  label: string;
  icon: React.ElementType;
  description: string;
  canAdd: boolean;
}

const SECTION_META: SectionMeta[] = [
  { type: 'announcement', label: 'Announcement Bar', icon: Megaphone, description: 'Top banner with promotional text', canAdd: false },
  { type: 'navbar', label: 'Navigation Bar', icon: Navigation, description: 'Header with logo and links', canAdd: false },
  { type: 'hero', label: 'Hero Banner', icon: Image, description: 'Full-width banner with CTA', canAdd: false },
  { type: 'features', label: 'Features', icon: Star, description: 'Highlight key store features', canAdd: false },
  { type: 'featured-categories', label: 'Categories Grid', icon: Tag, description: 'Display product categories', canAdd: false },
  { type: 'featured-products', label: 'Featured Products', icon: ShoppingBag, description: 'Showcase top products', canAdd: false },
  { type: 'promo-banner', label: 'Promo Banner', icon: Gift, description: 'Sale or promotional banner', canAdd: true },
  { type: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'Customer reviews', canAdd: false },
  { type: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Email subscription form', canAdd: false },
  { type: 'footer', label: 'Footer', icon: FootprintsIcon, description: 'Links and copyright', canAdd: false },
];

function getMeta(type: SectionType): SectionMeta {
  return SECTION_META.find((m) => m.type === type) ?? SECTION_META[0];
}

// ─── Property Editors ─────────────────────────────────────────────────────────

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm" />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value ?? '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 rounded border border-input cursor-pointer p-0.5"
        />
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm flex-1 font-mono"
        />
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Section property panels ──────────────────────────────────────────────────

function PropsPanel({
  section,
  onChange,
}: {
  section: SectionConfig;
  onChange: (props: Record<string, unknown>) => void;
}) {
  const p = section.props;

  function set(key: string, value: unknown) {
    onChange({ ...p, [key]: value });
  }

  switch (section.type) {
    case 'announcement':
      return (
        <div className="space-y-3">
          <TextField label="Text" value={p['text'] as string} onChange={(v) => set('text', v)} />
          <TextField label="Link (optional)" value={p['link'] as string} onChange={(v) => set('link', v)} />
          <ColorField label="Background Color" value={p['backgroundColor'] as string} onChange={(v) => set('backgroundColor', v)} />
          <ColorField label="Text Color" value={p['textColor'] as string} onChange={(v) => set('textColor', v)} />
        </div>
      );

    case 'navbar':
      return (
        <div className="space-y-3">
          <TextField label="Logo Text" value={p['logoText'] as string} onChange={(v) => set('logoText', v)} />
          <ColorField label="Background Color" value={p['backgroundColor'] as string} onChange={(v) => set('backgroundColor', v)} />
          <ColorField label="Text Color" value={p['textColor'] as string} onChange={(v) => set('textColor', v)} />
          <ToggleField label="Show Search" value={p['showSearch'] as boolean} onChange={(v) => set('showSearch', v)} />
          <ToggleField label="Show Cart" value={p['showCart'] as boolean} onChange={(v) => set('showCart', v)} />
        </div>
      );

    case 'hero':
      return (
        <div className="space-y-3">
          <TextField label="Headline" value={p['headline'] as string} onChange={(v) => set('headline', v)} />
          <TextField label="Subheadline" value={p['subheadline'] as string} onChange={(v) => set('subheadline', v)} />
          <TextField label="Button Text" value={p['buttonText'] as string} onChange={(v) => set('buttonText', v)} />
          <TextField label="Button Link" value={p['buttonLink'] as string} onChange={(v) => set('buttonLink', v)} />
          <TextField label="Secondary Button Text" value={p['buttonSecondaryText'] as string} onChange={(v) => set('buttonSecondaryText', v)} />
          <TextField label="Background Image URL" value={p['backgroundImage'] as string} onChange={(v) => set('backgroundImage', v)} />
          <ColorField label="Background Color" value={p['backgroundColor'] as string} onChange={(v) => set('backgroundColor', v)} />
          <ColorField label="Text Color" value={p['textColor'] as string} onChange={(v) => set('textColor', v)} />
          <ToggleField label="Dark Overlay" value={p['overlay'] as boolean} onChange={(v) => set('overlay', v)} />
        </div>
      );

    case 'features':
      return (
        <div className="space-y-3">
          <TextField label="Section Title" value={p['title'] as string} onChange={(v) => set('title', v)} />
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Feature items can be customized via the API. Default items are shown automatically.
          </p>
        </div>
      );

    case 'featured-categories':
      return (
        <div className="space-y-3">
          <TextField label="Title" value={p['title'] as string} onChange={(v) => set('title', v)} />
          <TextField label="Subtitle" value={p['subtitle'] as string} onChange={(v) => set('subtitle', v)} />
        </div>
      );

    case 'featured-products':
      return (
        <div className="space-y-3">
          <TextField label="Title" value={p['title'] as string} onChange={(v) => set('title', v)} />
          <TextField label="Subtitle" value={p['subtitle'] as string} onChange={(v) => set('subtitle', v)} />
          <ToggleField label="Show Discount Badge" value={p['showBadge'] as boolean} onChange={(v) => set('showBadge', v)} />
        </div>
      );

    case 'promo-banner':
      return (
        <div className="space-y-3">
          <TextField label="Headline" value={p['headline'] as string} onChange={(v) => set('headline', v)} />
          <TextField label="Subheadline" value={p['subheadline'] as string} onChange={(v) => set('subheadline', v)} />
          <TextField label="Button Text" value={p['buttonText'] as string} onChange={(v) => set('buttonText', v)} />
          <TextField label="Button Link" value={p['buttonLink'] as string} onChange={(v) => set('buttonLink', v)} />
          <ColorField label="Background Color" value={p['backgroundColor'] as string} onChange={(v) => set('backgroundColor', v)} />
          <ColorField label="Text Color" value={p['textColor'] as string} onChange={(v) => set('textColor', v)} />
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-3">
          <TextField label="Section Title" value={p['title'] as string} onChange={(v) => set('title', v)} />
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Testimonial items can be edited via the settings API. Up to 3 items shown.
          </p>
        </div>
      );

    case 'newsletter':
      return (
        <div className="space-y-3">
          <TextField label="Title" value={p['title'] as string} onChange={(v) => set('title', v)} />
          <TextField label="Subtitle" value={p['subtitle'] as string} onChange={(v) => set('subtitle', v)} />
          <TextField label="Button Text" value={p['buttonText'] as string} onChange={(v) => set('buttonText', v)} />
          <TextField label="Placeholder" value={p['placeholder'] as string} onChange={(v) => set('placeholder', v)} />
          <ColorField label="Background Color" value={p['backgroundColor'] as string} onChange={(v) => set('backgroundColor', v)} />
          <ColorField label="Text Color" value={p['textColor'] as string} onChange={(v) => set('textColor', v)} />
        </div>
      );

    case 'footer':
      return (
        <div className="space-y-3">
          <TextField label="Logo Text" value={p['logoText'] as string} onChange={(v) => set('logoText', v)} />
          <TextField label="Tagline" value={p['tagline'] as string} onChange={(v) => set('tagline', v)} />
          <TextField label="Copyright Text" value={p['copyright'] as string} onChange={(v) => set('copyright', v)} />
          <ColorField label="Background Color" value={p['backgroundColor'] as string} onChange={(v) => set('backgroundColor', v)} />
          <ColorField label="Text Color" value={p['textColor'] as string} onChange={(v) => set('textColor', v)} />
        </div>
      );

    default:
      return <p className="text-xs text-muted-foreground">No properties available.</p>;
  }
}

// ─── Main Builder Page ────────────────────────────────────────────────────────

export default function BuilderPage() {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ data: PageConfig }>('/page-builder');
      setConfig(data.data);
      if (data.data.sections.length > 0) {
        setSelectedId(data.data.sections[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      await apiClient.post('/page-builder', config);
      setSaved(true);
      setPreviewKey((k) => k + 1); // increment triggers a single iframe reload
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    if (!config) return;
    const sorted = [...config.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;

    // Swap orders
    const updated = sorted.map((s, i) => {
      if (i === idx) return { ...s, order: sorted[newIdx].order };
      if (i === newIdx) return { ...s, order: sorted[idx].order };
      return s;
    });
    setConfig({ ...config, sections: updated });
  }

  function toggleSection(id: string) {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    });
  }

  function updateSectionProps(id: string, props: Record<string, unknown>) {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) => (s.id === id ? { ...s, props } : s)),
    });
  }

  function updateGlobalStyle(key: keyof GlobalStyles, value: string) {
    if (!config) return;
    setConfig({ ...config, globalStyles: { ...config.globalStyles, [key]: value } });
  }

  const sortedSections = config?.sections.slice().sort((a, b) => a.order - b.order) ?? [];
  const selectedSection = config?.sections.find((s) => s.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="flex gap-4 h-full">
        <div className="w-72 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="w-72">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">Page Builder</h1>
          <span className="text-xs text-muted-foreground ml-1">Storefront Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="/store" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-1.5" />
              Preview
              <ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
            </a>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                {saving ? 'Saving…' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Section list */}
        <div className="w-64 border-r flex flex-col overflow-hidden bg-muted/20">
          <div className="px-4 py-3 border-b bg-background">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {sortedSections.map((section, idx) => {
              const meta = getMeta(section.type);
              const Icon = meta.icon;
              const isSelected = section.id === selectedId;

              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedId(section.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isSelected ? '' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{meta.label}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                      disabled={idx === 0}
                      className={`p-0.5 rounded hover:bg-black/10 disabled:opacity-30 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                      disabled={idx === sortedSections.length - 1}
                      className={`p-0.5 rounded hover:bg-black/10 disabled:opacity-30 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="shrink-0 scale-75"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>

          {/* Global Styles */}
          <div className="border-t px-4 py-3 bg-background space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Global</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Store Name</Label>
              <Input
                value={config.globalStyles.storeName}
                onChange={(e) => updateGlobalStyle('storeName', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.globalStyles.primaryColor}
                  onChange={(e) => updateGlobalStyle('primaryColor', e.target.value)}
                  className="h-8 w-10 rounded border border-input p-0.5 cursor-pointer"
                />
                <Input
                  value={config.globalStyles.primaryColor}
                  onChange={(e) => updateGlobalStyle('primaryColor', e.target.value)}
                  className="h-8 text-sm font-mono flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel — Live Preview */}
        <div className="flex-1 overflow-hidden flex flex-col bg-muted/30">
          <div className="px-4 py-2 border-b bg-background flex items-center gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-muted rounded px-3 py-1 text-xs text-muted-foreground font-mono truncate">
              localhost:3000/store
            </div>
            <a
              href="/store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex-1 overflow-hidden">
            <iframe
              src={`/store?preview=${previewKey}`}
              className="w-full h-full border-0"
              title="Storefront Preview"
              key={previewKey}
            />
          </div>
        </div>

        {/* Right Panel — Properties */}
        <div className="w-72 border-l flex flex-col overflow-hidden bg-background">
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Properties
            </p>
          </div>

          {selectedSection ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4">
                {/* Section header */}
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const meta = getMeta(selectedSection.type);
                    const Icon = meta.icon;
                    return (
                      <>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{meta.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Visibility toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
                  <Label className="text-sm font-medium">Section Visible</Label>
                  <Switch
                    checked={selectedSection.enabled}
                    onCheckedChange={() => toggleSection(selectedSection.id)}
                  />
                </div>

                <Separator className="mb-4" />

                {/* Props editor */}
                <PropsPanel
                  section={selectedSection}
                  onChange={(props) => updateSectionProps(selectedSection.id, props)}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <Settings2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a section from the left to edit its properties.</p>
              </div>
            </div>
          )}

          {/* Add section */}
          <div className="border-t px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Add Section
            </p>
            <div className="space-y-1">
              {SECTION_META.filter((m) => m.canAdd).map((meta) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={meta.type}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      if (!config) return;
                      const newSection: SectionConfig = {
                        id: `${meta.type}-${Date.now()}`,
                        type: meta.type,
                        enabled: true,
                        order: config.sections.length,
                        props: {},
                      };
                      setConfig({ ...config, sections: [...config.sections, newSection] });
                      setSelectedId(newSection.id);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
