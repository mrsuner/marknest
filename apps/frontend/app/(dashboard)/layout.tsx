import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard - MarkNest",
  description: "Your Markdown workspace dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </ThemeProvider>
  );
}