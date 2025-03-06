'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';



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
  },
  {
    time: '10:00 PM',
    activity: 'Weight Check',
    diet: '',
    checked: false,
    timestamp: null,
    notes: 'Enter today\'s weight'
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
      
      // Separate today's entry from history
      const todayEntry = safeHistory.find(entry => 
        isSameDay(new Date(entry.date), new Date())
      );
      
      // Filter out today's entry from history display
      const filteredHistory = safeHistory.filter(entry => 
        !isSameDay(new Date(entry.date), new Date())
      );
      setHistory(filteredHistory);

      // Update form with today's entry if exists
      if (todayEntry) {
        const updatedEntries = entries.map(entry => {
          const savedEntry = todayEntry.schedule.find(e => e.time === entry.time);
          return savedEntry ? { ...entry, ...savedEntry } : entry;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 bg-blue-50 rounded-lg shadow-md border border-blue-100">
          <div className="flex items-center space-x-4">
            <span className="font-medium bg-blue-100 px-4 py-2 rounded-full text-blue-800 text-sm">
              {currentUser.slice(0, -4)}
            </span>
            <h1 className="text-2xl font-bold text-blue-800">
              {format(new Date(), 'EEEE, MMMM do')} Schedule
            </h1>
          </div>
          <button
            onClick={() => {
              document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              window.location.href = '/login';
            }}
            className="text-blue-800 hover:text-blue-900 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600">✓</span>
              <p className="ml-2 text-green-700 font-medium">
                Progress saved successfully! You can continue editing.
              </p>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-4 text-center w-32 text-blue-800 font-semibold">Status</th>
                <th className="p-4 text-left w-40 text-blue-800 font-semibold">Time</th>
                <th className="p-4 text-left w-48 text-blue-800 font-semibold">Activity</th>
                <th className="p-4 text-left text-blue-800 font-semibold">Diet Plan</th>
                <th className="p-4 text-left w-64 text-blue-800 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange(index)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-200 rounded focus:ring-blue-500"
                      />
                      {item.timestamp && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.timestamp), 'hh:mm a')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-700">{item.time}</td>
                  <td className="p-4 text-gray-600">{item.activity}</td>
                  <td className="p-4 text-gray-600 whitespace-pre-line">{item.diet}</td>
                  <td className="p-4">
                    <textarea
                      value={item.notes}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      className="w-full h-20 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={item.activity === 'Weight Check' ? 'Enter today\'s weight' : 'Add notes...'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>




     {/* Save Button */}
 <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center shadow-md hover:shadow-lg"
          >
            <span>Save Daily Progress</span>
            <svg
              className="ml-2 w-5 h-5"
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


     {/* Health Protocol */}
     <div className="mt-8 bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Health Protocol</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
            <li className="flex items-center space-x-2">
              <span>🚰</span>
              <span>Drink 3L Water with Chia seeds/Sabja Ginjalu daily</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>📵</span>
              <span>No mobile usage after 9PM</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>⏰</span>
              <span>Maintain 10PM bedtime consistently</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>👩🍳</span>
              <span>Prepare all meals independently</span>
            </li>
          </ul>
        </div>    

        {/* Previous Entries */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-blue-800 mb-6">Previous Entries</h2>
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-4 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                    <span className="font-medium text-blue-800">
                      {format(parseISO(entry.date), 'MMMM do, yyyy')}
                    </span>
                    <span className="transform transition-transform group-open:-rotate-180 text-blue-600">
                      ▼
                    </span>
                  </summary>
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          {entry.schedule?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-100">
                              <td className="p-3 w-32 text-center">
                                {item.checked ? (
                                  <span className="text-green-600 text-sm">✓</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">◯</span>
                                )}
                              </td>
                              <td className="p-3 text-gray-600 text-sm w-40">{item.time}</td>
                              <td className="p-3 text-gray-600 text-sm">{item.activity}</td>
                              <td className="p-3 text-gray-500 text-sm max-w-xs">
                                {item.notes || 'No notes'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
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







