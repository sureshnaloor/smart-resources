'use client';

import { useState, useEffect } from 'react';
import { Project, ResourceMaster } from '@/lib/models';
import CalendarPicker from './CalendarPicker';

interface ResourceRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    project: Project;
}

interface RequirementItem {
    resourceMasterId: string;
    quantity: number;
    startDate?: Date;
    endDate?: Date;
    showStartPicker?: boolean;
    showEndPicker?: boolean;
}

export default function ResourceRequirementModal({ isOpen, onClose, onSave, project }: ResourceRequirementModalProps) {
    const [requirements, setRequirements] = useState<RequirementItem[]>([]);
    const [resourceMasters, setResourceMasters] = useState<ResourceMaster[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingMasters, setFetchingMasters] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchResourceMasters();
            // Initialize requirements with parsed dates
            const initialReqs = (project.resourceRequirements || []).map(req => ({
                ...req,
                startDate: req.startDate ? new Date(req.startDate) : new Date(project.startDate),
                endDate: req.endDate ? new Date(req.endDate) : new Date(project.endDate),
                showStartPicker: false,
                showEndPicker: false
            }));
            setRequirements(initialReqs);
            setError(null);
        }
    }, [isOpen, project]);

    const fetchResourceMasters = async () => {
        try {
            const response = await fetch('/api/resource-masters');
            const result = await response.json();
            if (result.success) {
                setResourceMasters(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch resource masters:', error);
            setError('Failed to load resource options');
        } finally {
            setFetchingMasters(false);
        }
    };

    const handleAddRequirement = () => {
        setRequirements([...requirements, {
            resourceMasterId: '',
            quantity: 1,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
            showStartPicker: false,
            showEndPicker: false
        }]);
    };

    const handleRemoveRequirement = (index: number) => {
        const newRequirements = [...requirements];
        newRequirements.splice(index, 1);
        setRequirements(newRequirements);
    };

    const handleRequirementChange = (index: number, field: keyof RequirementItem, value: any) => {
        const newRequirements = [...requirements];
        newRequirements[index] = { ...newRequirements[index], [field]: value };

        // Close pickers when a date is selected
        if (field === 'startDate') newRequirements[index].showStartPicker = false;
        if (field === 'endDate') newRequirements[index].showEndPicker = false;

        setRequirements(newRequirements);
    };

    const togglePicker = (index: number, type: 'start' | 'end') => {
        const newRequirements = [...requirements];
        if (type === 'start') {
            newRequirements[index].showStartPicker = !newRequirements[index].showStartPicker;
            newRequirements[index].showEndPicker = false;
        } else {
            newRequirements[index].showEndPicker = !newRequirements[index].showEndPicker;
            newRequirements[index].showStartPicker = false;
        }
        setRequirements(newRequirements);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate
        const isValid = requirements.every(req => req.resourceMasterId && req.quantity > 0);
        if (!isValid) {
            setError('Please select a resource and valid quantity for all items');
            setLoading(false);
            return;
        }

        try {
            // Clean up UI state before saving
            const cleanRequirements = requirements.map(({ showStartPicker, showEndPicker, ...req }) => req);

            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resourceRequirements: cleanRequirements,
                }),
            });

            const result = await response.json();

            if (result.success) {
                onSave();
                onClose();
            } else {
                setError(result.error || 'Failed to save requirements');
            }
        } catch (err) {
            setError('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Resource Requirements</h2>
                        <p className="text-sm text-slate-500">{project.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {requirements.map((req, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex-[2]">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Resource Type</label>
                                    <select
                                        value={req.resourceMasterId}
                                        onChange={(e) => handleRequirementChange(index, 'resourceMasterId', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                        required
                                    >
                                        <option value="">Select Resource...</option>
                                        {resourceMasters.map((master) => (
                                            <option key={master.resourceId} value={master.resourceId}>
                                                {master.resourceName} ({master.resourceType})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={req.quantity}
                                        onChange={(e) => handleRequirementChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="flex-1 relative">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                                    <button
                                        type="button"
                                        onClick={() => togglePicker(index, 'start')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left text-sm text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        {req.startDate ? new Date(req.startDate).toLocaleDateString() : 'Select'}
                                    </button>
                                    {req.showStartPicker && (
                                        <div className="absolute top-full left-0 mt-2 z-50 shadow-xl min-w-[280px]">
                                            <CalendarPicker
                                                selectedDate={req.startDate ? new Date(req.startDate) : undefined}
                                                minDate={project.startDate ? new Date(project.startDate) : undefined}
                                                maxDate={req.endDate ? new Date(req.endDate) : (project.endDate ? new Date(project.endDate) : undefined)}
                                                onSelect={(date) => handleRequirementChange(index, 'startDate', date)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 relative">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                                    <button
                                        type="button"
                                        onClick={() => togglePicker(index, 'end')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left text-sm text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        {req.endDate ? new Date(req.endDate).toLocaleDateString() : 'Select'}
                                    </button>
                                    {req.showEndPicker && (
                                        <div className="absolute top-full right-0 mt-2 z-50 shadow-xl min-w-[280px]">
                                            <CalendarPicker
                                                selectedDate={req.endDate ? new Date(req.endDate) : undefined}
                                                minDate={req.startDate ? new Date(req.startDate) : (project.startDate ? new Date(project.startDate) : undefined)}
                                                maxDate={project.endDate ? new Date(project.endDate) : undefined}
                                                onSelect={(date) => handleRequirementChange(index, 'endDate', date)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemoveRequirement(index)}
                                    className="mt-6 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {requirements.length === 0 && (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                No resource requirements defined yet.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleAddRequirement}
                            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Requirement</span>
                        </button>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || fetchingMasters}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            <span>Save Requirements</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
