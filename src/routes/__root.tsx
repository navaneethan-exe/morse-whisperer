import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MorseLab — Modern Morse Code Translator" },
      { name: "description", content: "Bidirectional Morse code translator with realtime audio playback, history, and favorites." },
      { name: "author", content: "MorseLab" },
      { property: "og:title", content: "MorseLab — Modern Morse Code Translator" },
      { property: "og:description", content: "Bidirectional Morse code translator with realtime audio playback, history, and favorites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "MorseLab — Modern Morse Code Translator" },
      { name: "twitter:description", content: "Bidirectional Morse code translator with realtime audio playback, history, and favorites." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7e05c3e7-b32d-4b56-9f4c-d441132da536/id-preview-7f490005--63bf8f7b-8680-4455-91ba-6eb2ea4b6b7f.lovable.app-1776841153053.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7e05c3e7-b32d-4b56-9f4c-d441132da536/id-preview-7f490005--63bf8f7b-8680-4455-91ba-6eb2ea4b6b7f.lovable.app-1776841153053.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </PreferencesProvider>
  );
}
