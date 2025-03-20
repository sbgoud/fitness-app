// app/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

const fitnessSchedule = [
  {
    time: "5:00 AM",
    activity: "Wake up",
    diet: "",
    checked: false,
    timestamp: null,
    placeholder: "Did You sleep well? , mention your sleeping time",
    notes: "",
  },
  {
    time: "5:30 AM",
    activity: "Morning drink",
    diet: "Lemon water + Honey , Black Jeera Water , Green Tea or Lemon Tea, Munaga aaku Water + Lemon + Honey",
    checked: false,
    timestamp: null,
    placeholder: "what did you take as morning drink?",
    notes: "",
  },
  {
    time: "6:00 AM - 7:00 AM",
    activity: "Exercise",
    diet: " do any exercise and mention in notes, with duration",
    checked: false,
    timestamp: null,
    placeholder: "what exercise did you try today?",
    notes: "",
  },
  {
    time: "Before 8:00 AM",
    activity: "Breakfast",
    diet: `Oats
Raagi Jaava Doolid Rawa Upma
Soaked Dry fruits (4 Badam + 2 Kaju + 4 Pista + 2 Walnuts + 1 Anjeer + 4 Raisins)
Sprouts
Boiled Eggs
Seasonal Fruits/Vegetable Salad (Keera/Carrot/Beetroot)
Idli/Dosa without oil (Avoid rice based)`,
    checked: false,
    timestamp: null,
    placeholder:
      "whats your breakfast today?, and dont forget to thank who prepared it",
    notes: "",
  },
  {
    time: "11:00 AM",
    activity: "Morning Snack",
    diet: "Fresh fruit or juice (Banana, Orange, Carrot, Cucumber, Avocado)",
    checked: false,
    timestamp: null,
    placeholder: "done or skipped?",
    notes: "",
  },
  {
    time: "1:00 PM - 2:00 PM",
    activity: "Lunch",
    diet: `1-2 Pulkas/Whole Wheat/Brown Rice
Vegetable Curry + Dal,
Curd (Small bowl),
Non-Veg(only sunday) Options: Chicken, Fish, Eggs`,
    checked: false,
    timestamp: null,
    placeholder: "timely lunch is mandatory, dont break the streak",
    notes: "",
  },
  {
    time: "5:00 PM",
    activity: "Evening Snack",
    diet: "Pumpkin Seeds, Roasted Chana, Watermelon Seeds",
    checked: false,
    timestamp: null,
    placeholder: "just do it",
    notes: "",
  },
  {
    time: "8:00 PM - 9:00 PM",
    activity: "Dinner",
    diet: `1-2 Pulkas with Vegetable Curry
Multigrain Jaava Sprouts/Papaya, Oats, Vegetable Salad,
Non-Veg(only sunday) Options: Chicken, Fish, Eggs`,
    checked: false,
    timestamp: null,
    placeholder: "have dinner, 2 hours before sleep",
    notes: "",
  },
  {
    time: "9:00 PM - 9:30 PM",
    activity: "Walking",
    diet: "",
    checked: false,
    timestamp: null,
    placeholder: "as much as possible, give time for your physical health",
    notes: "",
  },
  {
    time: "9:30 PM - 10:00 PM",
    activity: "Wind Down",
    diet: "Prepare for next day diet & Sleep",
    checked: false,
    timestamp: null,
    placeholder: "what your diet tomorrow will be? did you prepare anything?",
    notes: "",
  },
  {
    time: "10:00 PM",
    activity: "Weight Check and sleep",
    diet: "",
    checked: false,
    timestamp: null,
    placeholder: "Enter today's weight",
    notes: "",
  },
];
const healthProtocols = [
  { emoji: "💧", text: "Drink 3L Water with Chia seeds/Sabja Ginjalu daily" },
  { emoji: "📵", text: "No mobile usage after 9PM" },
  { emoji: "⏰", text: "Maintain 10PM bedtime consistently" },
  { emoji: "👩🍳", text: "Prepare all meals independently" },
];
const getLocalDateString = () => {
  try {
    const timeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const parts = formatter.formatToParts(new Date());
    return [
      parts.find((p) => p.type === "day").value.padStart(2, "0"),
      parts.find((p) => p.type === "month").value.padStart(2, "0"),
      parts.find((p) => p.type === "year").value,
    ].join("-");
  } catch (error) {
    const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    return [
      String(istDate.getUTCDate()).padStart(2, "0"),
      String(istDate.getUTCMonth() + 1).padStart(2, "0"),
      istDate.getUTCFullYear(),
    ].join("-");
  }
};
const isSameEntryDate = (savedDate, incomingDate) => savedDate === incomingDate;

