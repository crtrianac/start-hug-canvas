import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 overflow-auto bg-muted/30 p-4">
        {children}
      </main>
    </div>
  );
}
