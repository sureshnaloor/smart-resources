'use client';

import { useState, useEffect } from 'react';
import { ResourceMaster } from '@/lib/models';

interface ResourceMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    master?: ResourceMaster;
}

export default function ResourceMasterModal({ isOpen, onClose, onSave, master }: ResourceMasterModalProps) {
    const [formData, setFormData] = useState<Partial<ResourceMaster>>({
        resourceName: '',
        description: '',
        resourceType: 'manpower',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (master) {
                setFormData({
                    resourceName: master.resourceName,
                    description: master.description,
                    resourceType: master.resourceType,
                });
            } else {
                setFormData({
                    resourceName: '',
                    description: '',
                    resourceType: 'manpower',
                });
            }
            setError(null);
        }
    }, [isOpen, master]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = master
                ? `/api/resource-masters/${master.resourceId}`
                : '/api/resource-masters';
            const method = master ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                onSave();
                onClose();
            } else {
                setError(result.error || 'Failed to save resource master');
            }
        } catch (err) {
            setError('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {master ? 'Edit Resource Master' : 'New Resource Master'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Resource Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.resourceName}
                            onChange={(e) => setFormData({ ...formData, resourceName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g., Senior Welder"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Type
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="resourceType"
                                    value="manpower"
                                    checked={formData.resourceType === 'manpower'}
                                    onChange={(e) => setFormData({ ...formData, resourceType: 'manpower' })}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Manpower</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="resourceType"
                                    value="equipment"
                                    checked={formData.resourceType === 'equipment'}
                                    onChange={(e) => setFormData({ ...formData, resourceType: 'equipment' })}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Equipment</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            placeholder="Description of the resource type..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            <span>{master ? 'Update Master' : 'Create Master'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
