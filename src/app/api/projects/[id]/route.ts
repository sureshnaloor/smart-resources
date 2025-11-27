import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Project, ApiResponse } from '@/lib/models';

// GET /api/projects/[id] - Get single project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<Project>(Collections.PROJECTS);
        const project = await collection.findOne({
            id,
            isDeleted: { $ne: true }
        });

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Project not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Project> = {
            success: true,
            data: project,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch project',
            },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const collection = await getCollection<Project>(Collections.PROJECTS);

        const updateData: any = {
            ...body,
            updatedAt: new Date(),
        };

        // Convert date strings to Date objects
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

        // Convert dates in resourceRequirements
        if (updateData.resourceRequirements && Array.isArray(updateData.resourceRequirements)) {
            updateData.resourceRequirements = updateData.resourceRequirements.map((req: any) => ({
                ...req,
                startDate: req.startDate ? new Date(req.startDate) : undefined,
                endDate: req.endDate ? new Date(req.endDate) : undefined,
            }));
        }

        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.id;
        delete updateData.createdAt;

        const result = await collection.findOneAndUpdate(
            { id, isDeleted: { $ne: true } },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Project not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Project> = {
            success: true,
            data: result,
            message: 'Project updated successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update project',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete project (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<Project>(Collections.PROJECTS);

        const result = await collection.findOneAndUpdate(
            { id, isDeleted: { $ne: true } },
            {
                $set: {
                    isDeleted: true,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Project not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<null> = {
            success: true,
            message: 'Project deleted successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete project',
            },
            { status: 500 }
        );
    }
}
