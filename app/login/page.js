'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const validUsers = ['a1', 'a2', 'a3', 'a4'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validUsers.includes(username)) {
      document.cookie = `currentUser=${username}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('currentUser', username);
      router.push('/');
    } else {
      setError('No user found with that name');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Fitness Monitor Login</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}