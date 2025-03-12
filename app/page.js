"use client";
import { useState, useEffect } from "react";
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

  const getLatestWeight = (history) => {
    const weights = [];
    history.forEach(entry => {
      entry.schedule?.forEach(item => {
        if (item.activity === "Weight Check and sleep" && item.notes) {
          const weightMatch = item.notes.match(/\d+(\.\d+)?/);
          if (weightMatch) weights.push(parseFloat(weightMatch[0]));
        }
      });
    });
    return weights.length > 0 ? Math.max(...weights) : null;
  };

  useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("currentUser="))
      ?.split("=")[1];

    if (!userCookie) {
      router.push("/login");
    } else {
      setCurrentUser(userCookie);
      loadUserData(userCookie);
    }
  }, [router]);

  const loadUserData = async (user) => {
    try {
      const res = await fetch(`/api/users/${user}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      const safeHistory = Array.isArray(data?.history) ? data.history : [];
      const todayDate = getLocalDateString();
      const todayEntry = safeHistory.find((entry) =>
        isSameEntryDate(entry.date, todayDate)
      );

      setEntries((prev) =>
        prev.map((defaultItem) => {
          const savedItem = todayEntry?.schedule?.find(
            (s) =>
              s.time === defaultItem.time && s.activity === defaultItem.activity
          );
          return savedItem ? { ...defaultItem, ...savedItem } : defaultItem;
        })
      );

      setHistory(
        safeHistory.filter((entry) => !isSameEntryDate(entry.date, todayDate))
      );
      setLatestWeight(getLatestWeight(safeHistory));
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
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
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    try {
      setSaveAttempted(true);
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

      const response = await fetch(`/api/users/${currentUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed");

      setHistory(prev => {
        const filtered = prev.filter(entry => !isSameEntryDate(entry.date, entryDate));
        return [...filtered, entry];
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      const newWeightEntry = entry.schedule.find(item => 
        item.activity === "Weight Check and sleep" && item.notes
      );
      if (newWeightEntry) {
        const weightMatch = newWeightEntry.notes.match(/\d+(\.\d+)?/);
        if (weightMatch) setLatestWeight(parseFloat(weightMatch[0]));
      }

    } catch (error) {
      console.error("Submission error:", error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaveAttempted(false);
    }
  };

  const logout = () => {
    if (typeof setCurrentUser === "function") {
      setCurrentUser(null);
    }
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    document.cookie =
      "currentUser=; path=/; domain=" +
      window.location.hostname +
      "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/");
    });
    window.location.href = "https://fitnessbysbgoud.vercel.app/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const sortedHistory = history.slice().sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split("-").map(Number);
    const [dayB, monthB, yearB] = b.date.split("-").map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-primary-700 to-primary-600 shadow-lg">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="rounded-full bg-primary-100 px-3 py-1.5 text-sm font-medium text-primary-800">
                {currentUser.slice(0, -4).toUpperCase()}
              </span>
              <h1 className="text-xl font-bold text-white">
                {format(new Date(), "EEE, MMM d")}
              </h1>
              {latestWeight && (
                <div className="ml-4 flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">Weight:</span>
                  <span className="bg-primary-800 text-white px-2 py-1 rounded-lg text-sm">
                    {latestWeight} kg
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-primary-100 hover:bg-primary-700 flex items-center space-x-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 mt-4">
          <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <p className="text-red-700 text-sm">{validationError}</p>
          </div>
        </div>
      )}

      <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
        <div className="space-y-4">
          {entries.map((item, index) => (
            <div key={index} className="rounded-xl bg-white p-4 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleCheckboxChange(index)}
                    className="h-6 w-6 rounded-full border-2 border-primary-200 text-primary-600 focus:ring-primary-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {item.time}
                    </span>
                    {item.timestamp && (
                      <span className="text-sm text-primary-600">
                        {format(new Date(item.timestamp), "hh:mm a")}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-base font-medium text-primary-800">
                    {item.activity}
                  </h3>
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-primary-600">
                      View Details
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                        {item.diet}
                      </div>
                      <textarea
                        value={item.notes}
                        onChange={(e) =>
                          handleNotesChange(index, e.target.value)
                        }
                        className={`mt-2 w-full rounded-lg border p-2 text-sm focus:ring-primary-500 ${
                          item.checked && !item.notes.trim()
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                        placeholder={item.placeholder}
                        rows={3}
                        required
                      />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saveAttempted}
          className="mt-8 w-full rounded-xl bg-primary-600 py-4 px-6 text-lg font-semibold text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveAttempted ? "Saving..." : "Save Progress"}
        </button>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-xl font-bold text-primary-800 mb-4">
            Daily Health Rules
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {healthProtocols.map((protocol, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="shrink-0 text-2xl">{protocol.emoji}</span>
                <p className="text-sm text-gray-700">{protocol.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-primary-800 mb-4">History</h2>
          <div className="space-y-3">
            {sortedHistory.map((entry, index) => {
              const [day, month, year] = entry.date.split("-");
              const isoDate = `${year}-${month}-${day}`;

              return (
                <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer">
                      <span className="font-medium text-primary-800">
                        {format(parseISO(isoDate), "MMMM do, yyyy")}
                      </span>
                      <span className="text-primary-600 transform transition-transform group-open:-rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-4 space-y-2">
                      {entry.schedule?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`h-4 w-4 rounded-full ${
                                item.checked ? "bg-green-500" : "bg-gray-200"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.time}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.activity}
                              </p>
                            </div>
                            {item.checked && item.timestamp && (
                              <span className="text-xs text-gray-500">
                                {format(new Date(item.timestamp), "hh:mm a")}
                              </span>
                            )}
                          </div>
                          {item.checked && item.notes && (
                            <div className="ml-8 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700 font-medium">
                                Notes:
                              </p>
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {item.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-50 text-green-700 px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 animate-slide-up">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Progress saved successfully!</span>
        </div>
      )}
    </div>
  );
}