import { useState } from "react";
import { setAdminAuth } from "@/lib/store";
import { Lock } from "lucide-react";

interface Props {
  onLogin: () => void;
}

const ADMIN_EMAIL = "admin@menu.com";
const ADMIN_PASS = "admin123";

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setAdminAuth(true);
      onLogin();
    } else {
      setError("Email ou senha incorretos");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-card">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-center text-xl font-bold text-foreground mb-1">Painel Administrativo</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">Acesse para gerenciar seu cardápio</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="Email"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Senha"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo: admin@menu.com / admin123
        </p>
      </div>
    </div>
  );
}
