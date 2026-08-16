import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoUrl from "@/assets/artiva-logo.jpg";

const STUDIO_EMAIL = "studio@artiva.app";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Artiva Business" },
      { name: "description", content: "Enter the studio password to open Artiva Business." },
      { property: "og:title", content: "Sign in — Artiva Business" },
      { property: "og:description", content: "Enter the studio password to open Artiva Business." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const enter = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: STUDIO_EMAIL,
        password,
      });
      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: STUDIO_EMAIL,
          password,
        });
        if (signUpError) throw new Error("كلمة المرور غير صحيحة");
        const { error: retry } = await supabase.auth.signInWithPassword({
          email: STUDIO_EMAIL,
          password,
        });
        if (retry) throw new Error("كلمة المرور غير صحيحة");
      }
      void navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img
            src={logoUrl}
            alt="Artiva — handmade studio logo"
            className="mx-auto w-56 rounded-3xl shadow-sm"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Your handmade business, beautifully managed.
          </p>
        </div>

        <div className="card-soft space-y-3 p-5">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <Input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void enter();
              }}
              placeholder="••••••••"
            />
          </div>
          <Button className="w-full" disabled={loading || !password} onClick={() => void enter()}>
            Enter
          </Button>
        </div>
      </div>
    </div>
  );
}
