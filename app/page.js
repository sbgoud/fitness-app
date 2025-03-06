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

  // Keep all previous useEffect and data loading logic
  
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
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <span className="font-medium bg-blue-100 px-4 py-2 rounded-full text-blue-800">
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
            className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
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
                Today's progress saved successfully!
              </p>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4 text-center w-32">Status</th>
                <th className="p-4 text-left w-40">Time</th>
                <th className="p-4 text-left w-48">Activity</th>
                <th className="p-4 text-left">Diet Plan</th>
                <th className="p-4 text-left w-64">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxChange(index)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                      />
                      {item.timestamp && (
                        <span className="text-xs text-gray-500 mt-1">
                          {format(new Date(item.timestamp), 'hh:mm a')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-700">{item.time}</td>
                  <td className="p-4 text-gray-600">{item.activity}</td>
                  <td className="p-4 text-gray-600 whitespace-pre-line">
                    {item.diet}
                  </td>
                  <td className="p-4">
                    <textarea
                      value={item.notes}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      className="w-full h-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={item.activity === 'Weight Check' ? 'Enter today\'s weight' : 'Add notes...'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Health Protocol */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Health Protocol</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
            <li className="flex items-center">
              <span className="mr-2">🚰</span>
              Drink 3L Water with Chia seeds/Sabja Ginjalu daily
            </li>
            <li className="flex items-center">
              <span className="mr-2">📵</span>
              No mobile usage after 9PM
            </li>
            <li className="flex items-center">
              <span className="mr-2">⏰</span>
              Maintain 10PM bedtime consistently
            </li>
            <li className="flex items-center">
              <span className="mr-2">👩🍳</span>
              Prepare all meals independently
            </li>
          </ul>
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </button>
        </div>

        {/* Previous Entries */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Previous Entries</h2>
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium text-gray-700">
                      {format(parseISO(entry.date), 'MMMM do, yyyy')}
                    </span>
                    <span className="transform transition-transform group-open:-rotate-180 text-gray-500">
                      <svg
                        className="w-6 h-6"
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
                  <div className="p-6">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Time</th>
                          <th className="p-3 text-left">Activity</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {entry.schedule?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-medium">{item.time}</td>
                            <td className="p-3">{item.activity}</td>
                            <td className="p-3">
                              {item.checked ? (
                                <span className="text-green-600">✓ Completed</span>
                              ) : (
                                <span className="text-gray-400">Pending</span>
                              )}
                            </td>
                            <td className="p-3 text-gray-600">{item.notes}</td>
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
    </div>
  );
}