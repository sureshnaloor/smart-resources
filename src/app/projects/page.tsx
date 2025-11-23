'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import LiquidBackground from '@/components/LiquidBackground';
import { generateProjects, type Project } from '@/lib/mockData';
// @ts-ignore
const anime = require('animejs');

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setProjects(generateProjects());

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
                targets: '.project-card',
                scale: [0.9, 1],
                opacity: [0, 1],
                delay: anime.stagger(50, { start: 300 }),
                duration: 400,
                easing: 'easeOutQuart'
            });
        }, 100);
    }, []);

    const activeProjects = projects.filter(p => p.status === 'active').slice(0, 6);
    const selectedProjectData = projects.find(p => p.id === selectedProject);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const skillGaps = [
        { skill: 'Advanced Welding', gap: 3, priority: 'high' },
        { skill: 'Heavy Machinery Ops', gap: 1, priority: 'medium' },
        { skill: 'Electrical Systems', gap: 2, priority: 'low' }
    ];

    return (
        <>
            <LiquidBackground />
            <Navigation />

            {/* Header Section */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 fade-in-up">
                        <h2 className="text-3xl font-bold text-white mb-4">Project Management</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Plan, schedule, and manage projects with intelligent resource allocation and real-time progress tracking.
                        </p>
                    </div>

                    {/* Project Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{projects.length}</h3>
                            <p className="text-sm text-gray-600">Total Projects</p>
                        </div>

                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'active').length}</h3>
                            <p className="text-sm text-gray-600">Active Projects</p>
                        </div>

                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{projects.filter(p => p.priority === 'high').length}</h3>
                            <p className="text-sm text-gray-600">At Risk</p>
                        </div>

                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">87%</h3>
                            <p className="text-sm text-gray-600">Completion Rate</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Project List */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    New Project
                                </button>
                            </div>

                            <div className="space-y-4">
                                {activeProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className={`project-card bg-white rounded-lg p-4 border border-gray-200 cursor-pointer ${selectedProject === project.id ? 'ring-2 ring-blue-500' : ''}`}
                                        onClick={() => setSelectedProject(project.id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{project.location}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                                                <span className={`status-indicator status-${project.status}`}></span>
                                                <span className="text-xs text-gray-500 capitalize">{project.status}</span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{project.startDate.toLocaleDateString()} - {project.endDate.toLocaleDateString()}</span>
                                            <span>Budget: ${project.budget.toLocaleString()}</span>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600">Resources: {Object.values(project.requiredResources).reduce((a, b) => a + b, 0)} required</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gantt Chart Placeholder */}
                        <div className="glass-card rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-500 text-center py-8">Gantt Chart Visualization</p>
                            </div>
                        </div>
                    </div>

                    {/* Resource Planning */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Requirements</h3>
                            {selectedProjectData ? (
                                <div className="space-y-3">
                                    {Object.entries(selectedProjectData.requiredResources).map(([resource, count]) => (
                                        <div key={resource} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-900">{resource}</span>
                                                <span className="text-sm text-gray-600">{count} needed</span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Select a project to view resource requirements</p>
                            )}
                        </div>

                        <div className="glass-card rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gap Analysis</h3>
                            <div className="space-y-2">
                                {skillGaps.map((gap, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${gap.priority === 'high' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                        <div>
                                            <p className="font-medium text-gray-900">{gap.skill}</p>
                                            <p className="text-sm text-gray-600">{gap.gap} resources needed</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(gap.priority)}`}>{gap.priority}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Project Modal */}
            {showModal && (
                <div className="modal open">
                    <div className="modal-content">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Create Project
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
