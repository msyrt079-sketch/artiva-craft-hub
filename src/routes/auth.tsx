import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Artiva Business" },
      { name: "description", content: "Secure admin login for the Artiva Business manager." },
      { property: "og:title", content: "Sign in — Artiva Business" },
      { property: "og:description", content: "Secure admin login for the Artiva Business manager." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handle = async (mode: "in" | "up") => {
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        void navigate({ to: "/dashboard" });
      }
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
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground">
            A
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold">ARTIVA BUSINESS</h1>
          <p className="text-sm text-muted-foreground">Your handmade business, beautifully managed.</p>
        </div>

        <div className="card-soft p-5">
          <Tabs defaultValue="in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="in">Sign in</TabsTrigger>
              <TabsTrigger value="up">Create account</TabsTrigger>
            </TabsList>
            {(["in", "up"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="space-y-3 pt-4">
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@artiva.com"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button className="w-full" disabled={loading} onClick={() => void handle(mode)}>
                  {mode === "in" ? "Sign in" : "Create account"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
