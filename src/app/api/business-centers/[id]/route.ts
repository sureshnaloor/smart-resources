import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { BusinessCenter, ApiResponse } from '@/lib/models';

// GET /api/business-centers/[id] - Get single business center
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<BusinessCenter>(Collections.BUSINESS_CENTERS);
        const businessCenter = await collection.findOne({
            id,
            isDeleted: { $ne: true }
        });

        if (!businessCenter) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Business center not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<BusinessCenter> = {
            success: true,
            data: businessCenter,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching business center:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch business center',
            },
            { status: 500 }
        );
    }
}

// PUT /api/business-centers/[id] - Update business center
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const collection = await getCollection<BusinessCenter>(Collections.BUSINESS_CENTERS);

        const updateData = {
            ...body,
            updatedAt: new Date(),
        };

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
                    error: 'Business center not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<BusinessCenter> = {
            success: true,
            data: result,
            message: 'Business center updated successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating business center:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update business center',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/business-centers/[id] - Delete business center (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<BusinessCenter>(Collections.BUSINESS_CENTERS);

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
                    error: 'Business center not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<null> = {
            success: true,
            message: 'Business center deleted successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting business center:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete business center',
            },
            { status: 500 }
        );
    }
}
