// Mock data generation utilities

export interface Employee {
    id: string;
    name: string;
    type: 'employee';
    position: string;
    skills: string[];
    availability: 'available' | 'busy' | 'unavailable';
    utilization: number;
    location: string;
    experience: number;
    certifications: string[];
    avatar: {
        initials: string;
        color: string;
    };
}

export interface Equipment {
    id: string;
    name: string;
    type: 'equipment';
    make: string;
    model: string;
    availability: 'available' | 'busy' | 'maintenance';
    utilization: number;
    location: string;
    year: number;
    lastMaintenance: Date;
    nextMaintenance: Date;
    maintenance: 'due' | 'current';
}

export interface Project {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'active' | 'completed' | 'on-hold';
    priority: 'high' | 'medium' | 'low';
    location: string;
    progress: number;
    budget: number;
    requiredResources: Record<string, number>;
    assignedResources: string[];
}

export interface BusinessCenter {
    id: string;
    name: string;
    type: string;
    capacity: number;
    currentOccupancy: number;
    manager: string;
    contact: string;
}

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

function getRandomSkills(skillList: string[], min: number, max: number): string[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...skillList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomCertifications(): string[] {
    return certifications.filter(() => Math.random() > 0.7);
}

function generateAvatar(name: string) {
    const initials = name.split(' ').map(n => n[0]).join('');
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return { initials, color };
}

function getRandomDate(startDate: Date, days: number): Date {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * days));
    return date;
}

export function generateEmployees(): Employee[] {
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

export function generateEquipment(): Equipment[] {
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
        lastMaintenance: getRandomDate(new Date(), 365),
        nextMaintenance: getRandomDate(new Date(), 90),
        maintenance: Math.random() > 0.8 ? 'due' : 'current'
    }));
}

export function generateProjects(): Project[] {
    const projectNames = [
        'Pipeline Installation Phase 1', 'HVAC System Upgrade', 'Electrical Grid Expansion',
        'Building Foundation Work', 'Equipment Maintenance Schedule', 'Safety System Overhaul',
        'Production Line Optimization', 'Warehouse Construction', 'Power Plant Maintenance',
        'Water Treatment Facility', 'Road Infrastructure', 'Bridge Construction',
        'Tunnel Excavation', 'Industrial Painting', 'Roofing Replacement'
    ];

    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const statuses: ('planning' | 'active' | 'completed' | 'on-hold')[] = ['planning', 'active', 'completed', 'on-hold'];

    return projectNames.map((name, index) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) - 15);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 90) + 30);

        const requiredResources: Record<string, number> = {};
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

export function generateBusinessCenters(): BusinessCenter[] {
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
