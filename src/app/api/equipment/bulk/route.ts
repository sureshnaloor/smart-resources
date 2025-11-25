import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { Equipment, ApiResponse } from '@/lib/models';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const equipmentData = Array.isArray(body) ? body : [body];

        if (equipmentData.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No data provided' },
                { status: 400 }
            );
        }

        const collection = await getCollection<Equipment>(Collections.EQUIPMENT);

        // Get current count for ID generation
        let count = await collection.countDocuments();

        const newEquipmentList: Equipment[] = [];
        const errors: string[] = [];

        for (const [index, data] of equipmentData.entries()) {
            // Validate required fields
            if (!data.name || !data.make || !data.model) {
                errors.push(`Row ${index + 1}: Name, make, and model are required`);
                continue;
            }

            count++;
            const id = `EQP${String(count).padStart(3, '0')}`;

            const newEquipment: Equipment = {
                id,
                type: 'equipment',
                name: data.name,
                make: data.make,
                model: data.model,
                year: Number(data.year) || new Date().getFullYear(),
                location: data.location || 'Unknown',
                availability: data.availability || 'available',
                utilization: Number(data.utilization) || 0,
                maintenance: data.maintenance || 'current',
                lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : new Date(),
                nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
                value: Number(data.value) || 0,
                costPerHour: Number(data.costPerHour) || 0,
                depreciationRate: Number(data.depreciationRate) || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            };

            newEquipmentList.push(newEquipment);
        }

        if (newEquipmentList.length > 0) {
            await collection.insertMany(newEquipmentList);
        }

        return NextResponse.json({
            success: true,
            data: newEquipmentList,
            message: `Successfully imported ${newEquipmentList.length} equipment items. ${errors.length > 0 ? `${errors.length} failed.` : ''}`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error bulk importing equipment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to bulk import equipment' },
            { status: 500 }
        );
    }
}
