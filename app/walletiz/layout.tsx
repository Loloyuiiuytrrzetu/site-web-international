import type { Metadata } from "next";
import { WalletizShell } from "./_components/WalletizShell";

export const metadata: Metadata = {
  title: "Walletiz — Super admin",
  description: "Console de gestion Walletiz.",
};

export default function WalletizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletizShell>{children}</WalletizShell>;
}
