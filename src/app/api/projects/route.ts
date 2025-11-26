import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Project, ApiResponse } from '@/lib/models';

// GET /api/projects - List all projects with optional filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const location = searchParams.get('location');

        const collection = await getCollection<Project>(Collections.PROJECTS);

        // Build filter query
        const filter: any = { isDeleted: { $ne: true } };

        if (status) {
            filter.status = status;
        }

        if (priority) {
            filter.priority = priority;
        }

        if (location) {
            filter.location = location;
        }

        const projects = await collection.find(filter).toArray();

        const response: ApiResponse<Project[]> = {
            success: true,
            data: projects,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch projects',
            },
            { status: 500 }
        );
    }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.startDate || !body.endDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Name, start date, and end date are required',
                },
                { status: 400 }
            );
        }

        const collection = await getCollection<Project>(Collections.PROJECTS);

        // Generate ID
        const count = await collection.countDocuments();
        const id = `PROJ${String(count + 1).padStart(3, '0')}`;

        const newProject: Partial<Project> = {
            ...body,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
            // Convert date strings to Date objects
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            assignedResources: body.assignedResources || [],
            progress: body.progress || 0,
        };

        const result = await collection.insertOne(newProject as Project);

        const project = await collection.findOne({ _id: result.insertedId });

        const response: ApiResponse<Project> = {
            success: true,
            data: project!,
            message: 'Project created successfully',
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create project',
            },
            { status: 500 }
        );
    }
}
