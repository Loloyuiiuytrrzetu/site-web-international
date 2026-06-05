import type { Metadata } from "next";
import { WalletizShell } from "./_components/WalletizShell";
import { AuthGate } from "../components/AuthGate";
import { WalletizDataLoader } from "../components/WalletizDataLoader";

export const metadata: Metadata = {
  title: "Walletiz — Super admin",
  description: "Console de gestion Walletiz.",
};

export default function WalletizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate role="walletiz">
      <WalletizDataLoader>
        <WalletizShell>{children}</WalletizShell>
      </WalletizDataLoader>
    </AuthGate>
  );
}
