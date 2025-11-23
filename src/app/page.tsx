'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import LiquidBackground from '@/components/LiquidBackground';
import { generateEmployees, generateProjects, type Employee, type Project } from '@/lib/mockData';
// @ts-ignore
const anime = require('animejs');

export default function Dashboard() {
  const [resources, setResources] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate mock data
    setResources(generateEmployees());
    setProjects(generateProjects());

    // Initialize animations
    setTimeout(() => {
      anime({
        targets: '.metric-card',
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

      anime({
        targets: '#timelineView > div',
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, { start: 500 }),
        duration: 500,
        easing: 'easeOutQuart'
      });
    }, 100);

    // Initialize ECharts
    if (typeof window !== 'undefined' && chartRef.current) {
      import('echarts').then((echarts) => {
        const chart = echarts.init(chartRef.current!);

        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
              fontSize: 12
            }
          },
          series: [
            {
              name: 'Resource Utilization',
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['60%', '50%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '16',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 335, name: 'Utilized', itemStyle: { color: '#059669' } },
                { value: 234, name: 'Available', itemStyle: { color: '#0ea5e9' } },
                { value: 135, name: 'Maintenance', itemStyle: { color: '#d97706' } },
                { value: 89, name: 'Unassigned', itemStyle: { color: '#64748b' } }
              ]
            }
          ]
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.dispose();
        };
      });
    }
  }, []);

  const availableResources = resources.filter(r => r.availability === 'available').slice(0, 10);
  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 5);
  const totalResources = resources.length;
  const availableCount = resources.filter(r => r.availability === 'available').length;
  const utilizedCount = resources.filter(r => r.utilization > 0).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activities = [
    { type: 'allocation', resource: 'Sarah Johnson', project: 'Pipeline Installation', time: '2 minutes ago', color: 'bg-blue-100', icon: 'M12 4v16m8-8H4' },
    { type: 'completion', resource: 'Michael Chen', project: 'HVAC System Upgrade', time: '15 minutes ago', color: 'bg-green-100', icon: 'M5 13l4 4L19 7' },
    { type: 'request', resource: '3 Welders', project: 'Electrical Grid Expansion', time: '1 hour ago', color: 'bg-yellow-100', icon: 'M15 17h5l-5 5-5-5h5v-12' },
    { type: 'maintenance', resource: 'Excavator EQ-001', project: 'Scheduled Maintenance', time: '2 hours ago', color: 'bg-red-100', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  return (
    <>
      <LiquidBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-4">Enterprise Resource Management</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Optimize resource allocation, track utilization, and maximize efficiency across your entire organization with intelligent workforce and equipment management.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="metric-card success glass-card rounded-lg p-6 fade-in-up stagger-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Resources</p>
                  <p className="text-3xl font-bold text-gray-900">847</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">↗ 12% from last month</span>
              </div>
            </div>

            <div className="metric-card glass-card rounded-lg p-6 fade-in-up stagger-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <p className="text-3xl font-bold text-gray-900">78%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-blue-600">↗ 5% from last month</span>
              </div>
            </div>

            <div className="metric-card warning glass-card rounded-lg p-6 fade-in-up stagger-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">23</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-amber-600">3 projects at risk</span>
              </div>
            </div>

            <div className="metric-card critical glass-card rounded-lg p-6 fade-in-up stagger-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resource Shortage</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-red-600">Immediate attention required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Resource Pool */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Resource Pool</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">All</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Available</button>
                </div>
              </div>

              <div className="space-y-3">
                {availableResources.map((resource) => (
                  <div key={resource.id} className="resource-card bg-white rounded-lg p-3 border border-gray-200" draggable>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${resource.avatar.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                        {resource.avatar.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.position}</p>
                        <div className="flex items-center mt-1">
                          <span className={`status-indicator status-${resource.availability}`}></span>
                          <span className="text-xs text-gray-500 capitalize">{resource.availability}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap">
                      {resource.skills.slice(0, 2).map((skill: string, idx: number) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="lg:col-span-6">
            <div className="glass-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
                <div className="flex items-center space-x-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>This Week</option>
                    <option>Next Week</option>
                    <option>This Month</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Add Project
                  </button>
                </div>
              </div>

              <div className="space-y-4" id="timelineView">
                {activeProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {project.startDate.toLocaleDateString()} - {project.endDate.toLocaleDateString()}
                    </div>
                    <div className="timeline-slot rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-500 text-center">Drop resources here</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.location}</span>
                      <span>Required: {Object.values(project.requiredResources).reduce((a, b) => a + b, 0)} resources</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Summary */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Resources</span>
                  <span className="font-medium">{totalResources}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-medium text-green-600">{availableCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Allocated</span>
                  <span className="font-medium text-blue-600">{utilizedCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(utilizedCount / totalResources) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Resource Utilization Chart */}
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Overview</h3>
              <div ref={chartRef} className="allocation-chart"></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                  <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.resource}</p>
                    <p className="text-xs text-gray-500">{activity.project}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
