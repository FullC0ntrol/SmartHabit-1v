import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const EventForm = ({
  selectedDay,
  editingEvent,
  newEventTitle,
  newEventTime,
  newEventDescription,
  setNewEventTitle,
  setNewEventTime,
  setNewEventDescription,
  onSave,
  onCancel,
  onClose,
}) => {
  if (!selectedDay) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg animate-in fade-in duration-300 mb-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-medium text-white">
          {editingEvent
            ? "Edytuj wydarzenie"
            : `Dodaj wydarzenie na ${format(selectedDay, "d LLLL yyyy", {
                locale: pl,
              })}`}
        </p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-400 transition-colors duration-200 text-xl"
        >
          ✕
        </button>
      </div>
      <input
        type="text"
        placeholder="Tytuł"
        value={newEventTitle}
        onChange={(e) => setNewEventTitle(e.target.value)}
        className="w-full p-3 mb-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
      />
      <input
        type="time"
        value={newEventTime}
        onChange={(e) => setNewEventTime(e.target.value)}
        className="w-full p-3 mb-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
      />
      <textarea
        placeholder="Opis (opcjonalnie)"
        value={newEventDescription}
        onChange={(e) => setNewEventDescription(e.target.value)}
        className="w-full p-3 mb-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none h-24"
      />
      <button
        onClick={onSave}
        className="w-full p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-[0_0_10px_rgba(37,99,235,0.3)]"
      >
        {editingEvent ? "Zapisz zmiany" : "Dodaj wydarzenie"}
      </button>
      {editingEvent && (
        <button
          onClick={onCancel}
          className="w-full p-3 mt-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
        >
          Anuluj
        </button>
      )}
    </div>
  );
};

export default EventForm;