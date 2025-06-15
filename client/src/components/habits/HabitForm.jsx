import React, { useState, useEffect } from "react";

const HabitForm = ({ editingHabit, onSave, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState(""); // Zmieniono na string dla input type="date"
  const [errorMessage, setErrorMessage] = useState(""); // Nowy stan na komunikaty błędów

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title || "");
      setDescription(editingHabit.description || "");
      setFrequency(editingHabit.frequency || "daily");
      // Formatowanie daty do YYYY-MM-DD dla input type="date"
      setStartDate(
        editingHabit.start_date
          ? editingHabit.start_date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
    } else {
      setTitle("");
      setDescription("");
      setFrequency("daily");
      setStartDate(new Date().toISOString().split("T")[0]); // Domyślnie dzisiejsza data
    }
    setErrorMessage(""); // Czyść błędy przy zmianie nawyku
  }, [editingHabit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Czyść poprzednie błędy

    if (!title.trim()) {
      setErrorMessage("Nazwa nawyku nie może być pusta!");
      return;
    }

    if (!startDate) {
      setErrorMessage("Data rozpoczęcia jest wymagana!");
      return;
    }

    const habitData = {
      title,
      description,
      frequency,
      // Konwertuj string daty z powrotem na obiekt Date przed przekazaniem do onSave
      start_date: new Date(startDate),
    };

    // Jeśli edytujemy, dodaj ID do danych
    if (editingHabit && editingHabit.id) {
      habitData.id = editingHabit.id;
    }

    try {
      await onSave(habitData);
      onClose(); // Zamknij formularz po pomyślnym zapisie
    } catch (error) {
      // Błąd został już obsłużony w useHabits, ale możemy wyświetlić ogólny komunikat
      setErrorMessage("Wystąpił błąd podczas zapisywania nawyku. Spróbuj ponownie.");
      console.error("Błąd zapisu w HabitForm:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-80">
      <h2 className="text-lg font-semibold text-white text-center">
        {editingHabit ? "Edytuj nawyk" : "Dodaj nowy nawyk"}
      </h2>

      {errorMessage && (
        <div className="bg-red-700 text-white p-2 rounded-md text-sm text-center">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Nazwa nawyku
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Opis (opcjonalnie)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
          Data rozpoczęcia
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-300 mb-1">
          Częstotliwość
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Codziennie</option>
          <option value="weekly">Tygodniowo</option>
          <option value="monthly">Miesięcznie</option>
        </select>
      </div>

      <div className="flex space-x-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          {editingHabit ? "Zapisz zmiany" : "Dodaj nawyk"}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;