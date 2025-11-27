'use client';

import { useState, useEffect } from 'react';
import type { Employee, Equipment, ResourceMaster } from '@/lib/models';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Employee> | Partial<Equipment>) => Promise<void>;
    resourceType: 'employee' | 'equipment';
    mode: 'add' | 'edit';
    resource?: Employee | Equipment | null;
}

// Move this function outside the component to avoid hoisting issues
const getDefaultFormData = (type: 'employee' | 'equipment') => {
    if (type === 'employee') {
        return {
            resourceMasterId: '',
            name: '',
            employeeNumber: '',
            governmentId: '',
            tier: 1,
            position: '',
            location: '',
            experience: 0,
            skills: [],
            certifications: [],
            availability: 'available',
            wage: 0,
            costPerHour: 0,
            isIndirect: false,
            utilization: 0
        };
    } else {
        return {
            resourceMasterId: '',
            name: '',
            make: '',
            model: '',
            year: new Date().getFullYear(),
            location: '',
            availability: 'available',
            value: 0,
            costPerHour: 0,
            depreciationRate: 0,
            utilization: 0,
            maintenance: 'current',
            lastMaintenance: new Date().toISOString().split('T')[0],
            nextMaintenance: new Date().toISOString().split('T')[0]
        };
    }
};

export default function ResourceModal({
    isOpen,
    onClose,
    onSave,
    resourceType,
    mode,
    resource
}: ResourceModalProps) {
    const [formData, setFormData] = useState<any>(() => {
        // Initialize with default data immediately
        if (mode === 'edit' && resource) {
            return resource;
        }
        return getDefaultFormData(resourceType);
    });
    const [resourceMasters, setResourceMasters] = useState<ResourceMaster[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data when modal opens or resource changes
    useEffect(() => {
        console.log('ResourceModal useEffect:', { isOpen, mode, resourceType, resource });
        if (isOpen) {
            fetchResourceMasters();
            if (mode === 'edit' && resource) {
                console.log('Setting formData to resource:', resource);
                setFormData(resource);
            } else {
                // Reset form for add mode
                const defaultData = getDefaultFormData(resourceType);
                console.log('Setting formData to default:', defaultData);
                setFormData(defaultData);
            }
            setError(null);
        }
    }, [isOpen, mode, resource, resourceType]);

    const fetchResourceMasters = async () => {
        try {
            const response = await fetch('/api/resource-masters');
            const result = await response.json();
            if (result.success) {
                setResourceMasters(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch resource masters:', error);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;

        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setFormData((prev: any) => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        setFormData((prev: any) => ({
            ...prev,
            skills
        }));
    };

    const handleCertificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const certifications = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        setFormData((prev: any) => ({
            ...prev,
            certifications
        }));
    };

    const validateForm = (): boolean => {
        if (resourceType === 'employee') {
            if (!formData.name || !formData.position) {
                setError('Name and position are required');
                return false;
            }
        } else {
            if (!formData.name || !formData.make || !formData.model) {
                setError('Name, make, and model are required');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Generate avatar for employees
            if (resourceType === 'employee' && mode === 'add') {
                const nameParts = formData.name.split(' ');
                const initials = nameParts.length > 1
                    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                    : formData.name.substring(0, 2).toUpperCase();

                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                formData.avatar = {
                    initials,
                    color
                };
            }

            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save resource');
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
                        <h3 className="text-lg font-semibold text-slate-900">
                            {mode === 'add' ? 'Add New' : 'Edit'} {resourceType === 'employee' ? 'Employee' : 'Equipment'}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
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
                        {/* Employee Form */}
                        {resourceType === 'employee' && (
                            <>
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Resource Type *</label>
                                            <select
                                                name="resourceMasterId"
                                                value={formData.resourceMasterId || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {resourceMasters
                                                    .filter(m => m.resourceType === 'manpower')
                                                    .map(m => (
                                                        <option key={m.resourceId} value={m.resourceId}>
                                                            {m.resourceName}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Position *</label>
                                            <input
                                                type="text"
                                                name="position"
                                                value={formData.position || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="e.g., Senior Welder"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience *</label>
                                            <input
                                                type="number"
                                                name="experience"
                                                value={formData.experience || 0}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Identification & Tier */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Identification & Tier</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Employee Number</label>
                                            <input
                                                type="text"
                                                name="employeeNumber"
                                                value={formData.employeeNumber || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="EMP-001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Government ID</label>
                                            <input
                                                type="text"
                                                name="governmentId"
                                                value={formData.governmentId || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="ID Number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Tier (1-5)</label>
                                            <select
                                                name="tier"
                                                value={formData.tier || 1}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="1">Tier 1 (Lowest)</option>
                                                <option value="2">Tier 2</option>
                                                <option value="3">Tier 3</option>
                                                <option value="4">Tier 4</option>
                                                <option value="5">Tier 5 (Highest)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills & Certifications */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Skills & Certifications</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Skills *</label>
                                            <input
                                                type="text"
                                                value={formData.skills?.join(', ') || ''}
                                                onChange={handleSkillsChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="e.g., TIG Welding, MIG Welding, Blueprint Reading (comma separated)"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Enter skills separated by commas</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Certifications</label>
                                            <input
                                                type="text"
                                                value={formData.certifications?.join(', ') || ''}
                                                onChange={handleCertificationsChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="e.g., AWS D1.1, OSHA 30 (comma separated)"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Enter certifications separated by commas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Compensation & Cost */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Compensation & Cost</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Annual Salary/Wage *</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                                <input
                                                    type="number"
                                                    name="wage"
                                                    value={formData.wage || 0}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Annual salary or hourly wage</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Cost Per Hour *</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                                <input
                                                    type="number"
                                                    name="costPerHour"
                                                    value={formData.costPerHour || 0}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Actual cost per hour to company (includes benefits, overhead)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Availability</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Status *</label>
                                            <select
                                                name="availability"
                                                value={formData.availability || 'available'}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="available">Available</option>
                                                <option value="busy">Busy</option>
                                                <option value="unavailable">Unavailable</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Is Indirect Resource?</label>
                                            <select
                                                name="isIndirect"
                                                value={formData.isIndirect ? 'true' : 'false'}
                                                onChange={(e) => setFormData((prev: any) => ({ ...prev, isIndirect: e.target.value === 'true' }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="false">No (Direct Labor)</option>
                                                <option value="true">Yes (Supervisory/Management)</option>
                                            </select>
                                            <p className="text-xs text-slate-500 mt-1">Indirect resources are supervisory or management staff</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Equipment Form */}
                        {resourceType === 'equipment' && (
                            <>
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Resource Type *</label>
                                            <select
                                                name="resourceMasterId"
                                                value={formData.resourceMasterId || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {resourceMasters
                                                    .filter(m => m.resourceType === 'equipment')
                                                    .map(m => (
                                                        <option key={m.resourceId} value={m.resourceId}>
                                                            {m.resourceName}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="e.g., Excavator #1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Make *</label>
                                            <input
                                                type="text"
                                                name="make"
                                                value={formData.make || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="e.g., Caterpillar"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                                            <input
                                                type="text"
                                                name="model"
                                                value={formData.model || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="e.g., 320D"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                                            <input
                                                type="number"
                                                name="year"
                                                value={formData.year || new Date().getFullYear()}
                                                onChange={handleInputChange}
                                                min="1900"
                                                max="2100"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                placeholder="2020"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cost Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Cost Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Acquisition Cost *</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                                <input
                                                    type="number"
                                                    name="value"
                                                    value={formData.value || 0}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Purchase or current value of equipment</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Cost Per Hour *</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                                <input
                                                    type="number"
                                                    name="costPerHour"
                                                    value={formData.costPerHour || 0}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Operating cost per hour (fuel, maintenance, depreciation)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Depreciation Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="depreciationRate"
                                                    value={formData.depreciationRate || 0}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="10"
                                                />
                                                <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Annual depreciation percentage</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Maintenance & Availability */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Maintenance & Availability</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Last Maintenance Date</label>
                                            <input
                                                type="date"
                                                name="lastMaintenance"
                                                value={formData.lastMaintenance ? new Date(formData.lastMaintenance).toISOString().split('T')[0] : ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Next Maintenance Date</label>
                                            <input
                                                type="date"
                                                name="nextMaintenance"
                                                value={formData.nextMaintenance ? new Date(formData.nextMaintenance).toISOString().split('T')[0] : ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Status *</label>
                                            <select
                                                name="availability"
                                                value={formData.availability || 'available'}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="available">Available</option>
                                                <option value="busy">In Use</option>
                                                <option value="maintenance">Under Maintenance</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
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
                                <span>{loading ? 'Saving...' : mode === 'add' ? 'Add' : 'Update'} {resourceType === 'employee' ? 'Employee' : 'Equipment'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}
