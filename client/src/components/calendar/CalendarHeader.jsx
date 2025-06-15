import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const CalendarHeader = ({ currentDate, onPrev, onNext }) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <button
                onClick={onPrev}
                className="text-gray-400 hover:text-white px-2 py-1"
            >
                &lt;
            </button>
            <h2 className="text-xl font-semibold">
                {format(currentDate, "LLLL yyyy", { locale: pl }).toUpperCase()}
            </h2>
            <button
                onClick={onNext}
                className="text-gray-400 hover:text-white px-2 py-1"
            >
                &gt;
            </button>
        </div>
    );
};

export default CalendarHeader;
