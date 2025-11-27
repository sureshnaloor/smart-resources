import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Employee, ApiResponse } from '@/lib/models';

// GET /api/employees - List all employees with optional filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const availability = searchParams.get('availability');
        const skills = searchParams.get('skills');
        const isIndirect = searchParams.get('isIndirect');
        const location = searchParams.get('location');

        const collection = await getCollection<Employee>(Collections.EMPLOYEES);

        // Build filter query
        const filter: any = { isDeleted: { $ne: true } };

        if (availability) {
            filter.availability = availability;
        }

        if (skills) {
            filter.skills = { $in: [skills] };
        }

        if (isIndirect !== null) {
            filter.isIndirect = isIndirect === 'true';
        }

        if (location) {
            filter.location = location;
        }

        const employees = await collection.find(filter).toArray();

        const response: ApiResponse<Employee[]> = {
            success: true,
            data: employees,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch employees',
            },
            { status: 500 }
        );
    }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.position) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Name and position are required',
                },
                { status: 400 }
            );
        }

        const collection = await getCollection<Employee>(Collections.EMPLOYEES);

        // Generate ID
        const count = await collection.countDocuments();
        const id = `EMP${String(count + 1).padStart(3, '0')}`;

        const newEmployee: Partial<Employee> = {
            ...body,
            id,
            type: 'employee',
            costPerHour: body.costPerHour || 0,
            isIndirect: body.isIndirect || false,
            resourceMasterId: body.resourceMasterId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        };

        const result = await collection.insertOne(newEmployee as Employee);

        const employee = await collection.findOne({ _id: result.insertedId });

        const response: ApiResponse<Employee> = {
            success: true,
            data: employee!,
            message: 'Employee created successfully',
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create employee',
            },
            { status: 500 }
        );
    }
}
