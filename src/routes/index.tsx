import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Artiva Business — Handmade studio manager" },
      {
        name: "description",
        content:
          "Manage crochet, ceramics and painting orders, materials, costs and profit in one calm workspace.",
      },
      { property: "og:title", content: "Artiva Business — Handmade studio manager" },
      {
        property: "og:description",
        content: "Orders, materials, pricing and profit for your handmade business.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
