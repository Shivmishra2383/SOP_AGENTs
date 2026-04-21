
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: 'OPSMIND_AI | AI-Powered SOP Assistant',
  description: 'Transform your static SOP documents into interactive knowledge with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storedTheme = localStorage.getItem("theme");
                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = storedTheme === "dark" || storedTheme === "light"
                    ? storedTheme
                    : (prefersDark ? "dark" : "light");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body">
        <ReduxProvider>
          {children}
          <ThemeToggle />
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
