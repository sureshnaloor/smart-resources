'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import BusinessCenterModal from '@/components/BusinessCenterModal';
import ResourceModal from '@/components/ResourceModal';
import { employeesApi, equipmentApi, businessCentersApi } from '@/lib/api-client';
import type { Employee, Equipment, BusinessCenter } from '@/lib/models';

export default function ResourcesPage() {
    const [currentTab, setCurrentTab] = useState<'employees' | 'equipment' | 'centers'>('employees');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [businessCenters, setBusinessCenters] = useState<BusinessCenter[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [resourceType, setResourceType] = useState<'employee' | 'equipment'>('employee');
    const [resourceMode, setResourceMode] = useState<'add' | 'edit'>('add');
    const [selectedResource, setSelectedResource] = useState<Employee | Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Business Center Modal State
    const [showBusinessCenterModal, setShowBusinessCenterModal] = useState(false);
    const [businessCenterMode, setBusinessCenterMode] = useState<'add' | 'edit'>('add');
    const [selectedBusinessCenter, setSelectedBusinessCenter] = useState<BusinessCenter | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; centerId: string | null }>({ show: false, centerId: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [employeesRes, equipmentRes, centersRes] = await Promise.all([
                employeesApi.getAll(),
                equipmentApi.getAll(),
                businessCentersApi.getAll(),
            ]);

            if (employeesRes.success && employeesRes.data) {
                setEmployees(employeesRes.data as Employee[]);
            }
            if (equipmentRes.success && equipmentRes.data) {
                setEquipment(equipmentRes.data as Equipment[]);
            }
            if (centersRes.success && centersRes.data) {
                setBusinessCenters(centersRes.data as BusinessCenter[]);
            }

            // Trigger animations after data is loaded
            import('animejs').then((animeModule) => {
                const anime = animeModule.default;

                setTimeout(() => {
                    anime({
                        targets: '.fade-in-up',
                        translateY: [30, 0],
                        opacity: [0, 1],
                        delay: anime.stagger(100),
                        duration: 600,
                        easing: 'easeOutQuart'
                    });

                    anime({
                        targets: '.resource-card',
                        scale: [0.9, 1],
                        opacity: [0, 1],
                        delay: anime.stagger(50, { start: 300 }),
                        duration: 400,
                        easing: 'easeOutQuart'
                    });
                }, 100);
            });
        } catch (err) {
            setError('Failed to load resources. Please try again.');
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterResources = (items: any[]) => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.position && item.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.make && item.make.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    // Business Center CRUD Operations
    const handleAddBusinessCenter = () => {
        setBusinessCenterMode('add');
        setSelectedBusinessCenter(null);
        setShowBusinessCenterModal(true);
    };

    const handleEditBusinessCenter = (center: BusinessCenter) => {
        setBusinessCenterMode('edit');
        setSelectedBusinessCenter(center);
        setShowBusinessCenterModal(true);
    };

    const handleDeleteBusinessCenter = (centerId: string) => {
        setDeleteConfirm({ show: true, centerId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.centerId) return;

        try {
            const response = await businessCentersApi.delete(deleteConfirm.centerId);
            if (response.success) {
                setBusinessCenters(prev => prev.filter(c => c.id !== deleteConfirm.centerId));
                showNotification('success', 'Business center deleted successfully');
            } else {
                showNotification('error', response.error || 'Failed to delete business center');
            }
        } catch (err) {
            showNotification('error', 'Failed to delete business center');
            console.error('Error deleting business center:', err);
        } finally {
            setDeleteConfirm({ show: false, centerId: null });
        }
    };

    const handleSaveBusinessCenter = async (data: Partial<BusinessCenter>) => {
        try {
            if (businessCenterMode === 'add') {
                // Generate a unique ID for new business center
                const newCenter = {
                    ...data,
                    id: `bc-${Date.now()}`
                };
                const response = await businessCentersApi.create(newCenter);
                if (response.success && response.data) {
                    setBusinessCenters(prev => [...prev, response.data as BusinessCenter]);
                    showNotification('success', 'Business center added successfully');
                }
            } else if (selectedBusinessCenter) {
                const response = await businessCentersApi.update(selectedBusinessCenter.id, data);
                if (response.success && response.data) {
                    setBusinessCenters(prev => prev.map(c =>
                        c.id === selectedBusinessCenter.id ? response.data as BusinessCenter : c
                    ));
                    showNotification('success', 'Business center updated successfully');
                }
            }
            setShowBusinessCenterModal(false);
        } catch (err) {
            showNotification('error', 'Failed to save business center');
            console.error('Error saving business center:', err);
            throw err;
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Resource CRUD Operations
    const handleAddResource = (type: 'employee' | 'equipment') => {
        setResourceType(type);
        setResourceMode('add');
        setSelectedResource(null);
        setShowModal(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setResourceType('employee');
        setResourceMode('edit');
        setSelectedResource(employee);
        setShowModal(true);
    };

    const handleEditEquipment = (equipment: Equipment) => {
        setResourceType('equipment');
        setResourceMode('edit');
        setSelectedResource(equipment);
        setShowModal(true);
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            const response = await employeesApi.delete(employeeId);
            if (response.success) {
                setEmployees(prev => prev.filter(e => e.id !== employeeId));
                showNotification('success', 'Employee deleted successfully');
            } else {
                showNotification('error', response.error || 'Failed to delete employee');
            }
        } catch (err) {
            showNotification('error', 'Failed to delete employee');
            console.error('Error deleting employee:', err);
        }
    };

    const handleDeleteEquipment = async (equipmentId: string) => {
        if (!confirm('Are you sure you want to delete this equipment?')) {
            return;
        }

        try {
            const response = await equipmentApi.delete(equipmentId);
            if (response.success) {
                setEquipment(prev => prev.filter(e => e.id !== equipmentId));
                showNotification('success', 'Equipment deleted successfully');
            } else {
                showNotification('error', response.error || 'Failed to delete equipment');
            }
        } catch (err) {
            showNotification('error', 'Failed to delete equipment');
            console.error('Error deleting equipment:', err);
        }
    };

    const handleSaveResource = async (data: Partial<Employee> | Partial<Equipment>) => {
        try {
            if (resourceType === 'employee') {
                if (resourceMode === 'add') {
                    const response = await employeesApi.create(data);
                    if (response.success && response.data) {
                        setEmployees(prev => [...prev, response.data as Employee]);
                        showNotification('success', 'Employee added successfully');
                    } else {
                        throw new Error(response.error || 'Failed to add employee');
                    }
                } else if (selectedResource) {
                    const response = await employeesApi.update(selectedResource.id, data);
                    if (response.success && response.data) {
                        setEmployees(prev => prev.map(e =>
                            e.id === selectedResource.id ? response.data as Employee : e
                        ));
                        showNotification('success', 'Employee updated successfully');
                    } else {
                        throw new Error(response.error || 'Failed to update employee');
                    }
                }
            } else {
                if (resourceMode === 'add') {
                    const response = await equipmentApi.create(data);
                    if (response.success && response.data) {
                        setEquipment(prev => [...prev, response.data as Equipment]);
                        showNotification('success', 'Equipment added successfully');
                    } else {
                        throw new Error(response.error || 'Failed to add equipment');
                    }
                } else if (selectedResource) {
                    const response = await equipmentApi.update(selectedResource.id, data);
                    if (response.success && response.data) {
                        setEquipment(prev => prev.map(e =>
                            e.id === selectedResource.id ? response.data as Equipment : e
                        ));
                        showNotification('success', 'Equipment updated successfully');
                    } else {
                        throw new Error(response.error || 'Failed to update equipment');
                    }
                }
            }
        } catch (err: any) {
            showNotification('error', err.message || 'Failed to save resource');
            throw err;
        }
    };

    const filteredEmployees = filterResources(employees);
    const filteredEquipment = filterResources(equipment);
    const filteredCenters = filterResources(businessCenters);

    return (
        <>
            <Navigation />

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading resources...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Content - only show when not loading and no error */}
            {!loading && !error && (
                <>
                    {/* Header Section */}
                    <section className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-8 fade-in-up">
                                <h2 className="text-3xl font-bold text-white mb-4">Resource Management</h2>
                                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                                    Manage your workforce and equipment resources with comprehensive tracking, skills management, and availability monitoring.
                                </p>
                            </div>

                            {/* Resource Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{employees.length}</h3>
                                    <p className="text-sm text-gray-600">Total Employees</p>
                                </div>

                                <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{equipment.length}</h3>
                                    <p className="text-sm text-gray-600">Equipment Units</p>
                                </div>

                                <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {[...employees, ...equipment].filter(r => r.availability === 'available').length}
                                    </h3>
                                    <p className="text-sm text-gray-600">Available Now</p>
                                </div>

                                <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {equipment.filter(e => e.maintenance === 'due').length}
                                    </h3>
                                    <p className="text-sm text-gray-600">Need Attention</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="glass-card rounded-lg p-6">
                            {/* Tabs and Controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                                <div className="flex space-x-2">
                                    <button
                                        className={`tab-button px-4 py-2 rounded-lg text-sm font-medium ${currentTab === 'employees' ? 'active' : 'bg-gray-100 text-gray-700'}`}
                                        onClick={() => setCurrentTab('employees')}
                                    >
                                        Employees
                                    </button>
                                    <button
                                        className={`tab-button px-4 py-2 rounded-lg text-sm font-medium ${currentTab === 'equipment' ? 'active' : 'bg-gray-100 text-gray-700'}`}
                                        onClick={() => setCurrentTab('equipment')}
                                    >
                                        Equipment
                                    </button>
                                    <button
                                        className={`tab-button px-4 py-2 rounded-lg text-sm font-medium ${currentTab === 'centers' ? 'active' : 'bg-gray-100 text-gray-700'}`}
                                        onClick={() => setCurrentTab('centers')}
                                    >
                                        Business Centers
                                    </button>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search resources..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="search-input pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500"
                                        />
                                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    {currentTab === 'centers' ? (
                                        <button
                                            onClick={handleAddBusinessCenter}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Add Business Center
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAddResource(currentTab === 'employees' ? 'employee' : 'equipment')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Add Resource
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content Tabs */}
                            <div>
                                {/* Employees Tab */}
                                {currentTab === 'employees' && (
                                    <div className="resource-grid">
                                        {filteredEmployees.map((employee) => (
                                            <div key={employee.id} className="resource-card bg-white rounded-lg p-6 border border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4 flex-1">
                                                        <div className={`w-12 h-12 ${employee.avatar.color} rounded-full flex items-center justify-center text-white font-medium`}>
                                                            {employee.avatar.initials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                                                            <p className="text-sm text-gray-600">{employee.position}</p>
                                                            <div className="flex items-center mt-2">
                                                                <span className={`status-indicator status-${employee.availability}`}></span>
                                                                <span className="text-sm text-gray-600 capitalize">{employee.availability}</span>
                                                                <span className="ml-auto text-xs text-gray-500">{employee.experience} years exp</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4">
                                                        <button
                                                            onClick={() => handleEditEmployee(employee)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEmployee(employee.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {employee.skills.map((skill: string, idx: number) => (
                                                            <span key={idx} className="skill-tag">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{employee.location}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Equipment Tab */}
                                {currentTab === 'equipment' && (
                                    <div className="resource-grid">
                                        {filteredEquipment.map((eq) => (
                                            <div key={eq.id} className="resource-card bg-white rounded-lg p-6 border border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4 flex-1">
                                                        <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-gray-900">{eq.name}</h3>
                                                            <p className="text-sm text-gray-600">{eq.make} {eq.model}</p>
                                                            <div className="flex items-center mt-2">
                                                                <span className={`status-indicator status-${eq.availability}`}></span>
                                                                <span className="text-sm text-gray-600 capitalize">{eq.availability}</span>
                                                                <span className="ml-auto text-xs text-gray-500">{eq.year}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4">
                                                        <button
                                                            onClick={() => handleEditEquipment(eq)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEquipment(eq.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Location: {eq.location}</span>
                                                        <span className="text-gray-600">Utilization: {eq.utilization}%</span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${eq.utilization}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 text-sm text-gray-600">
                                                    Next Maintenance: {new Date(eq.nextMaintenance).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Business Centers Tab */}
                                {currentTab === 'centers' && (
                                    <div className="resource-grid">
                                        {filteredCenters.map((center) => (
                                            <div key={center.id} className="resource-card bg-white rounded-lg p-6 border border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4 flex-1">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-gray-900">{center.name}</h3>
                                                            <p className="text-sm text-gray-600">{center.type} Facility</p>
                                                            <p className="text-sm text-gray-600 mt-1">Manager: {center.manager}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4">
                                                        <button
                                                            onClick={() => handleEditBusinessCenter(center)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBusinessCenter(center.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-600">Capacity</span>
                                                        <span className="text-gray-900 font-medium">{center.currentOccupancy}/{center.capacity}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(center.currentOccupancy / center.capacity) * 100}%` }}></div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 text-sm text-gray-600">
                                                    {center.contact}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Resource Modal */}
                    <ResourceModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveResource}
                        resourceType={resourceType}
                        mode={resourceMode}
                        resource={selectedResource}
                    />

                    {/* Business Center Modal */}
                    <BusinessCenterModal
                        isOpen={showBusinessCenterModal}
                        onClose={() => setShowBusinessCenterModal(false)}
                        onSave={handleSaveBusinessCenter}
                        businessCenter={selectedBusinessCenter}
                        mode={businessCenterMode}
                    />

                    {/* Delete Confirmation Dialog */}
                    {deleteConfirm.show && (
                        <div className="modal open">
                            <div className="modal-content max-w-md">
                                <div className="p-6">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                        Delete Business Center
                                    </h3>
                                    <p className="text-sm text-gray-600 text-center mb-6">
                                        Are you sure you want to delete this business center? This action cannot be undone.
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setDeleteConfirm({ show: false, centerId: null })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Toast */}
                    {notification && (
                        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                            } text-white animate-fade-in`}>
                            <div className="flex items-center space-x-2">
                                {notification.type === 'success' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                <span>{notification.message}</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
