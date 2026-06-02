"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, type Role } from "@/lib/auth";

export function AuthGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useAuth((s) => s.session);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!session) {
      router.replace("/login");
    } else if (session.role !== role) {
      router.replace(session.role === "walletiz" ? "/walletiz" : "/admin");
    }
  }, [mounted, session, role, router]);

  if (!mounted) return null;
  if (!session || session.role !== role) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <p className="text-sm text-neutral-500">Redirection...</p>
      </div>
    );
  }
  return <>{children}</>;
}
