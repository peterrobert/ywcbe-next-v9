import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

const siteDescription =
  "TUC (The Ultimate Collaboration) connects people, ideas, knowledge, and resources so existing efforts can build on what already works.";

export const metadata: Metadata = {
  title: {
    default: "TUC — The Ultimate Collaboration",
    template: "%s | TUC",
  },
  description: siteDescription,
  applicationName: "TUC — The Ultimate Collaboration",
  openGraph: {
    type: "website",
    siteName: "TUC — The Ultimate Collaboration",
    title: "TUC — The Ultimate Collaboration",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * UXPilot iframe bridge.
 *
 * This is intentionally identical in behavior to the script injected by
 * vite.config.ts: install a single message listener, validate the message
 * shape, and inject the parent-provided vh-fix payload only once.
 */
const vhBridge = `(function(){
if (window.__UXP_VH_FIX_BRIDGE__) return;
window.__UXP_VH_FIX_BRIDGE__ = true;
window.addEventListener('message', function(e) {
var d = e.data;
if (!d || d.type !== 'uxpilot:install-vh-fix' || typeof d.payload !== 'string') return;
if (window.__uxpVhFixInjected) return;
window.__uxpVhFixInjected = true;
var s = document.createElement('script');
s.setAttribute('data-uxp', 'vh-fix');
s.textContent = d.payload;
(document.head || document.documentElement).appendChild(s);
});
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: vhBridge }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
