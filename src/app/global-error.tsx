"use client";

import Link from "next/link";

/**
 * Last-resort boundary for errors thrown in the root layout. Next.js replaces
 * the whole document when this renders, so it must supply <html> and <body>
 * and cannot rely on the app's global stylesheet; the TUC palette is applied
 * inline instead.
 */
const GlobalError = ({ retry }: { error: unknown; retry: () => void }) => {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#FBFAF7",
          color: "#141414",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        <title>Something went wrong | TUC</title>
        <main
          style={{
            width: "100%",
            maxWidth: "640px",
            boxSizing: "border-box",
            border: "3px solid #141414",
            borderRadius: "2px",
            background: "#FFFFFF",
            padding: "32px",
            textAlign: "center",
            boxShadow: "6px 6px 0 0 #141414",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#595959",
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              margin: "16px 0 0",
              fontSize: "clamp(32px, 7vw, 56px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            TUC couldn&apos;t load.
          </h1>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "#595959",
            }}
          >
            A problem interrupted the application. Try again, or return to the
            TUC landing page.
          </p>
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => retry()}
              style={{
                border: "2px solid #141414",
                borderRadius: "2px",
                background: "#FFFFFF",
                color: "#141414",
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                border: "2px solid #141414",
                borderRadius: "2px",
                background: "#141414",
                color: "#FBFAF7",
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Back to TUC
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
