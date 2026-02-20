import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";
import { SubHeader } from "./sub-header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <TabBar />
          <SubHeader />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
