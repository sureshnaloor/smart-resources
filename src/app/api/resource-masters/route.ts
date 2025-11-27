import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { ResourceMaster, ApiResponse } from '@/lib/models';

// GET /api/resource-masters - List all resource masters
export async function GET(request: NextRequest) {
    try {
        const collection = await getCollection<ResourceMaster>(Collections.RESOURCE_MASTERS);
        const resourceMasters = await collection.find({ isDeleted: { $ne: true } }).toArray();

        const response: ApiResponse<ResourceMaster[]> = {
            success: true,
            data: resourceMasters,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching resource masters:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch resource masters',
            },
            { status: 500 }
        );
    }
}

// POST /api/resource-masters - Create new resource master
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.resourceName || !body.resourceType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Resource name and type are required',
                },
                { status: 400 }
            );
        }

        const collection = await getCollection<ResourceMaster>(Collections.RESOURCE_MASTERS);

        // Generate ID
        const count = await collection.countDocuments();
        const resourceId = `RES${String(count + 1).padStart(3, '0')}`;

        const newResourceMaster: ResourceMaster = {
            ...body,
            resourceId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        };

        await collection.insertOne(newResourceMaster);

        const response: ApiResponse<ResourceMaster> = {
            success: true,
            data: newResourceMaster,
            message: 'Resource master created successfully',
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating resource master:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create resource master',
            },
            { status: 500 }
        );
    }
}
