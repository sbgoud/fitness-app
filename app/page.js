'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

const fitnessSchedule = [
  {
    time: '5:00 AM',
    activity: 'Wake up',
    diet: 'Lemon water + Honey',
    entry: ''
  },
  {
    time: '5:30 AM',
    activity: 'Morning drink',
    diet: 'Black Jeera Water Green Tea or Lemon Tea',
    entry: ''
  },
  {
    time: '6:00 AM - 7:00 AM',
    activity: 'Exercise',
    diet: 'Munaga aaku Water + Lemon + Honey',
    entry: ''
  },
  {
    time: 'Before 8:00 AM',
    activity: 'Breakfast',
    diet: `Oats
Raagi Jaava Doolid Rawa Upma
Soaked Dry fruits (4 Badam + 2 Kaju + 4 Pista + 2 Walnuts + 1 Anjeer + 4 Raisins)
Sprouts
Boiled Eggs
Seasonal Fruits/Vegetable Salad (Keera/Carrot/Beetroot)
Idli/Dosa without oil (Avoid rice based)`,
    entry: ''
  },
  {
    time: '11:00 AM',
    activity: 'Morning Snack',
    diet: 'Fresh fruit or juice (Banana, Orange, Carrot, Cucumber, Avocado)',
    entry: ''
  },
  {
    time: '1:00 PM - 2:00 PM',
    activity: 'Lunch',
    diet: `1-2 Pulkas/Whole Wheat/Brown Rice
Vegetable Curry + Dal
Curd (Small bowl)
Non-Veg Options: Chicken, Fish, Eggs`,
    entry: ''
  },
  {
    time: '5:00 PM',
    activity: 'Evening Snack',
    diet: 'Pumpkin Seeds, Roasted Chana, Watermelon Seeds',
    entry: ''
  },
  {
    time: '8:00 PM - 9:00 PM',
    activity: 'Dinner',
    diet: `1-2 Pulkas with Vegetable Curry
Multigrain Jaava Sprouts/Papaya
Non-Veg Options: Chicken, Fish, Eggs`,
    entry: ''
  },
  {
    time: '9:00 PM - 9:30 PM',
    activity: 'Walking',
    diet: 'Oats, Vegetable Salad',
    entry: ''
  },
  {
    time: '9:30 PM - 10:00 PM',
    activity: 'Wind Down',
    diet: 'Prepare for next day diet & Sleep',
    entry: ''
  }
];

export default function Home() {
  const router = useRouter();
  const [entries, setEntries] = useState([...fitnessSchedule]);
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('currentUser='))
      ?.split('=')[1];

    if (!userCookie) {
      router.push('/login');
    } else {
      setCurrentUser(userCookie);
      loadUserData(userCookie);
    }
  }, [router]);

  const loadUserData = async (user) => {
    try {
      const res = await fetch(`/api/users/${user}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setHistory(data.history || []);
      
      const todayEntry = data.history.find(entry => 
        isSameDay(new Date(entry.date), new Date())
      );
      
      if (todayEntry) {
        setEntries(todayEntry.schedule);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleEntryChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].entry = value;
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    try {
      const entry = {
        date: new Date().toISOString(),
        schedule: entries
      };

      const response = await fetch(`/api/users/${currentUser}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (!response.ok) throw new Error('Save failed');
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      loadUserData(currentUser);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="font-medium bg-blue-100 px-3 py-1 rounded">
            {currentUser}
          </span>
          <h1 className="text-2xl font-bold text-gray-800">
            {format(new Date(), 'EEEE, MMMM do')} Schedule
          </h1>
        </div>
        <button
          onClick={() => {
            document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
          }}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex items-center">
            <span className="text-green-600">✓</span>
            <p className="ml-2 text-green-700 font-medium">
              Today's progress saved successfully!
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[12%]">
                Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[18%]">
                Activity
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[45%]">
                Diet Plan
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[25%]">
                Daily Entry
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {item.time}
                </td>
                <td className="px-4 py-3 text-gray-700">{item.activity}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-pre-line text-sm">
                  {item.diet}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.entry}
                    onChange={(e) => handleEntryChange(index, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter completion status"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Health Protocol
        </h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Drink 3L Water with Chia seeds/Sabja Ginjalu daily</li>
          <li>• Strictly no outside food or mobile usage after 9PM</li>
          <li>• Maintain 10PM bedtime consistently</li>
          <li>• Prepare all meals independently</li>
          <li>• No substitutions in diet plan</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center"
        >
          <span>Save Daily Progress</span>
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Previous Entries
        </h2>
        <div className="space-y-3">
          {history.map((entry, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                  <span className="font-medium text-gray-700">
                    {format(parseISO(entry.date), 'MMMM do, yyyy')}
                  </span>
                  <span className="transform transition-transform group-open:-rotate-180">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="bg-white p-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {entry.schedule.map((item, idx) => (
                        <tr key={idx}>
                          <td className="pr-4 py-2 font-medium w-[15%]">
                            {item.time}
                          </td>
                          <td className="px-4 py-2 w-[20%]">{item.activity}</td>
                          <td className="px-4 py-2 text-gray-600 w-[65%]">
                            {item.entry}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}