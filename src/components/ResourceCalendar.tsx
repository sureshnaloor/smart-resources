import React from 'react';
import { Assignment, Project } from '@/lib/models';

interface ResourceCalendarProps {
    assignments: Assignment[];
    projects: Project[];
}

export default function ResourceCalendar({ assignments, projects }: ResourceCalendarProps) {
    const [hoveredDate, setHoveredDate] = React.useState<{ date: string; projectName: string } | null>(null);

    // Generate 12 months starting from current month
    const months = React.useMemo(() => {
        const result = [];
        const today = new Date();
        // Start from the first day of the current month
        let current = new Date(today.getFullYear(), today.getMonth(), 1);

        for (let i = 0; i < 12; i++) {
            result.push(new Date(current));
            current.setMonth(current.getMonth() + 1);
        }
        return result;
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const result = [];
        for (let i = 1; i <= days; i++) {
            result.push(new Date(year, month, i));
        }
        return result;
    };

    const getAssignmentForDate = (date: Date) => {
        // Normalize date to YYYY-MM-DD for comparison
        const dateStr = date.toISOString().split('T')[0];

        // Find assignment that covers this date
        const assignment = assignments.find(a => {
            const start = new Date(a.startDate).toISOString().split('T')[0];
            const end = new Date(a.endDate).toISOString().split('T')[0];
            return dateStr >= start && dateStr <= end;
        });

        if (assignment) {
            const project = projects.find(p => p.id === assignment.projectId);
            return {
                isAssigned: true,
                projectName: project ? project.name : 'Unknown Project',
                assignment
            };
        }

        return { isAssigned: false, projectName: null };
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    return (
        <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">12-Month Utilization Forecast</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((monthDate, monthIdx) => {
                    const days = getDaysInMonth(monthDate);
                    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

                    // Calculate offset for first day of month to align correctly in grid (Sun-Sat)
                    const firstDayOffset = days[0].getDay();

                    return (
                        <div key={monthIdx} className="border rounded-lg p-3 bg-white shadow-sm">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 text-center">{monthName}</h5>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={i} className="text-[10px] text-gray-400 font-medium">{d}</div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Empty cells for offset */}
                                {Array.from({ length: firstDayOffset }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square"></div>
                                ))}

                                {days.map((date, dayIdx) => {
                                    const { isAssigned, projectName } = getAssignmentForDate(date);
                                    const dateStr = date.toISOString().split('T')[0];

                                    // Determine background color
                                    let bgClass = 'bg-red-50 text-red-800'; // Default: Bench (Light Red)
                                    if (isAssigned) {
                                        bgClass = 'bg-green-500 text-white'; // Assigned (Green)
                                    } else if (isWeekend(date)) {
                                        // Optional: Make weekends slightly different if needed, but user said "bench" is light red.
                                        // We'll keep it light red for now as requested, maybe slightly darker red or gray if needed later.
                                        // For now, sticking to the requirement: "whenever employee... is not assigned... it should show in 'light red'"
                                        bgClass = 'bg-red-50 text-red-800';
                                    }

                                    return (
                                        <div
                                            key={dayIdx}
                                            className={`
                                                aspect-square flex items-center justify-center text-xs rounded-sm cursor-default relative group
                                                ${bgClass}
                                            `}
                                            onMouseEnter={() => isAssigned && setHoveredDate({ date: dateStr, projectName: projectName || '' })}
                                            onMouseLeave={() => setHoveredDate(null)}
                                        >
                                            {date.getDate()}

                                            {/* Tooltip */}
                                            {isAssigned && (
                                                <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-10 shadow-lg">
                                                    {projectName}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span>Assigned</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-50 rounded-sm border border-red-100"></div>
                    <span>Bench / Unassigned</span>
                </div>
            </div>
        </div>
    );
}
