import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { ResourceMaster, ApiResponse } from '@/lib/models';

// PUT /api/resource-masters/[id] - Update resource master
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;

        const collection = await getCollection<ResourceMaster>(Collections.RESOURCE_MASTERS);

        const result = await collection.findOneAndUpdate(
            { resourceId: id },
            {
                $set: {
                    ...body,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Resource master not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<ResourceMaster> = {
            success: true,
            data: result as ResourceMaster,
            message: 'Resource master updated successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating resource master:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update resource master',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/resource-masters/[id] - Delete resource master
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<ResourceMaster>(Collections.RESOURCE_MASTERS);

        const result = await collection.findOneAndUpdate(
            { resourceId: id },
            {
                $set: {
                    isDeleted: true,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Resource master not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<ResourceMaster> = {
            success: true,
            data: result as ResourceMaster,
            message: 'Resource master deleted successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting resource master:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete resource master',
            },
            { status: 500 }
        );
    }
}
