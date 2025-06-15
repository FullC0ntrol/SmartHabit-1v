import { useState, useEffect, useCallback } from "react";
import useAuth from "./useAuth";

const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, getToken, loading: authLoading } = useAuth();

  // Funkcja pomocnicza do formatowania daty
  const formatDate = (date) => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
  };

  // Pobieranie nawyków
  const fetchHabits = useCallback(async () => {
    if (!isLoggedIn) {
      if (!authLoading) {
        setHabits([]);
        setLoading(false);
      }
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Brak tokenu autoryzacji");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/habits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Błąd: ${response.status}`);
      }

      const data = await response.json();
      setHabits(data.map(habit => ({ // Correct: The object starts here
    ...habit,
    start_date: new Date(habit.start_date),
    // Use optional chaining and nullish coalescing for completed_dates
    completed_dates: habit.completed_dates?.map(dateStr => new Date(dateStr)) || [],
}) // Correct: The object ends here, followed by closing parenthesis for map
)); // Correct: Closing parenthesis for setHabits

} catch (err) {
  setError(err.message);
  setHabits([]);
} finally {
  setLoading(false);
}
  }, [isLoggedIn, authLoading, getToken]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Zapisywanie nawyku
  const saveHabit = useCallback(async (habitData) => {
    if (!isLoggedIn) throw new Error("Wymagane logowanie");
    const token = getToken();
    if (!token) throw new Error("Brak tokenu");

    const formattedDate = formatDate(habitData.start_date);
    if (!formattedDate) throw new Error("Nieprawidłowa data");

    const isEditing = !!habitData.id;
    const url = isEditing 
      ? `http://localhost:3001/habits/${habitData.id}`
      : "http://localhost:3001/habits";

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...habitData,
          start_date: formattedDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Błąd: ${response.status}`);
      }

      await fetchHabits();
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isLoggedIn, getToken, fetchHabits]);

  // Usuwanie nawyku
  const deleteHabit = useCallback(async (habitId) => {
    if (!isLoggedIn) throw new Error("Wymagane logowanie");
    const token = getToken();
    if (!token) throw new Error("Brak tokenu");

    if (!window.confirm("Na pewno usunąć nawyk?")) return;

    try {
      const response = await fetch(`http://localhost:3001/habits/${habitId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Błąd: ${response.status}`);
      }

      await fetchHabits();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isLoggedIn, getToken, fetchHabits]);

  // Zmiana statusu wykonania
  const toggleHabitCompletion = useCallback(async (habitId, date = new Date()) => {
  if (!isLoggedIn) throw new Error("Wymagane logowanie");
  const token = getToken();
  if (!token) throw new Error("Brak tokenu");

  try {
    const formattedDate = formatDate(date); // Twoja funkcja formatująca datę

    const response = await fetch(
      `http://localhost:3001/habits/${habitId}/toggle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: formattedDate }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Błąd serwera: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    setHabits(prev => prev.map(h => 
      h.id === habitId 
        ? { 
            ...h,
            completed_dates: result.completed_dates,
            is_completed: result.is_completed
          } 
        : h
    ));

    return result;
  } catch (err) {
    console.error("Błąd zmiany statusu nawyku:", err);
    setError(err.message);
    throw err;
  }
}, [isLoggedIn, getToken]);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    saveHabit,
    deleteHabit,
    toggleHabitCompletion,
  };
};

export default useHabits;