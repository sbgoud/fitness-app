'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

export default function MasterHome() {
  const router = useRouter();
  const [allUsersData, setAllUsersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const masterUsers = ['aaaaa11', 'Thirumala3768', 'Sindhu8457'];
  const validUsers = [
    'aaaaa11', 'bbbbb22', 'ccccc33', 'ddddd33', 'tirumala1234', 'Chinni4823',
    'Laddu9372', 'Amruth2645', 'Pandu7189', 'Sweety5031', 'Sindhu8457',
    'Ravinder1294', 'Swaroopa1234', 'Thirumala3768'
  ];

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('currentUser='))
      ?.split('=')[1];
    if (!userCookie || !masterUsers.includes(userCookie)) {
      router.replace('/login');
      return;
    }

    const fetchAllUsersData = async () => {
      const timestamp = Date.now();
      const fetchedData = {};

      try {
        for (const user of validUsers) {
          const blobUrl = `https://jjat2xf6azudepf3.public.blob.vercel-storage.com/users/${user}.json?t=${timestamp}`;
          const res = await fetch(blobUrl, { cache: 'no-store' });
          if (res.ok) {
            fetchedData[user] = await res.json();
          } else {
            fetchedData[user] = { age: 0, height: 0, history: [] }; // Default for users with no data
          }
        }
        setAllUsersData(fetchedData);
      } catch (err) {
        setError('Failed to fetch users’ data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsersData();
  }, [router]);

  const logout = () => {
    document.cookie = "currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Master Dashboard</h1>
          <button
            onClick={logout}
            className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600">Welcome, Master User! Below is the data for all users.</p>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {Object.entries(allUsersData).map(([username, data]) => (
            <details key={username} className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-primary-700 hover:text-primary-900">
                {username.toUpperCase()} (Age: {data.age}, Height: {data.height} cm)
              </summary>
              <div className="mt-2 space-y-3 text-sm text-gray-700">
                {data.history.length === 0 ? (
                  <p>No history available for this user.</p>
                ) : (
                  data.history.map((entry, index) => {
                    const [day, month, year] = entry.date.split('-');
                    const isoDate = `${year}-${month}-${day}`;
                    return (
                      <div key={index} className="border-t pt-2">
                        <h3 className="font-medium text-primary-600">
                          {format(parseISO(isoDate), 'MMMM do, yyyy')}
                        </h3>
                        <ul className="mt-1 space-y-1">
                          {entry.schedule.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  item.checked ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              ></span>
                              <span>
                                {item.time} - {item.activity}{' '}
                                {item.notes && <span className="text-gray-500">({item.notes})</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}