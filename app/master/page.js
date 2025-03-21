'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterHome() {
  const router = useRouter();
  const masterUsers = ['aaaaa11', 'Thirumala3768', 'Sindhu8457'];

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('currentUser='))
      ?.split('=')[1];
    if (!userCookie || !masterUsers.includes(userCookie)) {
      router.replace('/login');
    }
  }, [router]);

  const logout = () => {
    document.cookie = "currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Master User!</h1>
        <p className="text-gray-600">You have successfully logged in as a master user.</p>
        <button
          onClick={logout}
          className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}