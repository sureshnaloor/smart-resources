import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { ResourceGroup, ApiResponse } from '@/lib/models';

// GET /api/resource-groups/[id] - Get single resource group
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<ResourceGroup>(Collections.RESOURCE_GROUPS);
        const resourceGroup = await collection.findOne({
            id,
            isDeleted: { $ne: true }
        });

        if (!resourceGroup) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Resource group not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<ResourceGroup> = {
            success: true,
            data: resourceGroup,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching resource group:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch resource group',
            },
            { status: 500 }
        );
    }
}

// PUT /api/resource-groups/[id] - Update resource group
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const collection = await getCollection<ResourceGroup>(Collections.RESOURCE_GROUPS);

        const updateData: any = {
            ...body,
            updatedAt: new Date(),
        };

        // Update member count if memberIds changed
        if (updateData.memberIds) {
            updateData.memberCount = updateData.memberIds.length;
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
                    error: 'Resource group not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<ResourceGroup> = {
            success: true,
            data: result,
            message: 'Resource group updated successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating resource group:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update resource group',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/resource-groups/[id] - Delete resource group (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<ResourceGroup>(Collections.RESOURCE_GROUPS);

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
                    error: 'Resource group not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<null> = {
            success: true,
            message: 'Resource group deleted successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting resource group:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete resource group',
            },
            { status: 500 }
        );
    }
}
