import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GitHubLink from "./components/GitHubLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sahabi",
  description: "Your AI Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <GitHubLink />
      </body>
    </html>
  );
}
