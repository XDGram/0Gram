import type { Metadata } from "next";
import "./globals.css";
import PlayerArtifact from "./PlayerArtifact";

export const metadata: Metadata = {
  title: "0Gram",
  description: "0Gram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PlayerArtifact />
      </body>
    </html>
  );
}
