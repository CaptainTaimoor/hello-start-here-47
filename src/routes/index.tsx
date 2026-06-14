import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orvion Media — Control Panel" },
      { name: "description", content: "Internal company dashboard and media workflow for Orvion Media." },
      { property: "og:title", content: "Orvion Media — Control Panel" },
      { property: "og:description", content: "Internal company dashboard and media workflow for Orvion Media." },
    ],
  }),
  component: Index,
});

function Index() {
  const { ready, user } = useApp();
  if (!ready) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
