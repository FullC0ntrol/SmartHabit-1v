import React from "react";

const days = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];

const CalendarGrid = ({
  currentDate,
  today,
  events,
  selectedDay,
  firstDay,
  monthDays,
  onDayClick,
}) => {
  return (
    <>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-300 mb-4">
        {days.map((day, idx) => (
          <div key={idx} className="uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {[...Array(firstDay).fill(null)].map((_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}

        {[...Array(monthDays)].map((_, i) => {
          const day = i + 1;
          const isToday =
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

          const hasEvent = events.some(
            (event) =>
              event.date.getDate() === day &&
              event.date.getMonth() === currentDate.getMonth() &&
              event.date.getFullYear() === currentDate.getFullYear()
          );

          const isSelected =
            selectedDay &&
            selectedDay.getDate() === day &&
            selectedDay.getMonth() === currentDate.getMonth() &&
            selectedDay.getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={`day-${i}`}
              onClick={() => onDayClick(day)}
              className={`h-12 w-12 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative mx-auto
                ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.7)] animate-pulse"
                    : isToday
                    ? "bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                    : hasEvent
                    ? "bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    : "text-gray-200 hover:bg-gray-700 hover:scale-110 hover:shadow-[0_0_5px_rgba(255,255,255,0.2)]"
                }`}
            >
              <span className="text-sm font-medium">{day}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CalendarGrid;