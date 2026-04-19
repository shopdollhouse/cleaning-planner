import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

// The Dollhouse Studio app uses localStorage in useState initializers across many
// components, which breaks SSR. Render it client-only to avoid patching each one.
const App = lazy(() => import("@/App"));

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
