import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Edubudy — Ton assistant scolaire',
  description: 'Assistant pédagogique et de bien-être pour les enfants',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-blue-50 via-white to-yellow-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
