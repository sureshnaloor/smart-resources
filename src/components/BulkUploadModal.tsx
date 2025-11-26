'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'employee' | 'equipment' | 'project';
    onUploadComplete: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, type, onUploadComplete }: BulkUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (file: File) => {
        setFile(file);
        setError(null);
        setSuccessMessage(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                // Remove the first row (sample data)
                if (jsonData.length > 0) {
                    jsonData.shift();
                }
                setPreviewData(jsonData);
            } catch (err) {
                setError('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
                setPreviewData([]);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        if (previewData.length === 0) {
            setError('No data to upload');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let endpoint = '';
            switch (type) {
                case 'employee':
                    endpoint = '/api/employees/bulk';
                    break;
                case 'equipment':
                    endpoint = '/api/equipment/bulk';
                    break;
                case 'project':
                    endpoint = '/api/projects/bulk';
                    break;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(previewData),
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage(result.message);
                setPreviewData([]);
                setFile(null);
                setTimeout(() => {
                    onUploadComplete();
                    onClose();
                }, 2000);
            } else {
                setError(result.error || 'Upload failed');
                if (result.errors) {
                    setError(`Upload failed: ${result.errors.join(', ')}`);
                }
            }
        } catch (err) {
            setError('An error occurred during upload');
        } finally {
            setLoading(false);
        }
    };

    const getTemplateHeaders = () => {
        switch (type) {
            case 'employee':
                return ['name', 'employeeNumber', 'governmentId', 'tier', 'position', 'location', 'experience', 'skills', 'wage', 'costPerHour'];
            case 'equipment':
                return ['name', 'make', 'model', 'year', 'location', 'value', 'costPerHour', 'depreciationRate'];
            case 'project':
                return ['name', 'description', 'startDate', 'endDate', 'status', 'priority', 'budget', 'location'];
            default:
                return [];
        }
    };

    const getTemplateSampleData = () => {
        switch (type) {
            case 'employee':
                return ['John Doe', 'EMP-001', 'ID-12345', 3, 'Senior Welder', 'New York', 5, 'Welding, Fitting', 75000, 45];
            case 'equipment':
                return ['Excavator #1', 'Caterpillar', '320D', 2020, 'Site A', 150000, 85, 10];
            case 'project':
                return ['Project Alpha', 'New construction project', '2024-01-01', '2024-12-31', 'planning', 'high', 500000, 'New York'];
            default:
                return [];
        }
    };

    const downloadTemplate = () => {
        const headers = getTemplateHeaders();
        const sampleData = getTemplateSampleData();
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, `${type}_template.xlsx`);
    };

    return (
        <div className="modal open">
            <div className="modal-content max-w-4xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Bulk Upload {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                            {successMessage}
                        </div>
                    )}

                    <div className="space-y-6">
                        {!file ? (
                            <div
                                className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                />
                                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-lg font-medium text-slate-700">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-500 mt-2">Supported formats: .csv, .xlsx, .xls</p>
                                <p className="text-xs text-amber-600 mt-2">Note: The first row after headers is considered a sample and will be skipped.</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Download Template
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{file.name}</p>
                                            <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); setPreviewData([]); }}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-64">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {previewData.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        {Object.values(row).map((cell: any, j) => (
                                                            <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                {String(cell)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {previewData.length > 5 && (
                                        <div className="px-6 py-3 bg-slate-50 text-sm text-slate-500 border-t">
                                            Showing 5 of {previewData.length} rows
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={loading || !file || previewData.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                <span>{loading ? 'Uploading...' : 'Upload'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
