import React, { useMemo, useState } from 'react';
import { Project, Assignment, Employee, Equipment } from '@/lib/models';

interface ProjectAnalysisProps {
    project: Project;
    assignments: Assignment[];
    employees: Employee[];
    equipment: Equipment[];
}

export default function ProjectAnalysis({ project, assignments, employees, equipment }: ProjectAnalysisProps) {
    const [hoveredDay, setHoveredDay] = useState<{
        date: string;
        employees: string[];
        equipment: string[];
        empCount: number;
        eqCount: number;
        x: number;
    } | null>(null);

    // Calculate timeline range
    const { startDate, endDate, days, totalDays } = useMemo(() => {
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const dayList = [];
        const current = new Date(start);

        while (current <= end) {
            dayList.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return {
            startDate: start,
            endDate: end,
            days: dayList,
            totalDays: dayList.length
        };
    }, [project]);

    // Calculate daily stats
    const dailyStats = useMemo(() => {
        return days.map(day => {
            const dateStr = day.toISOString().split('T')[0];

            // Find active assignments for this day
            const activeAssignments = assignments.filter(a => {
                const aStart = new Date(a.startDate).toISOString().split('T')[0];
                const aEnd = new Date(a.endDate).toISOString().split('T')[0];
                return dateStr >= aStart && dateStr <= aEnd;
            });

            const assignedEmployees = activeAssignments
                .filter(a => a.resourceType === 'employee')
                .map(a => employees.find(e => e.id === a.resourceId)?.name || 'Unknown')
                .filter(Boolean);

            const assignedEquipment = activeAssignments
                .filter(a => a.resourceType === 'equipment')
                .map(a => equipment.find(e => e.id === a.resourceId)?.name || 'Unknown')
                .filter(Boolean);

            return {
                date: dateStr,
                employeeCount: assignedEmployees.length,
                equipmentCount: assignedEquipment.length,
                employees: assignedEmployees,
                equipment: assignedEquipment
            };
        });
    }, [days, assignments, employees, equipment]);

    const maxEmployeeCount = Math.max(...dailyStats.map(s => s.employeeCount), 1); // Avoid div by 0
    const maxEquipmentCount = Math.max(...dailyStats.map(s => s.equipmentCount), 1);

    return (
        <div className="glass-card rounded-lg p-6 mb-6 relative">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Analysis</h3>

            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{startDate.toLocaleDateString()}</span>
                    <span className="font-medium text-gray-900">{totalDays} Days Duration</span>
                    <span>{endDate.toLocaleDateString()}</span>
                </div>

                {/* Gantt Bar */}
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-80"></div>
                </div>

            </div>

            {/* Histograms Container */}
            <div className="space-y-6 relative" onMouseLeave={() => setHoveredDay(null)}>

                {/* Manpower Histogram */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Manpower Histogram</h4>
                    <div className="h-24 flex items-end">
                        {dailyStats.map((stat, idx) => {
                            const heightPercent = (stat.employeeCount / maxEmployeeCount) * 100;
                            return (
                                <div
                                    key={idx}
                                    className="flex-1 bg-blue-400 hover:bg-blue-600 transition-colors rounded-t-sm relative group"
                                    style={{ height: `${heightPercent || 0}%`, minHeight: heightPercent > 0 ? '1px' : '0' }}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                        if (parentRect) {
                                            setHoveredDay({
                                                ...stat,
                                                empCount: stat.employeeCount,
                                                eqCount: stat.equipmentCount,
                                                x: rect.left - parentRect.left + (rect.width / 2)
                                            });
                                        }
                                    }}
                                >
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Equipment Histogram */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Equipment Histogram</h4>
                    <div className="h-24 flex items-end">
                        {dailyStats.map((stat, idx) => {
                            const heightPercent = (stat.equipmentCount / maxEquipmentCount) * 100;
                            return (
                                <div
                                    key={idx}
                                    className="flex-1 bg-amber-400 hover:bg-amber-600 transition-colors rounded-t-sm relative group"
                                    style={{ height: `${heightPercent || 0}%`, minHeight: heightPercent > 0 ? '1px' : '0' }}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                        if (parentRect) {
                                            setHoveredDay({
                                                ...stat,
                                                empCount: stat.employeeCount,
                                                eqCount: stat.equipmentCount,
                                                x: rect.left - parentRect.left + (rect.width / 2)
                                            });
                                        }
                                    }}
                                >
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Shared Tooltip Overlay */}
                {hoveredDay && (
                    <div
                        className="absolute top-0 z-20 pointer-events-none transform -translate-x-1/2 transition-all duration-75"
                        style={{ left: hoveredDay.x }}
                    >
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl w-48">
                            <p className="font-bold mb-2 border-b border-gray-700 pb-1">{hoveredDay.date}</p>

                            <div className="mb-2">
                                <p className="text-blue-300 font-semibold mb-1">Manpower ({hoveredDay.empCount})</p>
                                {hoveredDay.employees.length > 0 ? (
                                    <ul className="list-disc list-inside text-gray-300 text-[10px] max-h-20 overflow-hidden">
                                        {hoveredDay.employees.slice(0, 5).map((name, i) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                        {hoveredDay.employees.length > 5 && <li>+{hoveredDay.employees.length - 5} more</li>}
                                    </ul>
                                ) : <span className="text-gray-500 italic">None</span>}
                            </div>

                            <div>
                                <p className="text-amber-300 font-semibold mb-1">Equipment ({hoveredDay.eqCount})</p>
                                {hoveredDay.equipment.length > 0 ? (
                                    <ul className="list-disc list-inside text-gray-300 text-[10px] max-h-20 overflow-hidden">
                                        {hoveredDay.equipment.slice(0, 5).map((name, i) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                        {hoveredDay.equipment.length > 5 && <li>+{hoveredDay.equipment.length - 5} more</li>}
                                    </ul>
                                ) : <span className="text-gray-500 italic">None</span>}
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 mx-auto"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
