import React from 'react';
import { Employee, Equipment, ResourceMaster } from '@/lib/models';

interface MasterResourceListProps {
    master: ResourceMaster;
    resources: (Employee | Equipment)[];
    onClose: () => void;
}

export default function MasterResourceList({ master, resources, onClose }: MasterResourceListProps) {
    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden fade-in-up">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        {master.resourceName} Resources
                    </h3>
                    <p className="text-sm text-slate-500">
                        Total: {resources.length} {master.resourceType === 'manpower' ? 'Employees' : 'Units'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {resources.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    No resources found for this master type.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Location</th>
                                {master.resourceType === 'manpower' ? (
                                    <>
                                        <th className="px-6 py-3">Position</th>
                                        <th className="px-6 py-3">Experience</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3">Make/Model</th>
                                        <th className="px-6 py-3">Year</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {resources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-900">
                                        {resource.name}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${resource.availability === 'available' ? 'bg-green-50 text-green-700' :
                                                resource.availability === 'busy' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-red-50 text-red-700'}`}>
                                            {resource.availability}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {resource.location}
                                    </td>
                                    {master.resourceType === 'manpower' ? (
                                        <>
                                            <td className="px-6 py-3 text-slate-600">{(resource as Employee).position}</td>
                                            <td className="px-6 py-3 text-slate-600">{(resource as Employee).experience} years</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-3 text-slate-600">{(resource as Equipment).make} {(resource as Equipment).model}</td>
                                            <td className="px-6 py-3 text-slate-600">{(resource as Equipment).year}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
