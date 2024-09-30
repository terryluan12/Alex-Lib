import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Lib",
  description:
    "A library app to allow people to access books from an S3 Bucket",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div id="modal"></div>
        {children}
      </body>
    </html>
  );
}
