'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { IoIosArrowBack } from 'react-icons/io';
import { IoArrowUp, IoArrowDown, IoSwapVertical } from 'react-icons/io5';
import Link from 'next/link';
import { useTheme } from '../../components/theme/themeContext';

interface Dataset {
    id: string;
    title: string | null;
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

type TableSortMap = Record<string, SortConfig>;

const ExcludedColumns = ['dataset_id'];

export default function DatasetPage() {
    const { id } = useParams() as { id: string };
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [tables, setTables] = useState<{ tableName: string; data: any[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tableSorts, setTableSorts] = useState<TableSortMap>({});
    const { theme } = useTheme("datasetDetail");

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('datasets')
                .select('id, title')
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

                    const cleanedData = (tableData || []).map((row: any) => {
                        const cleaned: any = {};
                        for (const key of Object.keys(row)) {
                            if (!ExcludedColumns.includes(key)) {
                                cleaned[key] = row[key];
                            }
                        }
                        return cleaned;
                    });

                    return { tableName, data: cleanedData };
                })
            );

            setTables(results.filter((t) => t.data.length > 0));
            setLoading(false);
        }

        fetchData();
    }, [id]);

    function handleSort(tableName: string, key: string) {
        setTableSorts((prev) => {
            const current = prev[tableName];
            if (current?.key === key) {
                if (current.direction === 'asc') return { ...prev, [tableName]: { key, direction: 'desc' } };
                return { ...prev, [tableName]: null };
            }
            return { ...prev, [tableName]: { key, direction: 'asc' } };
        });
    }

    function getSortedData(tableName: string, data: any[]) {
        const sort = tableSorts[tableName];
        if (!sort) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sort.key];
            const bVal = b[sort.key];

            const aNum = Number(aVal);
            const bNum = Number(bVal);
            const isNumeric = !isNaN(aNum) && !isNaN(bNum);

            const comparison = isNumeric
                ? aNum - bNum
                : String(aVal).localeCompare(String(bVal));

            return sort.direction === 'asc' ? comparison : -comparison;
        });
    }

    function SortIcon({ tableName, colKey }: { tableName: string; colKey: string }) {
        const sort = tableSorts[tableName];
        if (sort?.key !== colKey) return <IoSwapVertical className="inline ml-1 opacity-40" />;
        return sort.direction === 'asc'
            ? <IoArrowUp className="inline ml-1" />
            : <IoArrowDown className="inline ml-1" />;
    }

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundImage: theme.background }}
            >
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        <div
            className="min-h-screen py-20"
            style={{ backgroundImage: theme.background }}
        >
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                    <h1
                        className="text-5xl font-bold mb-3"
                        style={{
                            backgroundImage: theme.headingGradient,
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        {dataset.title}
                    </h1>
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
                    <p className="text-gray-700"><strong>ID:</strong> {dataset.id}</p>
                </div>

                {/* Search */}
                <div className="card p-6 mb-12 shadow-lg border border-gray-100">
                    <input
                        type="text"
                        placeholder="Search table..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-gray-900 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Tables */}
                {tables.length > 0 ? (
                    tables.map(({ tableName, data }) => {
                        const filtered = data.filter((row) =>
                            Object.values(row).some((v) =>
                                String(v).toLowerCase().includes(search.toLowerCase())
                            )
                        );

                        if (filtered.length === 0) return null;

                        const sorted = getSortedData(tableName, filtered);
                        const columns = Object.keys(sorted[0] || {});

                        return (
                            <div key={tableName} className="card p-6 mb-10 border border-gray-100 shadow-sm animate-fade-in">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4 capitalize">
                                    {tableName} Table
                                </h2>

                                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                    <table className="min-w-full bg-white border-collapse">
                                        <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                            <tr>
                                                {columns.map((key) => (
                                                    <th
                                                        key={key}
                                                        onClick={() => handleSort(tableName, key)}
                                                        className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wide cursor-pointer select-none hover:bg-white/10 transition"
                                                    >
                                                        {key}
                                                        <SortIcon tableName={tableName} colKey={key} />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sorted.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className={`hover:bg-blue-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                >
                                                    {columns.map((key) => (
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
                        );
                    })
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