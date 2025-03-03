'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Accordion } from '@headlessui/react';

export default function Home() {
  const router = useRouter();
  const [activities, setActivities] = useState({});
  const [notes, setNotes] = useState({});
  const [meals, setMeals] = useState({});
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  
  const activityConfig = {
    wakeUp: { time: '7:00 AM', meal: false },
    breakfast: { time: '8:00 AM', meal: true },
    lunch: { time: '12:30 PM', meal: true },
    dinner: { time: '7:30 PM', meal: true }
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) router.push('/login');
    else {
      setCurrentUser(user);
      loadUserData(user);
    }
  }, []);

  const loadUserData = async (user) => {
    const res = await fetch(`/api/users/${user}`);
    const data = await res.json();
    setHistory(data.history || []);
  };

  const handleActivityChange = (activity) => {
    setActivities(prev => ({
      ...prev,
      [activity]: prev[activity] ? null : new Date().toISOString()
    }));
  };

  const handleSubmit = async () => {
    const entry = {
      date: new Date().toISOString(),
      activities,
      notes,
      meals
    };

    await fetch(`/api/users/${currentUser}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    
    loadUserData(currentUser);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="font-medium">{currentUser}</span>
        <h1 className="text-xl font-bold">Fitness Schedule</h1>
        <button
          onClick={() => {
            localStorage.removeItem('currentUser');
document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
router.push('/login');
          }}
          className="text-blue-500 hover:text-blue-600"
        >
          Logout
        </button>
      </div>

      {/* Activities */}
      <div className="space-y-4">
        {Object.entries(activityConfig).map(([key, config]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!activities[key]}
                onChange={() => handleActivityChange(key)}
                className="h-4 w-4"
              />
              <span className="font-medium">
                {key.charAt(0).toUpperCase() + key.slice(1)} ({config.time})
              </span>
            </label>

            {activities[key] && (
              <div className="mt-2 space-y-2">
                <textarea
                  placeholder="Add notes"
                  value={notes[key] || ''}
                  onChange={(e) => setNotes(prev => ({...prev, [key]: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                />

                {config.meal && (
                  <MealDetailsInput
                    mealType={key}
                    value={meals[key] || ''}
                    onChange={(value) => setMeals(prev => ({...prev, [key]: value}))}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
      >
        Submit
      </button>

      {/* History */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Previous Days</h2>
        <Accordion as="div" className="space-y-2">
          {history.map((entry, index) => (
            <Accordion.Item key={index}>
              {({ open }) => (
                <>
                  <Accordion.Button className="w-full p-2 bg-gray-100 rounded-md flex justify-between items-center">
                    <span>
                      {format(parseISO(entry.date), 'MMM dd, yyyy')}
                    </span>
                    <span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </Accordion.Button>
                  <Accordion.Panel className="p-4 bg-white rounded-b-md shadow">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(entry, null, 2)}
                    </pre>
                  </Accordion.Panel>
                </>
              )}
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function MealDetailsInput({ mealType, value, onChange }) {
  const allowedFoods = {
    breakfast: ['Oatmeal', 'Eggs', 'Yogurt'],
    lunch: ['Salad', 'Chicken', 'Rice'],
    dinner: ['Fish', 'Vegetables', 'Quinoa']
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center text-sm text-gray-600">
        <span className="mr-1">Allowed foods:</span>
        <button
          title={allowedFoods[mealType].join(', ')}
          className="text-blue-500 hover:text-blue-600"
        >
          ℹ️
        </button>
      </div>
      <input
        type="text"
        placeholder="What did you eat?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md"
      />
    </div>
  );
}