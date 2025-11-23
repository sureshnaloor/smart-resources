'use client';

import { useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
// @ts-ignore
const anime = require('animejs');

export default function AnalyticsPage() {
    const utilizationChartRef = useRef<HTMLDivElement>(null);
    const trendChartRef = useRef<HTMLDivElement>(null);
    const skillsChartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            anime({
                targets: '.fade-in-up',
                translateY: [30, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 600,
                easing: 'easeOutQuart'
            });
        }, 100);

        // Initialize ECharts
        if (typeof window !== 'undefined') {
            import('echarts').then((echarts) => {
                // Utilization Chart
                if (utilizationChartRef.current) {
                    const chart1 = echarts.init(utilizationChartRef.current);
                    chart1.setOption({
                        tooltip: { trigger: 'item' },
                        legend: { orient: 'vertical', left: 'left' },
                        series: [{
                            name: 'Utilization',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: 1048, name: 'Allocated', itemStyle: { color: '#0ea5e9' } },
                                { value: 735, name: 'Available', itemStyle: { color: '#059669' } },
                                { value: 580, name: 'Maintenance', itemStyle: { color: '#d97706' } },
                                { value: 484, name: 'Idle', itemStyle: { color: '#64748b' } }
                            ]
                        }]
                    });
                }

                // Trend Chart
                if (trendChartRef.current) {
                    const chart2 = echarts.init(trendChartRef.current);
                    chart2.setOption({
                        tooltip: { trigger: 'axis' },
                        legend: { data: ['Resources', 'Projects', 'Utilization'] },
                        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                        yAxis: { type: 'value' },
                        series: [
                            { name: 'Resources', type: 'line', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, itemStyle: { color: '#0ea5e9' } },
                            { name: 'Projects', type: 'line', data: [220, 182, 191, 234, 290, 330, 310], smooth: true, itemStyle: { color: '#059669' } },
                            { name: 'Utilization', type: 'line', data: [150, 232, 201, 154, 190, 330, 410], smooth: true, itemStyle: { color: '#d97706' } }
                        ]
                    });
                }

                // Skills Chart
                if (skillsChartRef.current) {
                    const chart3 = echarts.init(skillsChartRef.current);
                    chart3.setOption({
                        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                        legend: { data: ['Available', 'Required'] },
                        xAxis: { type: 'category', data: ['Welding', 'Electrical', 'HVAC', 'Plumbing', 'Machinery'] },
                        yAxis: { type: 'value' },
                        series: [
                            { name: 'Available', type: 'bar', data: [18, 23, 15, 12, 20], itemStyle: { color: '#059669' } },
                            { name: 'Required', type: 'bar', data: [12, 15, 18, 10, 16], itemStyle: { color: '#0ea5e9' } }
                        ]
                    });
                }
            });
        }
    }, []);

    return (
        <>
            <Navigation />

            {/* Header Section */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 fade-in-up">
                        <h2 className="text-3xl font-bold text-white mb-4">Analytics Dashboard</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Comprehensive insights and analytics for resource utilization, project performance, and workforce optimization.
                        </p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">94.2%</h3>
                            <p className="text-sm text-gray-600">Efficiency Rate</p>
                            <p className="text-xs text-green-600 mt-2">↗ 8.2% vs last month</p>
                        </div>

                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">$2.4M</h3>
                            <p className="text-sm text-gray-600">Cost Savings</p>
                            <p className="text-xs text-green-600 mt-2">↗ 12% vs last quarter</p>
                        </div>

                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">156</h3>
                            <p className="text-sm text-gray-600">Projects Completed</p>
                            <p className="text-xs text-blue-600 mt-2">23 this month</p>
                        </div>

                        <div className="glass-card rounded-lg p-6 text-center fade-in-up">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">4.2 hrs</h3>
                            <p className="text-sm text-gray-600">Avg Response Time</p>
                            <p className="text-xs text-green-600 mt-2">↘ 15% improvement</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Utilization Chart */}
                    <div className="glass-card rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Resource Utilization</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-800">Export</button>
                        </div>
                        <div ref={utilizationChartRef} style={{ height: '300px' }}></div>
                    </div>

                    {/* Trend Chart */}
                    <div className="glass-card rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-800">Export</button>
                        </div>
                        <div ref={trendChartRef} style={{ height: '300px' }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Skills Chart */}
                    <div className="lg:col-span-2 glass-card rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Skills Availability vs Requirements</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-800">Export</button>
                        </div>
                        <div ref={skillsChartRef} style={{ height: '300px' }}></div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="glass-card rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
                                    <span className="text-sm font-bold text-green-600">92%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>

                            <div className="border-b border-gray-200 pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Resource Allocation</span>
                                    <span className="text-sm font-bold text-blue-600">85%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div className="border-b border-gray-200 pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Budget Adherence</span>
                                    <span className="text-sm font-bold text-purple-600">88%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                                </div>
                            </div>

                            <div className="pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Quality Score</span>
                                    <span className="text-sm font-bold text-amber-600">95%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
