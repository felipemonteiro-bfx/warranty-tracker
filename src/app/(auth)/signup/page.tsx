import { AuthForm } from "@/components/shared/AuthForm";
import { ShieldCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Guardião.</h1>
        </div>

        <AuthForm type="signup" />

        <p className="text-center text-sm font-bold text-slate-400">
          Crie sua titularidade digital hoje.
        </p>
      </div>
    </div>
  );
}