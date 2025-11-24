import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { BusinessCenter, ApiResponse } from '@/lib/models';

// GET /api/business-centers - List all business centers
export async function GET(request: NextRequest) {
    try {
        const collection = await getCollection<BusinessCenter>(Collections.BUSINESS_CENTERS);

        const businessCenters = await collection.find({
            isDeleted: { $ne: true }
        }).toArray();

        const response: ApiResponse<BusinessCenter[]> = {
            success: true,
            data: businessCenters,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching business centers:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch business centers',
            },
            { status: 500 }
        );
    }
}

// POST /api/business-centers - Create new business center
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.type) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Name and type are required',
                },
                { status: 400 }
            );
        }

        const collection = await getCollection<BusinessCenter>(Collections.BUSINESS_CENTERS);

        // Generate ID
        const count = await collection.countDocuments();
        const id = `BC${String(count + 1).padStart(3, '0')}`;

        const newBusinessCenter: Partial<BusinessCenter> = {
            ...body,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        };

        const result = await collection.insertOne(newBusinessCenter as BusinessCenter);

        const businessCenter = await collection.findOne({ _id: result.insertedId });

        const response: ApiResponse<BusinessCenter> = {
            success: true,
            data: businessCenter!,
            message: 'Business center created successfully',
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating business center:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create business center',
            },
            { status: 500 }
        );
    }
}
