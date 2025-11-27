import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Equipment, ApiResponse } from '@/lib/models';

// GET /api/equipment/[id] - Get single equipment
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<Equipment>(Collections.EQUIPMENT);
        const equipment = await collection.findOne({
            id,
            isDeleted: { $ne: true }
        });

        if (!equipment) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Equipment not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Equipment> = {
            success: true,
            data: equipment,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch equipment',
            },
            { status: 500 }
        );
    }
}

// PUT /api/equipment/[id] - Update equipment
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const collection = await getCollection<Equipment>(Collections.EQUIPMENT);

        const updateData: any = {
            ...body,
            updatedAt: new Date(),
        };

        // Convert date strings to Date objects
        if (updateData.lastMaintenance) {
            updateData.lastMaintenance = new Date(updateData.lastMaintenance);
        }
        if (updateData.nextMaintenance) {
            updateData.nextMaintenance = new Date(updateData.nextMaintenance);
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
                    error: 'Equipment not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Equipment> = {
            success: true,
            data: result,
            message: 'Equipment updated successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating equipment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update equipment',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/equipment/[id] - Delete equipment (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<Equipment>(Collections.EQUIPMENT);

        const result = await collection.findOneAndUpdate(
            { id, isDeleted: { $ne: true } },
            {
                $set: {
                    isDeleted: true,
                    updatedAt: new Date()
                },
                $unset: {
                    resourceMasterId: "" // Unset resourceMasterId on soft delete
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Equipment not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<null> = {
            success: true,
            message: 'Equipment deleted successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting equipment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete equipment',
            },
            { status: 500 }
        );
    }
}
