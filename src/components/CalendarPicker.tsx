'use client';

import { useState, useEffect } from 'react';

interface CalendarPickerProps {
    selectedDate?: Date;
    minDate?: Date;
    maxDate?: Date;
    onSelect: (date: Date) => void;
}

export default function CalendarPicker({ selectedDate, minDate, maxDate, onSelect }: CalendarPickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        } else if (minDate) {
            setCurrentMonth(new Date(minDate));
        }
    }, [selectedDate, minDate]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        // Validation
        if (minDate && clickedDate < new Date(minDate.setHours(0, 0, 0, 0))) return;
        if (maxDate && clickedDate > new Date(maxDate.setHours(23, 59, 59, 999))) return;

        onSelect(clickedDate);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newDate);
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const isDateDisabled = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
        if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
        return false;
    };

    const isDateSelected = (day: number) => {
        if (!selectedDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date.toDateString() === selectedDate.toDateString();
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4 w-full max-w-xs shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="font-medium text-slate-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs text-slate-400 font-medium">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const disabled = isDateDisabled(day);
                    const selected = isDateSelected(day);

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleDateClick(day)}
                            className={`
                                h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors
                                ${disabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-blue-50 text-slate-700'}
                                ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                ${!disabled && !selected ? 'hover:bg-slate-100' : ''}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
