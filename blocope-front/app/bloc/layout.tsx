import Sidebar from "@/components/bloc/layout/Sidebar";
import TopBar from "@/components/bloc/layout/TopBar";

export default function BlocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopBar />
        {children}
      </div>
    </div>
  );
}
