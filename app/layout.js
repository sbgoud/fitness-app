import './globals.css';

export const metadata = {
  title: 'Fitness Monitor',
  description: 'Track your daily fitness activities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}