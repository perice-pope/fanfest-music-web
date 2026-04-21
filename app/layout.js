import "./globals.css";
import ChatProvider from "@/components/ChatProvider";

export const metadata = {
  title: "FanFest — Where fans and artists connect",
  description:
    "FanFest is a membership community where fans and artists meet. Connect your Spotify, chat with the community, and never miss a drop.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-text font-sans antialiased selection:bg-brand/20 selection:text-brand-700">
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
