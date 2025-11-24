'use client';

import { useState, useEffect } from 'react';
import type { BusinessCenter } from '@/lib/models';

interface BusinessCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<BusinessCenter>) => Promise<void>;
    businessCenter?: BusinessCenter | null;
    mode: 'add' | 'edit';
}

export default function BusinessCenterModal({
    isOpen,
    onClose,
    onSave,
    businessCenter,
    mode
}: BusinessCenterModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Office',
        capacity: 0,
        currentOccupancy: 0,
        manager: '',
        contact: '',
        location: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (businessCenter && mode === 'edit') {
            setFormData({
                name: businessCenter.name || '',
                type: businessCenter.type || 'Office',
                capacity: businessCenter.capacity || 0,
                currentOccupancy: businessCenter.currentOccupancy || 0,
                manager: businessCenter.manager || '',
                contact: businessCenter.contact || '',
                location: businessCenter.location || ''
            });
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                type: 'Office',
                capacity: 0,
                currentOccupancy: 0,
                manager: '',
                contact: '',
                location: ''
            });
        }
        setErrors({});
    }, [businessCenter, mode, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.type.trim()) {
            newErrors.type = 'Type is required';
        }
        if (formData.capacity <= 0) {
            newErrors.capacity = 'Capacity must be greater than 0';
        }
        if (formData.currentOccupancy < 0) {
            newErrors.currentOccupancy = 'Current occupancy cannot be negative';
        }
        if (formData.currentOccupancy > formData.capacity) {
            newErrors.currentOccupancy = 'Current occupancy cannot exceed capacity';
        }
        if (!formData.manager.trim()) {
            newErrors.manager = 'Manager is required';
        }
        if (!formData.contact.trim()) {
            newErrors.contact = 'Contact is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving business center:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' || name === 'currentOccupancy' ? Number(value) : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal open">
            <div className="modal-content max-w-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'add' ? 'Add New Business Center' : 'Edit Business Center'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isSubmitting}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="e.g., Downtown Office"
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="Office">Office</option>
                                        <option value="Warehouse">Warehouse</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Distribution">Distribution</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        min="1"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="100"
                                        disabled={isSubmitting}
                                    />
                                    {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Occupancy *
                                    </label>
                                    <input
                                        type="number"
                                        name="currentOccupancy"
                                        value={formData.currentOccupancy}
                                        onChange={handleChange}
                                        min="0"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.currentOccupancy ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="0"
                                        disabled={isSubmitting}
                                    />
                                    {errors.currentOccupancy && <p className="text-xs text-red-500 mt-1">{errors.currentOccupancy}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Management & Contact */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Management & Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manager *
                                    </label>
                                    <input
                                        type="text"
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.manager ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="John Doe"
                                        disabled={isSubmitting}
                                    />
                                    {errors.manager && <p className="text-xs text-red-500 mt-1">{errors.manager}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact *
                                    </label>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.contact ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="email@example.com or +1234567890"
                                        disabled={isSubmitting}
                                    />
                                    {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        placeholder="123 Main St, City, State"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Business Center' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
