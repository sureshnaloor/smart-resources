import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { ResourceGroup, ApiResponse } from '@/lib/models';

// GET /api/resource-groups - List all resource groups with optional filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const groupType = searchParams.get('groupType');

        const collection = await getCollection<ResourceGroup>(Collections.RESOURCE_GROUPS);

        // Build filter query
        const filter: any = { isDeleted: { $ne: true } };

        if (groupType) {
            filter.groupType = groupType;
        }

        const resourceGroups = await collection.find(filter).toArray();

        const response: ApiResponse<ResourceGroup[]> = {
            success: true,
            data: resourceGroups,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching resource groups:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch resource groups',
            },
            { status: 500 }
        );
    }
}

// POST /api/resource-groups - Create new resource group
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.groupType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Name and group type are required',
                },
                { status: 400 }
            );
        }

        const collection = await getCollection<ResourceGroup>(Collections.RESOURCE_GROUPS);

        // Generate ID
        const count = await collection.countDocuments();
        const id = `RG${String(count + 1).padStart(3, '0')}`;

        const newResourceGroup: Partial<ResourceGroup> = {
            ...body,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
            memberIds: body.memberIds || [],
            memberCount: body.memberIds?.length || 0,
        };

        const result = await collection.insertOne(newResourceGroup as ResourceGroup);

        const resourceGroup = await collection.findOne({ _id: result.insertedId });

        const response: ApiResponse<ResourceGroup> = {
            success: true,
            data: resourceGroup!,
            message: 'Resource group created successfully',
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating resource group:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create resource group',
            },
            { status: 500 }
        );
    }
}
