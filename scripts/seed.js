const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartresources';

// Data generation functions (inline instead of importing from TypeScript)
const employeeNames = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Thompson',
    'James Wilson', 'Maria Garcia', 'Robert Brown', 'Jennifer Lee', 'Christopher Davis',
    'Amanda Taylor', 'Daniel Martinez', 'Jessica Anderson', 'Matthew White', 'Ashley Jackson',
    'Joshua Harris', 'Stephanie Clark', 'Andrew Lewis', 'Michelle Robinson', 'Kevin Walker',
    'Rachel Hall', 'Brian Allen', 'Nicole Young', 'Ryan King', 'Lauren Wright'
];

const skills = ['Welding', 'Pipe Fitting', 'Heavy Machinery', 'Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Concrete', 'Project Management', 'Safety Coordination'];
const positions = ['Senior Technician', 'Lead Engineer', 'Project Manager', 'Specialist', 'Supervisor', 'Foreman', 'Inspector', 'Coordinator'];
const locations = ['North Plant', 'South Facility', 'East Complex', 'West Center'];
const certifications = ['OSHA 30', 'Welding Certification', 'Equipment Operation', 'Safety Training', 'First Aid'];

function getRandomSkills(skillList, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...skillList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomCertifications() {
    return certifications.filter(() => Math.random() > 0.7);
}

function generateAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('');
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return { initials, color };
}

function generateEmployees() {
    return employeeNames.map((name, index) => ({
        id: `EMP${String(index + 1).padStart(3, '0')}`,
        name: name,
        type: 'employee',
        position: positions[Math.floor(Math.random() * positions.length)],
        skills: getRandomSkills(skills, 2, 5),
        experience: Math.floor(Math.random() * 20) + 1,
        availability: Math.random() > 0.3 ? 'available' : Math.random() > 0.5 ? 'busy' : 'unavailable',
        utilization: Math.floor(Math.random() * 100),
        location: locations[Math.floor(Math.random() * locations.length)],
        certifications: getRandomCertifications(),
        avatar: generateAvatar(name)
    }));
}

function generateEquipment() {
    const equipmentTypes = ['Excavator', 'Crane', 'Welding Machine', 'Generator', 'Compressor', 'Forklift', 'Bulldozer', 'Concrete Mixer', 'Backhoe Loader'];
    const makes = ['Caterpillar', 'John Deere', 'Komatsu', 'Volvo', 'Hitachi', 'Case', 'Bobcat'];

    return Array.from({ length: 28 }, (_, i) => ({
        id: `EQ${String(i + 1).padStart(3, '0')}`,
        name: `${equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]}`,
        type: 'equipment',
        make: makes[Math.floor(Math.random() * makes.length)],
        model: `Model ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 900) + 100}`,
        year: 2015 + Math.floor(Math.random() * 9),
        availability: Math.random() > 0.4 ? 'available' : Math.random() > 0.6 ? 'busy' : 'maintenance',
        utilization: Math.floor(Math.random() * 100),
        location: locations[Math.floor(Math.random() * locations.length)],
        lastMaintenance: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        maintenance: Math.random() > 0.8 ? 'due' : 'current'
    }));
}

function generateProjects() {
    const projectNames = [
        'Pipeline Installation Phase 1', 'HVAC System Upgrade', 'Electrical Grid Expansion',
        'Building Foundation Work', 'Equipment Maintenance Schedule', 'Safety System Overhaul',
        'Production Line Optimization', 'Warehouse Construction', 'Power Plant Maintenance',
        'Water Treatment Facility', 'Road Infrastructure', 'Bridge Construction',
        'Tunnel Excavation', 'Industrial Painting', 'Roofing Replacement'
    ];

    const priorities = ['high', 'medium', 'low'];
    const statuses = ['planning', 'active', 'completed', 'on-hold'];

    return projectNames.map((name, index) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) - 15);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 90) + 30);

        const requiredResources = {};
        ['Welding', 'Pipe Fitting', 'Heavy Machinery', 'Electrical', 'Plumbing', 'HVAC'].forEach(skill => {
            if (Math.random() > 0.6) {
                requiredResources[skill] = Math.floor(Math.random() * 5) + 1;
            }
        });

        return {
            id: `PROJ${String(index + 1).padStart(3, '0')}`,
            name: name,
            description: `Major construction project requiring specialized workforce and equipment for ${name.toLowerCase()}.`,
            startDate: startDate,
            endDate: endDate,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            progress: Math.floor(Math.random() * 100),
            budget: Math.floor(Math.random() * 500000) + 100000,
            requiredResources,
            assignedResources: []
        };
    });
}

