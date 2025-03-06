'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

const fitnessSchedule = [
  {
    time: '5:00 AM',
    activity: 'Wake up',
    diet: 'Lemon water + Honey',
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '5:30 AM',
    activity: 'Morning drink',
    diet: 'Black Jeera Water Green Tea or Lemon Tea',
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '6:00 AM - 7:00 AM',
    activity: 'Exercise',
    diet: 'Munaga aaku Water + Lemon + Honey',
    checked: false,
    timestamp: null,
    notes: ''
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
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '11:00 AM',
    activity: 'Morning Snack',
    diet: 'Fresh fruit or juice (Banana, Orange, Carrot, Cucumber, Avocado)',
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '1:00 PM - 2:00 PM',
    activity: 'Lunch',
    diet: `1-2 Pulkas/Whole Wheat/Brown Rice
Vegetable Curry + Dal
Curd (Small bowl)
Non-Veg Options: Chicken, Fish, Eggs`,
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '5:00 PM',
    activity: 'Evening Snack',
    diet: 'Pumpkin Seeds, Roasted Chana, Watermelon Seeds',
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '8:00 PM - 9:00 PM',
    activity: 'Dinner',
    diet: `1-2 Pulkas with Vegetable Curry
Multigrain Jaava Sprouts/Papaya
Non-Veg Options: Chicken, Fish, Eggs`,
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '9:00 PM - 9:30 PM',
    activity: 'Walking',
    diet: 'Oats, Vegetable Salad',
    checked: false,
    timestamp: null,
    notes: ''
  },
  {
    time: '9:30 PM - 10:00 PM',
    activity: 'Wind Down',
    diet: 'Prepare for next day diet & Sleep',
    checked: false,
    timestamp: null,
    notes: ''
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
      
      const safeHistory = Array.isArray(data?.history) ? data.history : [];
      setHistory(safeHistory);

      const todayEntry = safeHistory.find(entry => 
        isSameDay(new Date(entry.date), new Date())
      );

      if (todayEntry) {
        const updatedEntries = entries.map(entry => {
          const savedEntry = todayEntry.schedule.find(e => e.time === entry.time);
          return savedEntry ? { 
            ...entry,
            checked: savedEntry.checked || false,
            timestamp: savedEntry.timestamp || null,
            notes: savedEntry.notes || ''
          } : entry;
        });
        setEntries(updatedEntries);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setEntries([...fitnessSchedule]);
      setHistory([]);
      setLoading(false);
    }
  };

  const handleCheckboxChange = (index) => {
    const newEntries = [...entries];
    newEntries[index].checked = !newEntries[index].checked;
    newEntries[index].timestamp = newEntries[index].checked ? new Date().toISOString() : null;
    setEntries(newEntries);
  };

  const handleNotesChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].notes = value;
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    try {
      const entry = {
        date: new Date().toISOString(),
        schedule: entries.map(item => ({
          time: item.time,
          activity: item.activity,
          diet: item.diet,
          checked: item.checked,
          timestamp: item.timestamp,
          notes: item.notes
        }))
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
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border-2 border-gray-300 w-20"></th>
              <th className="p-3 border-2 border-gray-300 text-left">Time</th>
              <th className="p-3 border-2 border-gray-300 text-left">Activity</th>
              <th className="p-3 border-2 border-gray-300 text-left">Diet Plan</th>
              <th className="p-3 border-2 border-gray-300 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border-2 border-gray-300 text-center align-top">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleCheckboxChange(index)}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {item.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </div>
                  )}
                </td>
                <td className="p-3 border-2 border-gray-300 font-medium align-top">
                  {item.time}
                </td>
                <td className="p-3 border-2 border-gray-300 align-top">
                  {item.activity}
                </td>
                <td className="p-3 border-2 border-gray-300 whitespace-pre-line align-top">
                  {item.diet}
                </td>
                <td className="p-3 border-2 border-gray-300 align-top">
                  <textarea
                    value={item.notes}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    className="w-full h-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl p-6 shadow-sm">
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
          {(Array.isArray(history) ? history : []).map((entry, index) => (
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
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 border-2 border-gray-300"></th>
                        <th className="p-3 border-2 border-gray-300">Time</th>
                        <th className="p-3 border-2 border-gray-300">Activity</th>
                        <th className="p-3 border-2 border-gray-300">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.schedule?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border-2 border-gray-300 text-center">
                            {item.checked && (
                              <span className="text-green-500">✓</span>
                            )}
                          </td>
                          <td className="p-3 border-2 border-gray-300">{item.time}</td>
                          <td className="p-3 border-2 border-gray-300">{item.activity}</td>
                          <td className="p-3 border-2 border-gray-300">{item.notes}</td>
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