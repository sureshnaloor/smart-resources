'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import LiquidBackground from '@/components/LiquidBackground';
import ProjectModal from '@/components/ProjectModal';
import BulkUploadModal from '@/components/BulkUploadModal';
import { projectsApi } from '@/lib/api-client';
import type { Project } from '@/lib/models';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [projectMode, setProjectMode] = useState<'add' | 'edit'>('add');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await projectsApi.getAll();

            if (response.success && response.data) {
                setProjects(response.data as Project[]);

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
                            targets: '.project-card',
                            scale: [0.9, 1],
                            opacity: [0, 1],
                            delay: anime.stagger(50, { start: 300 }),
                            duration: 400,
                            easing: 'easeOutQuart'
                        });
                    }, 100);
                });
            }
        } catch (err) {
            setError('Failed to load projects. Please try again.');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProject = () => {
        setProjectMode('add');
        setSelectedProject(null);
        setShowModal(true);
    };

    const handleEditProject = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setProjectMode('edit');
        setSelectedProject(project);
        setShowModal(true);
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await projectsApi.delete(projectId);
            if (response.success) {
                setProjects(prev => prev.filter(p => p.id !== projectId));
                if (selectedProjectId === projectId) setSelectedProjectId(null);
            } else {
                alert('Failed to delete project');
            }
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('Failed to delete project');
        }
    };

    const handleSaveProject = async (data: Partial<Project>) => {
        try {
            if (projectMode === 'add') {
                const response = await projectsApi.create(data);
                if (response.success && response.data) {
                    setProjects(prev => [...prev, response.data as Project]);
                }
            } else if (selectedProject) {
                const response = await projectsApi.update(selectedProject.id, data);
                if (response.success && response.data) {
                    setProjects(prev => prev.map(p =>
                        p.id === selectedProject.id ? response.data as Project : p
                    ));
                }
            }
            setShowModal(false);
        } catch (err) {
            console.error('Error saving project:', err);
            throw err;
        }
    };

    const activeProjects = projects.filter(p => p.status === 'active').slice(0, 6);
    const selectedProjectData = projects.find(p => p.id === selectedProjectId);

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

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-white">Loading projects...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchProjects}
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
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setShowBulkModal(true)}
                                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <span>Bulk Upload</span>
                                            </button>
                                            <button
                                                onClick={handleAddProject}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                New Project
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {activeProjects.map((project) => (
                                            <div
                                                key={project.id}
                                                className={`project-card bg-white rounded-lg p-4 border border-gray-200 cursor-pointer ${selectedProjectId === project.id ? 'ring-2 ring-blue-500' : ''}`}
                                                onClick={() => setSelectedProjectId(project.id)}
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

                                                <div className="flex justify-end space-x-2 mb-3">
                                                    <button
                                                        onClick={(e) => handleEditProject(e, project)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
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
                                                    <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                                                    <span>Budget: ${project.budget.toLocaleString()}</span>
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
                                    <p className="text-sm text-gray-500">Resource requirements are calculated dynamically during execution.</p>
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
                    <ProjectModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveProject}
                        mode={projectMode}
                        project={selectedProject}
                    />

                    {/* Bulk Upload Modal */}
                    <BulkUploadModal
                        isOpen={showBulkModal}
                        onClose={() => setShowBulkModal(false)}
                        type="project"
                        onUploadComplete={fetchProjects}
                    />
                </>
            )}
        </>
    );
}
