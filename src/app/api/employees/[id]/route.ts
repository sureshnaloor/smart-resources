import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Employee, ApiResponse } from '@/lib/models';

// GET /api/employees/[id] - Get single employee
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<Employee>(Collections.EMPLOYEES);
        const employee = await collection.findOne({
            id,
            isDeleted: { $ne: true }
        });

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Employee not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Employee> = {
            success: true,
            data: employee,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch employee',
            },
            { status: 500 }
        );
    }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const collection = await getCollection<Employee>(Collections.EMPLOYEES);

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
                    error: 'Employee not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Employee> = {
            success: true,
            data: result,
            message: 'Employee updated successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating employee:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update employee',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/employees/[id] - Delete employee (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collection = await getCollection<Employee>(Collections.EMPLOYEES);

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
                    error: 'Employee not found',
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<null> = {
            success: true,
            message: 'Employee deleted successfully',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete employee',
            },
            { status: 500 }
        );
    }
}
