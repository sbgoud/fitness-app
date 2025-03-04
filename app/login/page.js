'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

const fitnessSchedule = [
  {
    time: '5:00 AM',
    activity: 'Wake up',
    allowedFoods: 'Lemon water + Honey',
    entry: ''
  },
  {
    time: '5:30 AM',
    activity: 'Morning drink',
    allowedFoods: 'Black Jeera Water, Green Tea, or Lemon Tea',
    entry: ''
  },
  {
    time: '6:00 AM - 7:00 AM',
    activity: 'Exercise',
    allowedFoods: 'Munaga asku Water + Lemon + Honey',
    entry: ''
  },
  {
    time: 'Before 8:00 AM',
    activity: 'Breakfast',
    allowedFoods: 'Oats, Raagi Java, Doolid Rawa Upma, Soaked Dry fruits (4 almonds, 2 cashew, 4 pistachio, 2 walnuts, 1 apiper, 4 raisins), Sprouts, Boiled Eggs, Seasonal Fruits/Vegetable Salad',
    entry: ''
  },
  {
    time: '11:00 AM',
    activity: 'Morning Snack',
    allowedFoods: 'Fresh fruit or juice (banana, orange, carrot, cucumber, avocado)',
    entry: ''
  },
  {
    time: '1:00 PM - 2:00 PM',
    activity: 'Lunch',
    allowedFoods: '1-2 Pulkas/Whole Wheat/Brown Rice with Vegetable curry, Dal, Curd (Small bowl) | Non-Veg: Chicken, Fish, Eggs',
    entry: ''
  },
  {
    time: '5:00 PM',
    activity: 'Evening Snack',
    allowedFoods: 'Pumpkin Seeds, Roasted Chana, Watermelon Seeds',
    entry: ''
  },
  {
    time: '8:00 PM - 9:00 PM',
    activity: 'Dinner',
    allowedFoods: '1-2 Pulkas with Vegetable Curry | Non-Veg: Chicken, Fish, Eggs',
    entry: ''
  },
  {
    time: '9:00 PM - 9:30 PM',
    activity: 'Walking',
    allowedFoods: 'Sprouts/Papaya',
    entry: ''
  },
  {
    time: '9:30 PM - 10:00 PM',
    activity: 'Wind Down',
    allowedFoods: '',
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
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <span className="font-medium">{currentUser}</span>
        <h1 className="text-xl font-bold">Fitness Schedule</h1>
        <button
          onClick={() => {
            document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
          }}
          className="text-blue-500 hover:text-blue-600"
        >
          Logout
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Data saved successfully!
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left border-b-2 border-gray-200">Time</th>
              <th className="p-3 text-left border-b-2 border-gray-200">Activity</th>
              <th className="p-3 text-left border-b-2 border-gray-200">Diet Plan</th>
              <th className="p-3 text-left border-b-2 border-gray-200">Your Entry</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 even:bg-gray-50">
                <td className="p-3 border-b border-gray-100">{item.time}</td>
                <td className="p-3 border-b border-gray-100">{item.activity}</td>
                <td className="p-3 border-b border-gray-100">
                  <div className="group relative inline-block">
                    <span className="text-blue-600 cursor-help border-b border-dashed border-blue-300">
                      View Options
                    </span>
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 text-sm">
                      {item.allowedFoods || 'No specific dietary requirements'}
                    </div>
                  </div>
                </td>
                <td className="p-3 border-b border-gray-100">
                  <input
                    type="text"
                    value={item.entry}
                    onChange={(e) => handleEntryChange(index, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter completion status"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Save Today's Progress
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Previous Entries</h2>
        <div className="space-y-2">
          {history.map((entry, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
                  <span className="font-medium">
                    {format(parseISO(entry.date), 'EEEE, MMM d, yyyy')}
                  </span>
                  <span className="transform transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="p-4 bg-white">
                  <table className="w-full">
                    <tbody>
                      {entry.schedule.map((item, idx) => (
                        <tr key={idx}>
                          <td className="pr-4 py-1 font-medium">{item.time}</td>
                          <td className="px-4 py-1">{item.activity}</td>
                          <td className="pl-4 py-1 text-gray-600">{item.entry}</td>
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
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}