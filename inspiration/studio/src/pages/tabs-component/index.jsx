import { useState } from "react";
import { 
  Sparkles, Layout, Command, Type, Mail, 
  Home, Settings, User, Bell, Search,
  Calendar, FileText, Image, Video, Music,
  Folder, Star, Heart, Bookmark, PanelRight
} from "lucide-react";
import { PillTabs, PillTabsList, PillTabsTrigger, PillTabsContent } from "@/components/ui/pill-tabs";

const TabsComponent = () => {
  const [activeSize, setActiveSize] = useState("md");

  const sizes = [
    { id: "sm", label: "Small" },
    { id: "md", label: "Medium" },
    { id: "lg", label: "Large" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Pill Tabs Component
          </h1>
          <p className="text-muted-foreground">
            A polished, reusable tab component built on Radix UI (ShadCN-compatible) with pill styling.
          </p>
        </div>

        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Size</h2>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSize(s.id)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeSize === s.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="p-8 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Design Approaches (with icons)</h3>
              <PillTabs defaultValue="bloom">
                <PillTabsList size={activeSize}>
                  <PillTabsTrigger value="bloom" size={activeSize} data-testid="tab-bloom">
                    <Sparkles className="w-4 h-4" />
                    Contextual Bloom
                  </PillTabsTrigger>
                  <PillTabsTrigger value="adaptive" size={activeSize} data-testid="tab-adaptive">
                    <Layout className="w-4 h-4" />
                    Adaptive Panel
                  </PillTabsTrigger>
                  <PillTabsTrigger value="tabpanel" size={activeSize} data-testid="tab-tabpanel">
                    <PanelRight className="w-4 h-4" />
                    Tab Panel
                  </PillTabsTrigger>
                  <PillTabsTrigger value="command" size={activeSize} data-testid="tab-command">
                    <Command className="w-4 h-4" />
                    Command Bar
                  </PillTabsTrigger>
                </PillTabsList>
                <PillTabsContent value="bloom" className="p-4 bg-muted/30 rounded-xl mt-4">
                  <p className="text-sm text-muted-foreground">Node expands on canvas, configuration lives in-place</p>
                </PillTabsContent>
                <PillTabsContent value="adaptive" className="p-4 bg-muted/30 rounded-xl mt-4">
                  <p className="text-sm text-muted-foreground">Right sidebar that morphs based on node complexity</p>
                </PillTabsContent>
                <PillTabsContent value="tabpanel" className="p-4 bg-muted/30 rounded-xl mt-4">
                  <p className="text-sm text-muted-foreground">Right sidebar with tabbed navigation from Bloom</p>
                </PillTabsContent>
                <PillTabsContent value="command" className="p-4 bg-muted/30 rounded-xl mt-4">
                  <p className="text-sm text-muted-foreground">Bottom-anchored quick properties bar</p>
                </PillTabsContent>
              </PillTabs>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Node Types</h3>
              <PillTabs defaultValue="form">
                <PillTabsList size={activeSize}>
                  <PillTabsTrigger value="form" size={activeSize}>
                    <Type className="w-4 h-4" />
                    Form Question
                  </PillTabsTrigger>
                  <PillTabsTrigger value="integration" size={activeSize}>
                    <Mail className="w-4 h-4" />
                    Integration
                  </PillTabsTrigger>
                </PillTabsList>
                <PillTabsContent value="form" className="p-4 bg-muted/30 rounded-xl mt-4">
                  <p className="text-sm text-muted-foreground">Simple form field configuration</p>
                </PillTabsContent>
                <PillTabsContent value="integration" className="p-4 bg-muted/30 rounded-xl mt-4">
                  <p className="text-sm text-muted-foreground">Complex integration with Connect → Configure → Test flow</p>
                </PillTabsContent>
              </PillTabs>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Navigation (icons only)</h3>
              <PillTabs defaultValue="home">
                <PillTabsList size={activeSize}>
                  <PillTabsTrigger value="home" size={activeSize} className="px-3">
                    <Home className="w-4 h-4" />
                  </PillTabsTrigger>
                  <PillTabsTrigger value="search" size={activeSize} className="px-3">
                    <Search className="w-4 h-4" />
                  </PillTabsTrigger>
                  <PillTabsTrigger value="notifications" size={activeSize} className="px-3">
                    <Bell className="w-4 h-4" />
                  </PillTabsTrigger>
                  <PillTabsTrigger value="settings" size={activeSize} className="px-3">
                    <Settings className="w-4 h-4" />
                  </PillTabsTrigger>
                  <PillTabsTrigger value="profile" size={activeSize} className="px-3">
                    <User className="w-4 h-4" />
                  </PillTabsTrigger>
                </PillTabsList>
              </PillTabs>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Media Types</h3>
              <PillTabs defaultValue="all">
                <PillTabsList size={activeSize}>
                  <PillTabsTrigger value="all" size={activeSize}>
                    <Folder className="w-4 h-4" />
                    All Files
                  </PillTabsTrigger>
                  <PillTabsTrigger value="images" size={activeSize}>
                    <Image className="w-4 h-4" />
                    Images
                  </PillTabsTrigger>
                  <PillTabsTrigger value="videos" size={activeSize}>
                    <Video className="w-4 h-4" />
                    Videos
                  </PillTabsTrigger>
                  <PillTabsTrigger value="audio" size={activeSize}>
                    <Music className="w-4 h-4" />
                    Audio
                  </PillTabsTrigger>
                  <PillTabsTrigger value="documents" size={activeSize}>
                    <FileText className="w-4 h-4" />
                    Documents
                  </PillTabsTrigger>
                </PillTabsList>
              </PillTabs>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Text Only</h3>
              <PillTabs defaultValue="overview">
                <PillTabsList size={activeSize}>
                  <PillTabsTrigger value="overview" size={activeSize}>Overview</PillTabsTrigger>
                  <PillTabsTrigger value="analytics" size={activeSize}>Analytics</PillTabsTrigger>
                  <PillTabsTrigger value="reports" size={activeSize}>Reports</PillTabsTrigger>
                  <PillTabsTrigger value="notifications" size={activeSize}>Notifications</PillTabsTrigger>
                </PillTabsList>
              </PillTabs>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Full Width</h3>
              <PillTabs defaultValue="favorites" className="w-full">
                <PillTabsList size={activeSize} className="w-full">
                  <PillTabsTrigger value="all" size={activeSize} className="flex-1">
                    <Folder className="w-4 h-4" />
                    All
                  </PillTabsTrigger>
                  <PillTabsTrigger value="favorites" size={activeSize} className="flex-1">
                    <Star className="w-4 h-4" />
                    Favorites
                  </PillTabsTrigger>
                  <PillTabsTrigger value="liked" size={activeSize} className="flex-1">
                    <Heart className="w-4 h-4" />
                    Liked
                  </PillTabsTrigger>
                  <PillTabsTrigger value="saved" size={activeSize} className="flex-1">
                    <Bookmark className="w-4 h-4" />
                    Saved
                  </PillTabsTrigger>
                </PillTabsList>
              </PillTabs>
            </div>
          </section>

          <section className="p-8 bg-muted/30 rounded-2xl border border-border">
            <h3 className="text-lg font-semibold mb-4">Usage</h3>
            <pre className="bg-card p-4 rounded-xl border border-border overflow-x-auto text-sm">
{`import { PillTabs, PillTabsList, PillTabsTrigger, PillTabsContent } from "@/components/ui/pill-tabs"

<PillTabs defaultValue="tab1">
  <PillTabsList size="${activeSize}">
    <PillTabsTrigger value="tab1" size="${activeSize}">
      <Icon className="w-4 h-4" />
      Tab 1
    </PillTabsTrigger>
    <PillTabsTrigger value="tab2" size="${activeSize}">
      Tab 2
    </PillTabsTrigger>
  </PillTabsList>
  <PillTabsContent value="tab1">
    Content for tab 1
  </PillTabsContent>
  <PillTabsContent value="tab2">
    Content for tab 2
  </PillTabsContent>
</PillTabs>`}
            </pre>
          </section>

          <section className="p-8 bg-muted/30 rounded-2xl border border-border">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Built on Radix UI Tabs (same as ShadCN)</li>
              <li>✓ Full keyboard navigation (arrow keys, Home, End)</li>
              <li>✓ Accessible with proper ARIA attributes</li>
              <li>✓ Focus ring for keyboard users</li>
              <li>✓ Three sizes: sm, md, lg</li>
              <li>✓ Works with icons, text, or both</li>
              <li>✓ Supports full-width layout with flex-1</li>
              <li>✓ Smooth transitions and hover states</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TabsComponent;

