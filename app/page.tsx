import { LoginForm } from "@/components/auth/LoginForm";
import { CircuitBackground } from "@/components/ui/CircuitBackground";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative select-none">
      {/* Immersive background with circuits */}
      <CircuitBackground />

      {/* Main Content */}
      <LoginForm />

      {/* Corner accents for the "almost full screen card" feeling */}
      <div className="fixed top-0 left-0 w-full h-full border-[20px] border-black pointer-events-none z-30 opacity-50" />
      
      {/* Decorative vertical lines on sides */}
      <div className="fixed left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-azur-red/20 to-transparent" />
      <div className="fixed right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-azur-red/20 to-transparent" />
    </main>
  );
}
