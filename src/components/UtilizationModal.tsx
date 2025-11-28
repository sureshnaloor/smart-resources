import React from 'react';
import { Assignment, Project, Employee, Equipment } from '@/lib/models';
import CalendarPicker from './CalendarPicker';
import ResourceCalendar from './ResourceCalendar';

interface UtilizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Employee | Equipment | null;
    assignments: Assignment[];
    projects: Project[];
}

export default function UtilizationModal({ isOpen, onClose, resource, assignments, projects }: UtilizationModalProps) {
    if (!isOpen || !resource) return null;

    const [editingAssignmentId, setEditingAssignmentId] = React.useState<string | null>(null);
    const [editSchedule, setEditSchedule] = React.useState<{ startDate: string; endDate: string }[]>([]);
    const [originalRange, setOriginalRange] = React.useState<{ startDate: Date; endDate: Date } | null>(null);
    const [activeDatePicker, setActiveDatePicker] = React.useState<{ index: number; field: 'startDate' | 'endDate' } | null>(null);

    const getProjectName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'Unknown Project';
    };

    // Sort assignments by start date (newest first)
    const sortedAssignments = [...assignments].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const formatDate = (dateString: string | Date) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
    };

    const handleEditClick = (assignment: Assignment) => {
        setEditingAssignmentId(assignment._id?.toString() || null);
        setOriginalRange({
            startDate: new Date(assignment.startDate),
            endDate: new Date(assignment.endDate)
        });

        if (assignment.schedule && assignment.schedule.length > 0) {
            setEditSchedule(assignment.schedule.map(s => ({
                startDate: new Date(s.startDate).toISOString().split('T')[0],
                endDate: new Date(s.endDate).toISOString().split('T')[0]
            })));
        } else {
            setEditSchedule([{
                startDate: new Date(assignment.startDate).toISOString().split('T')[0],
                endDate: new Date(assignment.endDate).toISOString().split('T')[0]
            }]);
        }
    };

    const handleSplitRange = (index: number) => {
        const currentRange = editSchedule[index];
        const currentEnd = new Date(currentRange.endDate);

        // Calculate new start date (day after current end)
        const newStart = new Date(currentEnd);
        newStart.setDate(newStart.getDate() + 1);

        // If new start is beyond original end, just use original end (user will have to adjust)
        if (originalRange && newStart > originalRange.endDate) {
            newStart.setTime(originalRange.endDate.getTime());
        }

        const newStartStr = newStart.toISOString().split('T')[0];

        const newSchedule = [...editSchedule];
        newSchedule.splice(index + 1, 0, {
            startDate: newStartStr,
            endDate: newStartStr
        });
        setEditSchedule(newSchedule);
    };

    const handleRemoveRange = (index: number) => {
        if (editSchedule.length <= 1) return;
        const newSchedule = editSchedule.filter((_, i) => i !== index);
        setEditSchedule(newSchedule);
    };

    const handleDateSelect = (date: Date) => {
        if (!activeDatePicker) return;
        const { index, field } = activeDatePicker;
        const newSchedule = [...editSchedule];

        // Adjust date to local timezone
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        const dateStr = localDate.toISOString().split('T')[0];

        if (field === 'startDate') {
            newSchedule[index].startDate = dateStr;
            // Auto-adjust end date if start is after end
            if (new Date(dateStr) > new Date(newSchedule[index].endDate)) {
                newSchedule[index].endDate = dateStr;
            }
        } else {
            newSchedule[index].endDate = dateStr;
            // Auto-adjust start date if end is before start (shouldn't happen with minDate but good safety)
            if (new Date(dateStr) < new Date(newSchedule[index].startDate)) {
                newSchedule[index].startDate = dateStr;
            }
        }

        setEditSchedule(newSchedule);
        setActiveDatePicker(null);
    };

    const getMinDate = (index: number, field: 'startDate' | 'endDate') => {
        if (!originalRange) return undefined;

        if (field === 'startDate') {
            // Min date is either original start or end of previous range + 1 day
            if (index === 0) return originalRange.startDate;
            const prevEnd = new Date(editSchedule[index - 1].endDate);
            return new Date(prevEnd.getTime() + 86400000);
        } else {
            // Min date is start of this range
            return new Date(editSchedule[index].startDate);
        }
    };

    const getMaxDate = (index: number, field: 'startDate' | 'endDate') => {
        if (!originalRange) return undefined;

        // Max date is always constrained by next range start or original end
        // We DO NOT constrain startDate by current endDate anymore to allow free movement
        if (index === editSchedule.length - 1) return originalRange.endDate;

        const nextStart = new Date(editSchedule[index + 1].startDate);
        // Max is day before next start
        return new Date(nextStart.getTime() - 86400000);
    };

    const handleSave = async () => {
        if (!editingAssignmentId || !originalRange) return;

        // Validation: Ensure all ranges are within original bounds and sequential
        let isValid = true;
        let errorMessage = '';

        for (let i = 0; i < editSchedule.length; i++) {
            const start = new Date(editSchedule[i].startDate);
            const end = new Date(editSchedule[i].endDate);

            if (start > end) {
                isValid = false;
                errorMessage = `Range ${i + 1}: Start date must be before end date.`;
                break;
            }

            if (start < originalRange.startDate || end > originalRange.endDate) {
                isValid = false;
                errorMessage = `Range ${i + 1}: Dates must be within the original assignment period (${formatDate(originalRange.startDate)} - ${formatDate(originalRange.endDate)}).`;
                break;
            }

            if (i > 0) {
                const prevEnd = new Date(editSchedule[i - 1].endDate);
                if (start <= prevEnd) {
                    isValid = false;
                    errorMessage = `Range ${i + 1} overlaps with Range ${i}. Start date must be after previous end date.`;
                    break;
                }
            }
        }

        if (!isValid) {
            alert(errorMessage);
            return;
        }

        try {
            const response = await fetch('/api/assignments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingAssignmentId,
                    schedule: editSchedule.map(s => ({
                        startDate: s.startDate,
                        endDate: s.endDate,
                        status: 'active'
                    }))
                })
            });

            if (response.ok) {
                setEditingAssignmentId(null);
                alert('Schedule updated successfully!');
                onClose();
            } else {
                alert('Failed to update schedule');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Error updating schedule');
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="absolute top-0 right-0 pt-4 pr-4">
                            <button
                                type="button"
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Utilization: {resource.name}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Assignment history and current utilization.
                                    </p>

                                    <ResourceCalendar assignments={assignments} projects={projects} />

                                    {sortedAssignments.length > 0 ? (
                                        <div className="flow-root mt-6">
                                            <ul className="-mb-8">
                                                {sortedAssignments.map((assignment, assignmentIdx) => (
                                                    <li key={assignment._id?.toString() || assignmentIdx}>
                                                        <div className="relative pb-8">
                                                            {assignmentIdx !== sortedAssignments.length - 1 ? (
                                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                            ) : null}
                                                            <div className="relative flex space-x-3">
                                                                <div>
                                                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${new Date(assignment.endDate) < new Date() ? 'bg-gray-400' : 'bg-blue-500'
                                                                        }`}>
                                                                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0 flex-1 pt-1.5">
                                                                    <div className="flex justify-between space-x-4">
                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Assigned to <span className="font-medium text-gray-900">{getProjectName(assignment.projectId)}</span>
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                            {!editingAssignmentId || editingAssignmentId !== assignment._id?.toString() ? (
                                                                                <>
                                                                                    <time dateTime={assignment.startDate.toString()}>{formatDate(assignment.startDate)}</time>
                                                                                    {' - '}
                                                                                    <time dateTime={assignment.endDate.toString()}>{formatDate(assignment.endDate)}</time>
                                                                                    <button
                                                                                        onClick={() => handleEditClick(assignment)}
                                                                                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                                                                                    >
                                                                                        Edit
                                                                                    </button>
                                                                                </>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>

                                                                    {/* Edit Mode */}
                                                                    {editingAssignmentId === assignment._id?.toString() && (
                                                                        <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200 relative">
                                                                            <p className="text-xs text-gray-500 mb-2">Adjust utilization schedule (within original range):</p>
                                                                            {editSchedule.map((range, idx) => (
                                                                                <div key={idx} className="flex items-center space-x-2 mb-2 relative">
                                                                                    <div className="relative">
                                                                                        <input
                                                                                            type="text"
                                                                                            readOnly
                                                                                            value={range.startDate}
                                                                                            onClick={() => setActiveDatePicker({ index: idx, field: 'startDate' })}
                                                                                            className="text-xs border rounded px-1 py-1 w-24 cursor-pointer"
                                                                                        />
                                                                                        {activeDatePicker?.index === idx && activeDatePicker?.field === 'startDate' && (
                                                                                            <>
                                                                                                <div className="fixed inset-0 z-40" onClick={() => setActiveDatePicker(null)}></div>
                                                                                                <div className="absolute top-full left-0 z-50 mt-1">
                                                                                                    <CalendarPicker
                                                                                                        selectedDate={new Date(range.startDate)}
                                                                                                        minDate={getMinDate(idx, 'startDate')}
                                                                                                        maxDate={getMaxDate(idx, 'startDate')}
                                                                                                        onSelect={handleDateSelect}
                                                                                                    />
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="text-gray-400">-</span>
                                                                                    <div className="relative">
                                                                                        <input
                                                                                            type="text"
                                                                                            readOnly
                                                                                            value={range.endDate}
                                                                                            onClick={() => setActiveDatePicker({ index: idx, field: 'endDate' })}
                                                                                            className="text-xs border rounded px-1 py-1 w-24 cursor-pointer"
                                                                                        />
                                                                                        {activeDatePicker?.index === idx && activeDatePicker?.field === 'endDate' && (
                                                                                            <>
                                                                                                <div className="fixed inset-0 z-40" onClick={() => setActiveDatePicker(null)}></div>
                                                                                                <div className="absolute top-full left-0 z-50 mt-1">
                                                                                                    <CalendarPicker
                                                                                                        selectedDate={new Date(range.endDate)}
                                                                                                        minDate={getMinDate(idx, 'endDate')}
                                                                                                        maxDate={getMaxDate(idx, 'endDate')}
                                                                                                        onSelect={handleDateSelect}
                                                                                                    />
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                    <button onClick={() => handleSplitRange(idx)} className="text-blue-600 text-xs" title="Split Range">+</button>
                                                                                    {editSchedule.length > 1 && (
                                                                                        <button onClick={() => handleRemoveRange(idx)} className="text-red-600 text-xs" title="Remove Range">x</button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                            <div className="flex justify-end space-x-2 mt-2">
                                                                                <button
                                                                                    onClick={() => setEditingAssignmentId(null)}
                                                                                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                                <button
                                                                                    onClick={handleSave}
                                                                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                                >
                                                                                    Revise
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Display Schedule Bars if exists */}
                                                                    {assignment.schedule && assignment.schedule.length > 0 && editingAssignmentId !== assignment._id?.toString() && (
                                                                        <div className="mt-2 space-y-1">
                                                                            {assignment.schedule.map((s, i) => (
                                                                                <div key={i} className="flex items-center text-xs text-gray-500">
                                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                                                    <span>{formatDate(s.startDate)} - {formatDate(s.endDate)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic text-center py-4">No assignments found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
