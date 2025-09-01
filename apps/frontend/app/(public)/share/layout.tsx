import { ThemeProvider } from "@/components/ThemeProvider";

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  );
}