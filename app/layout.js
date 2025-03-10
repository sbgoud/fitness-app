import './globals.css';

export const metadata = {
  title: 'FitTrack Pro',
  description: 'Your Personal Fitness Companion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-b from-primary-50 to-white antialiased">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}