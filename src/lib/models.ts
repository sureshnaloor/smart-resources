import { ObjectId } from 'mongodb';

// Base interface for all database documents
export interface BaseDocument {
    _id?: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}

// Employee Model
export interface Employee extends BaseDocument {
    id: string;
    name: string;
    employeeNumber?: string;
    governmentId?: string;
    tier?: 1 | 2 | 3 | 4 | 5;
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
    // Cost tracking fields
    wage: number; // Annual salary or hourly wage
    costPerHour: number; // Actual cost per hour to company
    isIndirect: boolean; // True for supervisory/management staff
}

// Equipment Model
export interface Equipment extends BaseDocument {
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
    // Cost tracking fields
    value: number; // Purchase/current value
    costPerHour: number; // Operating cost per hour
    depreciationRate: number; // Annual depreciation percentage
}

// Resource Group Model (for consolidated resources)
export interface ResourceGroup extends BaseDocument {
    id: string;
    name: string;
    groupType: 'welders' | 'pipe-fitters' | 'electricians' | 'laborers' | 'other';
    description: string;
    memberIds: string[]; // IDs of employees or equipment in this group
    memberCount: number;
    averageCostPerHour: number;
    totalCapacity: number; // Total hours available
    location: string;
}

// Resource Master Model
export interface ResourceMaster extends BaseDocument {
    resourceId: string;
    resourceName: string;
    description: string;
    resourceType: 'manpower' | 'equipment';
}

// Project Model
export interface Project extends BaseDocument {
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
    resourceRequirements: {
        resourceMasterId: string;
        quantity: number;
        startDate?: Date;
        endDate?: Date;
    }[];
    assignedResources: string[]; // IDs of assigned employees/equipment/groups
}

// Business Center Model
export interface BusinessCenter extends BaseDocument {
    id: string;
    name: string;
    type: string;
    capacity: number;
    currentOccupancy: number;
    manager: string;
    contact: string;
    location?: string;
}

// Assignment Model
export interface Assignment extends BaseDocument {
    projectId: string;
    resourceId: string; // Employee ID or Equipment ID
    resourceType: 'employee' | 'equipment';
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed';
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    pageSize: number;
}

// Query filter types
export interface EmployeeFilters {
    availability?: 'available' | 'busy' | 'unavailable';
    skills?: string;
    isIndirect?: boolean;
    location?: string;
}

export interface EquipmentFilters {
    availability?: 'available' | 'busy' | 'maintenance';
    maintenance?: 'due' | 'current';
    location?: string;
}

export interface ProjectFilters {
    status?: 'planning' | 'active' | 'completed' | 'on-hold';
    priority?: 'high' | 'medium' | 'low';
    location?: string;
}
