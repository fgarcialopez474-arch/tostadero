import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cabecera } from "@/components/cabecera";
import "./globals.css";

// shadcn usa la variable --font-sans: le damos la fuente Geist
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tostadero · Café de especialidad",
  description: "Café de especialidad, cafeteras, molinillos y accesorios",
};

// El layout envuelve TODAS las paginas: la cabecera se pinta una vez y no se recarga al navegar
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // las variables de fuente van en <html>: el globals.css de shadcn aplica font-sans a html
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Cabecera />
        {children}
      </body>
    </html>
  );
}
