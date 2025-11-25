'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/lib/models';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Project>) => Promise<void>;
    mode: 'add' | 'edit';
    project?: Project | null;
}

const getDefaultFormData = () => ({
    name: '',
    location: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
    priority: 'medium',
    status: 'active',
    budget: 0,
    actualCost: 0,
    requiredResources: {
        'Welders': 0,
        'Pipe Fitters': 0,
        'Electricians': 0,
        'Laborers': 0
    }
});

export default function ProjectModal({
    isOpen,
    onClose,
    onSave,
    mode,
    project
}: ProjectModalProps) {
    const [formData, setFormData] = useState<any>(getDefaultFormData());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && project) {
                setFormData({
                    ...project,
                    startDate: new Date(project.startDate).toISOString().split('T')[0],
                    endDate: new Date(project.endDate).toISOString().split('T')[0],
                    requiredResources: {
                        'Welders': 0,
                        'Pipe Fitters': 0,
                        'Electricians': 0,
                        'Laborers': 0,
                        ...project.requiredResources
                    }
                });
            } else {
                setFormData(getDefaultFormData());
            }
            setError(null);
        }
    }, [isOpen, mode, project]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let processedValue: any = value;

        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
        }

        setFormData((prev: any) => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleResourceChange = (resource: string, value: string) => {
        const count = parseInt(value) || 0;
        setFormData((prev: any) => ({
            ...prev,
            requiredResources: {
                ...prev.requiredResources,
                [resource]: count
            }
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name || !formData.location || !formData.startDate || !formData.endDate) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.budget < 0) {
            setError('Budget cannot be negative');
            return false;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('End date must be after start date');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal open">
            <div className="modal-content max-w-3xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'add' ? 'Create New Project' : 'Edit Project'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Project description..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Schedule & Priority */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Schedule & Priority</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="on-hold">On Hold</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Budget & Costs */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Budget & Costs</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="actualCost"
                                            value={formData.actualCost}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Required Resources */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Required Resources</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Welders', 'Pipe Fitters', 'Electricians', 'Laborers'].map((resource) => (
                                    <div key={resource}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{resource}</label>
                                        <input
                                            type="number"
                                            value={formData.requiredResources[resource] || 0}
                                            onChange={(e) => handleResourceChange(resource, e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                <span>{loading ? 'Saving...' : mode === 'add' ? 'Create Project' : 'Update Project'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
