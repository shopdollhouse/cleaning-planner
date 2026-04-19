# Deploying to Vercel

## Quick deploy (SPA mode — works as-is)

This repo ships with a `vercel.json` that deploys the built `dist/` output and
rewrites all routes to `index.html`. The app's index route mounts on the client
(`useEffect` + `mounted` guard), so SPA routing works fine on Vercel.

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Vercel will auto-detect `vite build` and `dist/` from `vercel.json`.
4. Done.

## Full SSR with the TanStack Start Vercel preset (manual fork only)

The official TanStack Start Vercel preset CANNOT be enabled inside Lovable
because the editor's preview sandbox depends on `@lovable.dev/vite-tanstack-config`,
which hardcodes the Cloudflare adapter. To run SSR on Vercel, fork the repo
locally and apply these changes **outside Lovable**:

### 1. Replace the Vite config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      target: "vercel", // <-- the Vercel preset
      customViteReactPlugin: true,
    }),
    viteReact(),
  ],
});
```

### 2. Remove the Cloudflare adapter

```bash
npm remove @cloudflare/vite-plugin @lovable.dev/vite-tanstack-config
```

### 3. Delete `wrangler.jsonc` and `vercel.json`

The TanStack Start Vercel preset emits the correct `.vercel/output/` build
artifact directly — no `vercel.json` is needed.

### 4. Deploy

Push to GitHub, import into Vercel, and it will pick up the build automatically.
Server functions and SSR will run on Vercel's serverless runtime.

> Note: Once you do this, the project will no longer preview correctly inside
> Lovable. Keep a Lovable-compatible branch if you want to continue editing here.
