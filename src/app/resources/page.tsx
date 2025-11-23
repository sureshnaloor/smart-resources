'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { generateEmployees, generateEquipment, generateBusinessCenters, type Employee, type Equipment, type BusinessCenter } from '@/lib/mockData';
// @ts-ignore
const anime = require('animejs');

export default function ResourcesPage() {
    const [currentTab, setCurrentTab] = useState<'employees' | 'equipment' | 'centers'>('employees');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [businessCenters, setBusinessCenters] = useState<BusinessCenter[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setEmployees(generateEmployees());
        setEquipment(generateEquipment());
        setBusinessCenters(generateBusinessCenters());

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
    }, []);

    const filterResources = (items: any[]) => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.position && item.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.make && item.make.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filteredEmployees = filterResources(employees);
    const filteredEquipment = filterResources(equipment);
    const filteredCenters = filterResources(businessCenters);

    return (
        <>
            <Navigation />

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

                            <button
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Add Resource
                            </button>
                        </div>
                    </div>

                    {/* Content Tabs */}
                    <div>
                        {/* Employees Tab */}
                        {currentTab === 'employees' && (
                            <div className="resource-grid">
                                {filteredEmployees.map((employee) => (
                                    <div key={employee.id} className="resource-card bg-white rounded-lg p-6 border border-gray-200">
                                        <div className="flex items-start space-x-4">
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
                                        <div className="flex items-start space-x-4">
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
                                            Next Maintenance: {eq.nextMaintenance.toLocaleDateString()}
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
                                        <div className="flex items-start space-x-4">
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

            {/* Add Resource Modal */}
            {showModal && (
                <div className="modal open">
                    <div className="modal-content">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Add New Resource</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="employee">Employee</option>
                                        <option value="equipment">Equipment</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Add Resource
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
