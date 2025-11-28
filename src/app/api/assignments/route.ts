import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Assignment } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const resourceId = searchParams.get('resourceId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const client = await clientPromise;
        const db = client.db("smartresources");

        let query: any = { isDeleted: { $ne: true } };

        if (projectId) {
            query.projectId = projectId;
        }

        if (resourceId) {
            query.resourceId = resourceId;
        }

        // Date range overlap check
        if (startDate && endDate) {
            query.$or = [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ];
        }

        const assignments = await db.collection("assignments").find(query).toArray();

        return NextResponse.json({ success: true, data: assignments });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to fetch assignments' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("smartresources");
        const data = await request.json();
        const { id, schedule, ...updateData } = data;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Assignment ID is required' }, { status: 400 });
        }

        // If schedule is provided, ensure dates are Date objects
        if (schedule) {
            updateData.schedule = schedule.map((s: any) => ({
                ...s,
                startDate: new Date(s.startDate),
                endDate: new Date(s.endDate)
            }));

            // Update overall start/end dates based on schedule
            if (updateData.schedule.length > 0) {
                const dates = updateData.schedule.flatMap((s: any) => [s.startDate, s.endDate]);
                updateData.startDate = new Date(Math.min(...dates));
                updateData.endDate = new Date(Math.max(...dates));
            }
        }

        const result = await db.collection("assignments").updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { ...updateData, _id: id } });
    } catch (error) {
        console.error('Error updating assignment:', error);
        return NextResponse.json({ success: false, error: 'Failed to update assignment' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("smartresources");
        const data = await request.json();

        const assignment: Assignment = {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
            status: 'active'
        };

        const result = await db.collection("assignments").insertOne(assignment);

        return NextResponse.json({ success: true, data: { ...assignment, _id: result.insertedId } });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: 'Failed to create assignment' }, { status: 500 });
    }
}
