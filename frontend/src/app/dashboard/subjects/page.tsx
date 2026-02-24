"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Table from "../../../components/Table";

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch('http://localhost:3000/extra-subjects');
                if (res.ok) {
                    setSubjects(await res.json());
                }
            } catch (error) {
                console.error("Error loading subjects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const filteredSubjects = subjects.filter((s: any) => {
        if (!searchTerm) return true;
        const lower = searchTerm.toLowerCase();
        return s.id.toString().includes(lower) || s.name.toLowerCase().includes(lower);
    });

    const columns = [
        { header: "ID", accessor: "id", sortable: true, sortKey: "id" },
        { header: "Subject Name", accessor: "name", sortable: true, sortKey: "name" },
        {
            header: "Actions",
            render: (row: any) => (
                <Link href={`/dashboard/subjects/${row.id}/edit`} className="font-medium text-blue-600 hover:underline">Edit</Link>
            )
        }
    ];

    return (
        <main className="p-4 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
                    <Link href="/dashboard/subjects/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">
                        + Add Subject
                    </Link>
                </div>

                <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900">Search Subjects</label>
                            <input
                                type="text"
                                placeholder="Search by ID or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <Table
                        columns={columns}
                        data={filteredSubjects}
                        loading={loading}
                        defaultSortColumn="name"
                        emptyMessage="No subjects found matching your criteria."
                    />
                </div>
            </div>
        </main>
    );
}
