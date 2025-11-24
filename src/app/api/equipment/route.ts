import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Equipment, ApiResponse } from '@/lib/models';

// GET /api/equipment - List all equipment with optional filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const availability = searchParams.get('availability');
        const maintenance = searchParams.get('maintenance');
        const location = searchParams.get('location');

        const collection = await getCollection<Equipment>(Collections.EQUIPMENT);

        // Build filter query
        const filter: any = { isDeleted: { $ne: true } };

        if (availability) {
            filter.availability = availability;
        }

        if (maintenance) {
            filter.maintenance = maintenance;
        }

        if (location) {
            filter.location = location;
        }

        const equipment = await collection.find(filter).toArray();

        const response: ApiResponse<Equipment[]> = {
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

// POST /api/equipment - Create new equipment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.make || !body.model) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Name, make, and model are required',
                },
                { status: 400 }
            );
        }

        const collection = await getCollection<Equipment>(Collections.EQUIPMENT);

        // Generate ID
        const count = await collection.countDocuments();
        const id = `EQ${String(count + 1).padStart(3, '0')}`;

        const newEquipment: Partial<Equipment> = {
            ...body,
            id,
            type: 'equipment',
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
            // Convert date strings to Date objects
            lastMaintenance: body.lastMaintenance ? new Date(body.lastMaintenance) : new Date(),
            nextMaintenance: body.nextMaintenance ? new Date(body.nextMaintenance) : new Date(),
        };

        const result = await collection.insertOne(newEquipment as Equipment);

        const equipment = await collection.findOne({ _id: result.insertedId });

        const response: ApiResponse<Equipment> = {
            success: true,
            data: equipment!,
            message: 'Equipment created successfully',
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating equipment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create equipment',
            },
            { status: 500 }
        );
    }
}