function generateBusinessCenters() {
    const centerNames = [
        { name: 'North Plant', type: 'Manufacturing' },
        { name: 'South Facility', type: 'Assembly' },
        { name: 'East Complex', type: 'Testing' },
        { name: 'West Center', type: 'Distribution' }
    ];

    const employees = generateEmployees();

    return centerNames.map((center, index) => ({
        id: `BC${String(index + 1).padStart(3, '0')}`,
        name: center.name,
        type: center.type,
        capacity: Math.floor(Math.random() * 100) + 50,
        currentOccupancy: Math.floor(Math.random() * 80) + 20,
        manager: employees[Math.floor(Math.random() * employees.length)].name,
        contact: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    }));
}

async function seed() {
    const client = new MongoClient(uri);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully');

        const db = client.db('smartresources');

        // Clear existing data
        console.log('\nClearing existing collections...');
        await db.collection('employees').deleteMany({});
        await db.collection('equipment').deleteMany({});
        await db.collection('projects').deleteMany({});
        await db.collection('businessCenters').deleteMany({});
        await db.collection('resourceGroups').deleteMany({});
        console.log('Collections cleared');

        // Generate and enhance employees with cost data
        console.log('\nSeeding employees...');
        const employees = generateEmployees().map(emp => ({
            ...emp,
            // Add cost tracking fields
            wage: Math.floor(Math.random() * 50000) + 40000, // $40k-$90k annual
            costPerHour: Math.floor(Math.random() * 30) + 25, // $25-$55/hour
            isIndirect: ['Project Manager', 'Supervisor', 'Coordinator'].includes(emp.position),
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        }));
        await db.collection('employees').insertMany(employees);
        console.log(`Inserted ${employees.length} employees`);

        // Generate and enhance equipment with cost data
        console.log('\nSeeding equipment...');
        const equipment = generateEquipment().map(eq => ({
            ...eq,
            // Add cost tracking fields
            value: Math.floor(Math.random() * 500000) + 50000, // $50k-$550k
            costPerHour: Math.floor(Math.random() * 100) + 20, // $20-$120/hour
            depreciationRate: Math.random() * 0.15 + 0.05, // 5-20% annual
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        }));
        await db.collection('equipment').insertMany(equipment);
        console.log(`Inserted ${equipment.length} equipment items`);

        // Generate projects
        console.log('\nSeeding projects...');
        const projects = generateProjects().map(proj => ({
            ...proj,
            actualCost: Math.floor(proj.budget * (Math.random() * 0.3 + 0.7)), // 70-100% of budget
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        }));
        await db.collection('projects').insertMany(projects);
        console.log(`Inserted ${projects.length} projects`);

        // Generate business centers
        console.log('\nSeeding business centers...');
        const businessCenters = generateBusinessCenters().map(bc => ({
            ...bc,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
        }));
        await db.collection('businessCenters').insertMany(businessCenters);
        console.log(`Inserted ${businessCenters.length} business centers`);

        // Create sample resource groups
        console.log('\nSeeding resource groups...');
        const resourceGroups = [
            {
                id: 'RG001',
                name: 'Welding Team A',
                groupType: 'welders',
                description: 'Primary welding crew for structural work',
                memberIds: employees.filter(e => e.skills.includes('Welding') && !e.isIndirect).slice(0, 5).map(e => e.id),
                memberCount: 5,
                averageCostPerHour: 35,
                totalCapacity: 200, // 5 workers * 40 hours
                location: 'North Plant',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            },
            {
                id: 'RG002',
                name: 'Electrical Crew B',
                groupType: 'electricians',
                description: 'Electrical installation and maintenance team',
                memberIds: employees.filter(e => e.skills.includes('Electrical') && !e.isIndirect).slice(0, 4).map(e => e.id),
                memberCount: 4,
                averageCostPerHour: 42,
                totalCapacity: 160,
                location: 'South Facility',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            },
            {
                id: 'RG003',
                name: 'Pipe Fitting Squad',
                groupType: 'pipe-fitters',
                description: 'Specialized pipe fitting and installation',
                memberIds: employees.filter(e => e.skills.includes('Pipe Fitting') && !e.isIndirect).slice(0, 6).map(e => e.id),
                memberCount: 6,
                averageCostPerHour: 38,
                totalCapacity: 240,
                location: 'East Complex',
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            },
        ];
        await db.collection('resourceGroups').insertMany(resourceGroups);
        console.log(`Inserted ${resourceGroups.length} resource groups`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nSummary:');
        console.log(`- Employees: ${employees.length}`);
        console.log(`- Equipment: ${equipment.length}`);
        console.log(`- Projects: ${projects.length}`);
        console.log(`- Business Centers: ${businessCenters.length}`);
        console.log(`- Resource Groups: ${resourceGroups.length}`);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

seed();
