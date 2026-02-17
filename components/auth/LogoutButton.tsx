"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { clearAllLocalData } from "@/lib/db/pwa-db";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearAllLocalData();
    await logout();
    router.push("/");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-slate-400 hover:text-white hover:bg-red-600 gap-2 font-bold transition-all px-4 h-10 rounded-xl"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Salir
    </Button>
  );
}
