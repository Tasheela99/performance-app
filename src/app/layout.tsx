import { AppraisalProvider } from "@/contexts/AppraisalContext";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Performance Management System",
  description: "Appraisal and Performance Management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
        <AuthProvider>
          <AppraisalProvider>
            {children}
          </AppraisalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
