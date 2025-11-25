import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Project, ApiResponse } from '@/lib/models';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const projectsData = Array.isArray(body) ? body : [body];

        if (projectsData.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No data provided' },
                { status: 400 }
            );
        }

        const collection = await getCollection<Project>(Collections.PROJECTS);

        // Get current count for ID generation
        let count = await collection.countDocuments();

        const newProjects: Project[] = [];
        const errors: string[] = [];

        for (const [index, data] of projectsData.entries()) {
            // Validate required fields
            if (!data.name || !data.startDate || !data.endDate) {
                errors.push(`Row ${index + 1}: Name, start date, and end date are required`);
                continue;
            }

            count++;
            const id = `PRJ${String(count).padStart(3, '0')}`;

            const newProject: Project = {
                id,
                name: data.name,
                description: data.description || '',
                location: data.location || 'Unknown',
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: data.status || 'planning',
                priority: data.priority || 'medium',
                budget: Number(data.budget) || 0,
                actualCost: Number(data.actualCost) || 0,
                progress: Number(data.progress) || 0,
                requiredResources: data.requiredResources || {},
                assignedResources: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            };

            newProjects.push(newProject);
        }

        if (newProjects.length > 0) {
            await collection.insertMany(newProjects);
        }

        return NextResponse.json({
            success: true,
            data: newProjects,
            message: `Successfully imported ${newProjects.length} projects. ${errors.length > 0 ? `${errors.length} failed.` : ''}`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error bulk importing projects:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to bulk import projects' },
            { status: 500 }
        );
    }
}
