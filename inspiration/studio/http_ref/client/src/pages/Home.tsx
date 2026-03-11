import { HttpRequestNode } from "@/components/http-node/HttpRequestNode";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-8 font-sans">
      {/* Drawer Simulator */}
      <div className="w-[52.6rem] h-[85vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border/40 ring-1 ring-black/5 relative">
        {/* Backdrop for realism */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 pointer-events-none" />
        
        {/* Actual Node Config Content */}
        <HttpRequestNode />
      </div>
      
      {/* Context Label */}
      <div className="fixed bottom-6 left-6 text-slate-400 text-xs font-mono">
        Viewing: HTTP Request Node Configuration<br/>
        Context: Drawer (52.6rem width)
      </div>
    </div>
  );
}
