"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Table from "../../../components/Table";

export default function ClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch("http://localhost:3000/classes");
                if (res.ok) {
                    const data = await res.json();
                    setClasses(data);

                    // Flatten data for table: One row per section
                    const flattened = data.flatMap((cls: any) =>
                        (cls.sections && cls.sections.length > 0)
                            ? cls.sections.map((sec: any) => ({
                                id: sec.id,
                                className: cls.name, // "Class 10"
                                sectionName: sec.name, // "A"
                                classTeacher: sec.classTeacher
                                    ? `${sec.classTeacher.firstName} ${sec.classTeacher.lastName}`
                                    : 'Not Assigned',
                                studentCount: sec.students ? sec.students.length : 0,
                                classId: cls.id // For editing link
                            }))
                            : [{ // Handle class with no sections if any
                                id: `cls-${cls.id}`,
                                className: cls.name,
                                sectionName: 'No Sections',
                                classTeacher: '-',
                                studentCount: 0,
                                classId: cls.id
                            }]
                    );
                    setTableData(flattened);
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const columns = [
        { header: "Class", accessor: "className", sortable: true },
        { header: "Section", accessor: "sectionName", sortable: true },
        { header: "Class Teacher", accessor: "classTeacher", sortable: true },
        { header: "No. of Students", accessor: "studentCount", sortable: true },
        {
            header: "Action",
            render: (row: any) => (
                <Link
                    href={`/dashboard/classes/${row.classId}/edit`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    Edit
                </Link>
            )
        }
    ];

    return (
        <main className="p-4 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Classes Management</h1>
                    <div>
                        <Link href="/dashboard/classes/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none">
                            Add Class
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <Table
                        columns={columns}
                        data={tableData}
                        loading={loading}
                        defaultSortColumn="className"
                        emptyMessage="No classes found."
                    />
                </div>
            </div>
        </main>
    );
}
