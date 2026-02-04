import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export const metadata = {
  title: "HealthCare Portal | Premium Wellness Products",
  description: "Shop premium healthcare products with AI-powered support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}
      >
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}