export default function Home() {
  const router = useRouter();
  const [entries, setEntries] = useState([...fitnessSchedule]);
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [latestWeight, setLatestWeight] = useState(null);
  const [userHeight, setUserHeight] = useState(0); // in cm
  const [userAge, setUserAge] = useState(0);
  const detailsRefs = useRef([]); // To track <details> elements

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return "N/A";
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi <= 24.9) return "Healthy weight";
    if (bmi >= 25 && bmi <= 29.9) return "Overweight";
    return "Obese";
  };

  const calculateTargetWeight = (height) => {
    if (!height) return null;
    const heightInMeters = height / 100;
    const targetBMI = 24; // Middle of healthy range (18.5–24.9)
    return (targetBMI * (heightInMeters * heightInMeters)).toFixed(1);
  };

  const extractWeight = (notes) => {
    if (!notes) return null;
    const weightMatch = notes.match(/\d+(\.\d+)?/);
    return weightMatch ? parseFloat(weightMatch[0]) : null;
  };

  const getLatestWeight = (entries, history) => {
    const currentWeightEntry = entries.find((item) => item.activity === "Weight Check and sleep");
    const currentWeight = extractWeight(currentWeightEntry?.notes);
    if (currentWeight) return currentWeight;

    const allEntries = history.flatMap((entry) => entry.schedule);
    const weightEntries = allEntries.filter((item) => item.activity === "Weight Check and sleep");
    const weights = weightEntries.map((item) => extractWeight(item.notes)).filter(Boolean);
    return weights.length > 0 ? Math.max(...weights) : null;
  };

  const fetchUserData = async (user) => {
    const timestamp = Date.now();
    const blobUrl = `https://jjat2xf6azudepf3.public.blob.vercel-storage.com/users/${user}.json?t=${timestamp}`;
    try {
      const res = await fetch(blobUrl, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) return { age: 0, height: 0, history: [] };
        throw new Error("Failed to fetch data");
      }
      return await res.json();
    } catch (error) {
      console.error("Fetch error:", error);
      return { age: 0, height: 0, history: [] };
    }
  };

  useEffect(() => {
    const userCookie = document.cookie.split("; ").find((row) => row.startsWith("currentUser="))?.split("=")[1];
    if (!userCookie) {
      router.replace("/login");
      return;
    }

    const verifyUser = async () => {
      try {
        const data = await fetchUserData(userCookie);
        setCurrentUser(userCookie);
        setUserAge(data.age || 0);
        setUserHeight(data.height || 0);
        loadUserData(userCookie, data.history || []);
      } catch (error) {
        console.error("Verification error:", error);
        document.cookie = "currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const loadUserData = (user, historyData) => {
    const todayDate = getLocalDateString();
    const todayEntry = historyData.find((entry) => isSameEntryDate(entry.date, todayDate));
    const updatedEntries = entries.map((defaultItem) => {
      const savedItem = todayEntry?.schedule?.find(
        (s) => s.time === defaultItem.time && s.activity === defaultItem.activity
      );
      return savedItem ? { ...defaultItem, ...savedItem } : defaultItem;
    });

    setEntries(updatedEntries);
    setLatestWeight(getLatestWeight(updatedEntries, historyData));
    setHistory(historyData.filter((entry) => !isSameEntryDate(entry.date, todayDate)));
  };

  const handleCheckboxChange = (index) => {
    const newEntries = [...entries];
    const wasChecked = newEntries[index].checked;

    if (!wasChecked) {
      if (!newEntries[index].notes.trim()) {
        setValidationError("Please add notes before checking this item");
        return;
      }
      newEntries[index].timestamp = new Date().toISOString();
    } else {
      newEntries[index].timestamp = null;
    }

    newEntries[index].checked = !wasChecked;
    setEntries(newEntries);
    setValidationError("");
  };

  const handleNotesChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].notes = value;
    if (newEntries[index].activity === "Weight Check and sleep") {
      setLatestWeight(extractWeight(value));
    }
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    setSaveAttempted(true);
    try {
      const entryDate = getLocalDateString();
      const entry = {
        date: entryDate,
        schedule: entries.map((item) => ({
          time: item.time,
          activity: item.activity,
          diet: item.diet,
          checked: item.checked,
          timestamp: item.timestamp,
          notes: item.notes,
        })),
      };

      const saveResponse = await fetch(`/api/users/${currentUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Save failed");
      }

      // Fetch latest data
      const updatedData = await fetchUserData(currentUser);
      loadUserData(currentUser, updatedData.history || []);
      setUserAge(updatedData.age || 0);
      setUserHeight(updatedData.height || 0);
      setLatestWeight(getLatestWeight(entries, updatedData.history || []));

      // Collapse all <details> elements
      detailsRefs.current.forEach((ref) => {
        if (ref) ref.open = false;
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaveAttempted(false);
    }
  };

  const logout = () => {
    document.cookie = "currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCurrentUser("");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  const bmi = calculateBMI(latestWeight, userHeight);
  const bmiCategory = getBMICategory(bmi);
  const targetWeight = calculateTargetWeight(userHeight);
  const username = currentUser.slice(0, -4).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-r from-primary-700 to-primary-500 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">FitTrack Pro</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="block">Weight: {latestWeight ? `${latestWeight} kg` : "N/A"}</span>
              <span className="block">
                BMI: {bmi || "N/A"} ({bmiCategory})
                {targetWeight && (
                  <span className="ml-1 text-xs text-gray-300">
                    Target: {targetWeight} kg
                  </span>
                )}
              </span>
            </div>
            <button onClick={logout} className="p-2 hover:bg-primary-600 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-10 max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold">Let's do it, {username}</h2>
          <p className="text-sm text-gray-400">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>

        <section className="space-y-4">
          {entries.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(index)}
                  className="h-5 w-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{item.time}</span>
                    {item.timestamp && (
                      <span className="text-xs text-primary-400">
                        {format(new Date(item.timestamp), "hh:mm a")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-primary-300">{item.activity}</h3>
                  <details
                    ref={(el) => (detailsRefs.current[index] = el)}
                    className="mt-2 text-sm text-gray-300"
                  >
                    <summary className="cursor-pointer hover:text-primary-400">Details</summary>
                    <p className="mt-2 whitespace-pre-line">{item.diet}</p>
                    <textarea
                      value={item.notes}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      className="mt-2 w-full bg-gray-700 rounded-lg p-2 text-sm border border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={item.placeholder}
                      rows={2}
                    />
                  </details>
                </div>
              </div>
            </div>
          ))}
        </section>

        <button
          onClick={handleSubmit}
          disabled={saveAttempted}
          className="mt-6 w-full bg-primary-600 py-3 rounded-xl text-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveAttempted ? "Saving..." : "Save Progress"}
        </button>

        <section className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-primary-300 mb-4">Daily Health Rules</h3>
          <div className="grid gap-4">
            {healthProtocols.map((protocol, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-2xl">{protocol.emoji}</span>
                <p className="text-sm text-gray-300">{protocol.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-primary-300 mb-4">History</h2>
          <div className="space-y-3">
            {history.map((entry, index) => {
              const [day, month, year] = entry.date.split("-");
              const isoDate = `${year}-${month}-${day}`;
              return (
                <div key={index} className="bg-gray-800 rounded-xl p-4 shadow-lg">
                  <details>
                    <summary className="flex justify-between items-center cursor-pointer text-primary-300">
                      <span>{format(parseISO(isoDate), "MMMM do, yyyy")}</span>
                      <span className="text-sm">▼</span>
                    </summary>
                    <div className="mt-2 space-y-2 text-sm text-gray-300">
                      {entry.schedule.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${item.checked ? "bg-green-500" : "bg-gray-600"}`}></span>
                          <div>
                            <p>{item.time} - {item.activity}</p>
                            {item.notes && <p className="text-gray-400">Notes: {item.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {showSuccess && (
        <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg flex items-center justify-center">
          <span>Progress saved successfully!</span>
        </div>
      )}
    </div>
  );
}