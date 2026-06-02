import type { Metadata } from "next";
import { AdminShell } from "./_components/AdminShell";
import { AuthGate } from "../components/AuthGate";

export const metadata: Metadata = {
  title: "Walletiz — Dashboard restaurateur",
  description: "Gérez votre menu digital Walletiz.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="restaurateur">
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
