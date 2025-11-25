import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Employee, ApiResponse } from '@/lib/models';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const employeesData = Array.isArray(body) ? body : [body];

        if (employeesData.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No data provided' },
                { status: 400 }
            );
        }

        const collection = await getCollection<Employee>(Collections.EMPLOYEES);

        // Get current count for ID generation
        let count = await collection.countDocuments();

        const newEmployees: Employee[] = [];
        const errors: string[] = [];

        for (const [index, data] of employeesData.entries()) {
            // Validate required fields
            if (!data.name || !data.position) {
                errors.push(`Row ${index + 1}: Name and position are required`);
                continue;
            }

            count++;
            const id = `EMP${String(count).padStart(3, '0')}`;

            // Generate avatar
            const nameParts = data.name.split(' ');
            const initials = nameParts.length > 1
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : data.name.substring(0, 2).toUpperCase();

            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const newEmployee: Employee = {
                id,
                type: 'employee',
                name: data.name,
                position: data.position,
                location: data.location || 'Unknown',
                experience: Number(data.experience) || 0,
                skills: data.skills ? (Array.isArray(data.skills) ? data.skills : data.skills.split(',').map((s: string) => s.trim())) : [],
                certifications: data.certifications ? (Array.isArray(data.certifications) ? data.certifications : data.certifications.split(',').map((s: string) => s.trim())) : [],
                availability: data.availability || 'available',
                utilization: Number(data.utilization) || 0,
                wage: Number(data.wage) || 0,
                costPerHour: Number(data.costPerHour) || 0,
                isIndirect: data.isIndirect === true || data.isIndirect === 'true',
                avatar: { initials, color },
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            };

            newEmployees.push(newEmployee);
        }

        if (newEmployees.length > 0) {
            await collection.insertMany(newEmployees);
        }

        return NextResponse.json({
            success: true,
            data: newEmployees,
            message: `Successfully imported ${newEmployees.length} employees. ${errors.length > 0 ? `${errors.length} failed.` : ''}`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error bulk importing employees:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to bulk import employees' },
            { status: 500 }
        );
    }
}
