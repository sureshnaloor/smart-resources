'use client';

import { useState, useEffect } from 'react';
import { ResourceMaster } from '@/lib/models';
import ResourceMasterModal from '@/components/ResourceMasterModal';
import Navigation from '@/components/Navigation';
import LiquidBackground from '@/components/LiquidBackground';

export default function ResourceMastersPage() {
    const [masters, setMasters] = useState<ResourceMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState<ResourceMaster | undefined>(undefined);
    const [filterType, setFilterType] = useState<'all' | 'manpower' | 'equipment'>('all');

    const fetchMasters = async () => {
        try {
            const response = await fetch('/api/resource-masters');
            const result = await response.json();
            if (result.success) {
                setMasters(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch resource masters:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasters();
    }, []);

    const handleEdit = (master: ResourceMaster) => {
        setSelectedMaster(master);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource master?')) return;

        try {
            const response = await fetch(`/api/resource-masters/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                fetchMasters();
            }
        } catch (error) {
            console.error('Failed to delete resource master:', error);
        }
    };

    const filteredMasters = masters.filter(
        (m) => filterType === 'all' || m.resourceType === filterType
    );

    return (
        <>
            <LiquidBackground />
            <Navigation />
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8 fade-in-up">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Resource Masters</h1>
                            <p className="text-slate-500 mt-1">Manage resource types and definitions</p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedMaster(undefined);
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add New Master</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex space-x-4">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                            >
                                All Types
                            </button>
                            <button
                                onClick={() => setFilterType('manpower')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'manpower'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                            >
                                Manpower
                            </button>
                            <button
                                onClick={() => setFilterType('equipment')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'equipment'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                            >
                                Equipment
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading...</div>
                        ) : filteredMasters.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No resource masters found</h3>
                                <p className="text-slate-500 mt-1">Create your first resource master to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredMasters.map((master) => (
                                            <tr key={master.resourceId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {master.resourceName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${master.resourceType === 'manpower'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                            }`}
                                                    >
                                                        {master.resourceType.charAt(0).toUpperCase() +
                                                            master.resourceType.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 max-w-md truncate">
                                                    {master.description}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(master)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(master.resourceId)}
                                                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <ResourceMasterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchMasters}
                    master={selectedMaster}
                />
            </div>
        </>
    );
}
