'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import LiquidBackground from '@/components/LiquidBackground';
import { Project, Employee, Equipment, Assignment } from '@/lib/models';
import CalendarPicker from '@/components/CalendarPicker';

export default function AssignmentsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [filterText, setFilterText] = useState('');
    const [loading, setLoading] = useState(true);
    const [draggedResource, setDraggedResource] = useState<{ id: string, type: 'employee' | 'equipment' } | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedProjectId && startDate && endDate) {
            fetchAssignments();
        }
    }, [selectedProjectId, startDate, endDate]);

    const fetchInitialData = async () => {
        try {
            const [projectsRes, employeesRes, equipmentRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/employees'),
                fetch('/api/equipment')
            ]);

            const projectsData = await projectsRes.json();
            const employeesData = await employeesRes.json();
            const equipmentData = await equipmentRes.json();

            if (projectsData.success) setProjects(projectsData.data);
            if (employeesData.success) setEmployees(employeesData.data);
            if (equipmentData.success) setEquipment(equipmentData.data);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        if (!startDate || !endDate) return;

        try {
            const query = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            const response = await fetch(`/api/assignments?${query}`);
            const result = await response.json();

            if (result.success) {
                setAssignments(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string, type: 'employee' | 'equipment') => {
        setDraggedResource({ id, type });
        e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedResource || !selectedProjectId || !startDate || !endDate) return;

        try {
            const response = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    resourceId: draggedResource.id,
                    resourceType: draggedResource.type,
                    startDate,
                    endDate
                })
            });

            const result = await response.json();
            if (result.success) {
                setAssignments([...assignments, result.data]);
                setDraggedResource(null);
            }
        } catch (error) {
            console.error('Failed to create assignment:', error);
        }
    };

    const isResourceAssigned = (id: string) => {
        return assignments.some(a => a.resourceId === id);
    };

    const availableEmployees = employees.filter(e =>
        !isResourceAssigned(e.id) &&
        (e.name.toLowerCase().includes(filterText.toLowerCase()) ||
            e.position.toLowerCase().includes(filterText.toLowerCase()))
    );

    const availableEquipment = equipment.filter(e =>
        !isResourceAssigned(e.id) &&
        (e.name.toLowerCase().includes(filterText.toLowerCase()) ||
            e.type.toLowerCase().includes(filterText.toLowerCase()))
    );

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const projectAssignments = assignments.filter(a => a.projectId === selectedProjectId);

    return (
        <>
            <LiquidBackground />
            <Navigation />

            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8 fade-in-up">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Resource Assignment</h1>
                            <p className="text-blue-100 mt-1">Assign resources to projects efficiently</p>
                        </div>
                    </div>

                    {/* Selection Controls */}
                    <div className="glass-card rounded-xl p-6 mb-8 fade-in-up relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <button
                                    onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
                                    className="w-full px-4 py-2 text-left rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {startDate ? startDate.toLocaleDateString() : 'Select Start Date'}
                                </button>
                                {showStartPicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <CalendarPicker
                                            selectedDate={startDate}
                                            onSelect={(date) => { setStartDate(date); setShowStartPicker(false); }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <button
                                    onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
                                    className="w-full px-4 py-2 text-left rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {endDate ? endDate.toLocaleDateString() : 'Select End Date'}
                                </button>
                                {showEndPicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <CalendarPicker
                                            selectedDate={endDate}
                                            minDate={startDate}
                                            onSelect={(date) => { setEndDate(date); setShowEndPicker(false); }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {selectedProjectId && startDate && endDate ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                            {/* Left: Project Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="glass-card rounded-xl p-6 flex flex-col h-full border-2 border-dashed border-transparent hover:border-blue-400 transition-colors"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                    {selectedProject?.name}
                                    <span className="ml-auto text-sm font-normal text-gray-500">
                                        {projectAssignments.length} Assigned
                                    </span>
                                </h2>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {projectAssignments.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p>Drag resources here to assign</p>
                                        </div>
                                    ) : (
                                        projectAssignments.map((assignment) => {
                                            const resource = assignment.resourceType === 'employee'
                                                ? employees.find(e => e.id === assignment.resourceId)
                                                : equipment.find(e => e.id === assignment.resourceId);

                                            if (!resource) return null;

                                            return (
                                                <div key={assignment._id?.toString()} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${assignment.resourceType === 'employee' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {assignment.resourceType === 'employee' ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{resource.name}</p>
                                                            <p className="text-xs text-gray-500 capitalize">{assignment.resourceType}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Right: Available Resources */}
                            <div className="glass-card rounded-xl p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Available Resources</h2>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search resources..."
                                            value={filterText}
                                            onChange={(e) => setFilterText(e.target.value)}
                                            className="pl-8 pr-4 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {/* Employees */}
                                    {availableEmployees.map(emp => (
                                        <div
                                            key={emp.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, emp.id, 'employee')}
                                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow flex items-center justify-between group"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{emp.name}</p>
                                                    <p className="text-xs text-gray-500">{emp.position}</p>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Equipment */}
                                    {availableEquipment.map(eq => (
                                        <div
                                            key={eq.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, eq.id, 'equipment')}
                                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow flex items-center justify-between group"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{eq.name}</p>
                                                    <p className="text-xs text-gray-500">{eq.type}</p>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}

                                    {availableEmployees.length === 0 && availableEquipment.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No available resources found for this period.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select Project and Dates</h3>
                            <p className="text-gray-600">Please select a project and date range to start assigning resources.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
