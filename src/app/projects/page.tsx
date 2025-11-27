'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import LiquidBackground from '@/components/LiquidBackground';
import ProjectModal from '@/components/ProjectModal';
import BulkUploadModal from '@/components/BulkUploadModal';
import ResourceRequirementModal from '@/components/ResourceRequirementModal';
import { projectsApi } from '@/lib/api-client';
import type { Project, ResourceMaster, Assignment, Employee, Equipment } from '@/lib/models';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showRequirementModal, setShowRequirementModal] = useState(false);
    const [projectMode, setProjectMode] = useState<'add' | 'edit'>('add');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [resourceMasters, setResourceMasters] = useState<ResourceMaster[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchProjectAssignments(selectedProjectId);
        } else {
            setAssignments([]);
        }
    }, [selectedProjectId]);

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [projectsRes, mastersRes, employeesRes, equipmentRes] = await Promise.all([
                projectsApi.getAll(),
                fetch('/api/resource-masters').then(res => res.json()),
                fetch('/api/employees').then(res => res.json()),
                fetch('/api/equipment').then(res => res.json())
            ]);

            if (projectsRes.success) setProjects(projectsRes.data as Project[]);
            if (mastersRes.success) setResourceMasters(mastersRes.data);
            if (employeesRes.success) setEmployees(employeesRes.data);
            if (equipmentRes.success) setEquipment(equipmentRes.data);

            // Trigger animations
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

        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectAssignments = async (projectId: string) => {
        try {
            const response = await fetch(`/api/assignments?projectId=${projectId}`);
            const result = await response.json();
            if (result.success) {
                setAssignments(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectsApi.getAll();
            if (response.success && response.data) {
                setProjects(response.data as Project[]);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
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

    const handleResourceRequired = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setSelectedProject(project);
        setShowRequirementModal(true);
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

    const [viewMode, setViewMode] = useState<'active' | 'completed' | 'on-hold'>('active');

    const statusOrder: Record<string, number> = { 'planning': 1, 'active': 2, 'completed': 3, 'on-hold': 4 };

    const filteredProjects = projects.filter(p => {
        if (viewMode === 'active') return p.status === 'active' || p.status === 'planning';
        if (viewMode === 'completed') return p.status === 'completed';
        if (viewMode === 'on-hold') return p.status === 'on-hold';
        return false;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    });
    const selectedProjectData = projects.find(p => p.id === selectedProjectId);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate assigned counts by resource master ID
    const assignedCounts = new Map<string, number>();
    assignments.forEach(a => {
        const resource = a.resourceType === 'employee'
            ? employees.find(e => e.id === a.resourceId)
            : equipment.find(e => e.id === a.resourceId);

        if (resource?.resourceMasterId) {
            assignedCounts.set(resource.resourceMasterId, (assignedCounts.get(resource.resourceMasterId) || 0) + 1);
        }
    });

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
                            onClick={fetchInitialData}
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
                                        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => { setViewMode('active'); setSelectedProjectId(null); }}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'active'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                                    }`}
                                            >
                                                Active Projects
                                            </button>
                                            <button
                                                onClick={() => { setViewMode('completed'); setSelectedProjectId(null); }}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'completed'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                                    }`}
                                            >
                                                Completed Projects
                                            </button>
                                            <button
                                                onClick={() => { setViewMode('on-hold'); setSelectedProjectId(null); }}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'on-hold'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                                    }`}
                                            >
                                                On Hold
                                            </button>
                                        </div>
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
                                        {sortedProjects.map((project) => (
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
                                                    {project.status !== 'completed' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleEditProject(e, project)}
                                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            {(project.status === 'planning' || project.status === 'active') && (
                                                                <button
                                                                    onClick={(e) => handleResourceRequired(e, project)}
                                                                    className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded transition-colors text-xs font-medium flex items-center space-x-1"
                                                                    title="Manage Resource Requirements"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                                    </svg>
                                                                    <span>Resources Required</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => handleDeleteProject(e, project.id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
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
                                {selectedProjectData ? (
                                    selectedProjectData.status === 'completed' || selectedProjectData.status === 'on-hold' ? (
                                        <div className="glass-card rounded-lg p-6 text-center">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Not Applicable</h3>
                                            <p className="text-sm text-gray-500">No resource requirements for {selectedProjectData.status} projects.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="glass-card rounded-lg p-6 mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Analysis</h3>
                                                <div className="space-y-3">
                                                    {selectedProjectData.resourceRequirements?.length > 0 ? (
                                                        selectedProjectData.resourceRequirements.map((req, idx) => {
                                                            const master = resourceMasters.find(m => m.resourceId === req.resourceMasterId);
                                                            const assignedCount = assignedCounts.get(req.resourceMasterId) || 0;
                                                            const gap = req.quantity - assignedCount;

                                                            if (gap <= 0) return null;

                                                            return (
                                                                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{master?.resourceName || req.resourceMasterId}</p>
                                                                        <p className="text-sm text-gray-600">{gap} un-filled</p>
                                                                    </div>
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High Priority</span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No resource gaps identified.</p>
                                                    )}
                                                    {selectedProjectData.resourceRequirements?.every(req => {
                                                        const assigned = assignedCounts.get(req.resourceMasterId) || 0;
                                                        return req.quantity - assigned <= 0;
                                                    }) && (
                                                            <p className="text-sm text-gray-500">All requirements fulfilled.</p>
                                                        )}
                                                </div>
                                            </div>

                                            <div className="glass-card rounded-lg p-6 mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Requirements</h3>
                                                <div className="space-y-3">
                                                    {selectedProjectData.resourceRequirements?.length > 0 ? (
                                                        selectedProjectData.resourceRequirements.map((req, idx) => {
                                                            const master = resourceMasters.find(m => m.resourceId === req.resourceMasterId);
                                                            return (
                                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{master?.resourceName || req.resourceMasterId}</p>
                                                                        <p className="text-xs text-gray-500 capitalize">{master?.resourceType}</p>
                                                                    </div>
                                                                    <span className="font-semibold text-blue-600">{req.quantity} Required</span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No requirements defined.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="glass-card rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources Assigned</h3>
                                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                    {assignments.length > 0 ? (
                                                        assignments.map((assignment) => {
                                                            const resource = assignment.resourceType === 'employee'
                                                                ? employees.find(e => e.id === assignment.resourceId)
                                                                : equipment.find(e => e.id === assignment.resourceId);

                                                            if (!resource) return null;

                                                            return (
                                                                <div key={assignment._id?.toString()} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                                    <div className="flex items-center">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${assignment.resourceType === 'employee' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                            {assignment.resourceType === 'employee' ? (
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-900 text-sm">{resource.name}</p>
                                                                            <p className="text-xs text-gray-500 capitalize">{assignment.resourceType}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">No resources currently assigned.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )
                                ) : (
                                    <div className="glass-card rounded-lg p-6 text-center sticky top-6">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                                        <p className="text-sm text-gray-500">Click on a project card to view its detailed resource analysis and requirements.</p>
                                    </div>
                                )}
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

                    {/* Resource Requirement Modal */}
                    {selectedProject && (
                        <ResourceRequirementModal
                            isOpen={showRequirementModal}
                            onClose={() => setShowRequirementModal(false)}
                            onSave={fetchProjects}
                            project={selectedProject}
                        />
                    )}
                </>
            )}
        </>
    );
}
