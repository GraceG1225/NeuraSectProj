'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { IoIosArrowBack } from 'react-icons/io';
import Link from 'next/link';

interface Dataset {
    id: string;
    title: string | null;
}

export default function DatasetPage() {
    const { id } = useParams() as { id: string };
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [tables, setTables] = useState<{ tableName: string; data: any[] }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    async function fetchData() {
        const { data, error } = await supabase
            .from('datasets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
        console.error(error);
        return;
        }

    setDataset(data);

    const tableNames = ['iris', 'boston', 'youtube', 'insurance', 'carsales'];
    const results = await Promise.all(
        tableNames.map(async (tableName) => {
            const { data: tableData } = await supabase
                .from(tableName as any)
                .select('*')
                .eq('dataset_id', id);
            return { tableName, data: tableData || [] };
        })
    );

    setTables(results.filter((t) => t.data.length > 0));
    setLoading(false);
    }

    fetchData();
    }, [id]);

    if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    }

    if (!dataset) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dataset Not Found</h1>
        <p className="text-gray-500 mb-4">We couldn&apos;t locate the dataset you&apos;re looking for.</p>
        <Link href="/" className="btn btn-primary px-6 py-3">
            <IoIosArrowBack className="inline-block mr-2" />
            Back to Home
        </Link>
        </div>
    );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
            <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">{dataset.title}</h1>
            </div>
            <Link
                href="/"
                className="btn btn-outline flex items-center mt-6 sm:mt-0 text-lg px-6 py-3"
            >
            <IoIosArrowBack className="mr-2" />
                Back
            </Link>
        </div>

        {/* Dataset Info */}
        <div className="card p-6 mb-12 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dataset Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
                <p><strong>ID:</strong> {dataset.id}</p>
            </div>
            </div>
        </div>

        {/* Tables */}
        {tables.length > 0 ? (
            tables.map(({ tableName, data }) => (
            <div key={tableName} className="card p-6 mb-10 border border-gray-100 shadow-sm animate-fade-in">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 capitalize">
                    {tableName} Table
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full bg-white border-collapse">
                    <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <tr>
                        {Object.keys(data[0] || {}).map((key) => (
                            <th
                            key={key}
                            className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wide"
                            >
                            {key}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                        <tr
                            key={i}
                            className={`hover:bg-blue-50 transition ${
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                        {Object.keys(row).map((key) => (
                            <td key={key} className="py-2 px-4 text-sm text-gray-700">
                                {String(row[key])}
                            </td>
                        ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Data Found</h3>
            <p className="text-gray-600">This dataset currently has no associated tables.</p>
            </div>
        )}
        </div>
        </div>
    );
}