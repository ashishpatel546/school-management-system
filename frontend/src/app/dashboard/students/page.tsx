"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Table from "../../../components/Table";
import { API_BASE_URL } from "@/lib/api";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    // Search Params
    const [searchSessionId, setSearchSessionId] = useState("");
    const [searchId, setSearchId] = useState("");
    const [searchFirstName, setSearchFirstName] = useState("");
    const [searchLastName, setSearchLastName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [searchParents, setSearchParents] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [searchClassId, setSearchClassId] = useState("");
    const [searchSectionId, setSearchSectionId] = useState("");

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchId) params.append("id", searchId);
            if (searchFirstName) params.append("firstName", searchFirstName);
            if (searchLastName) params.append("lastName", searchLastName);
            if (searchEmail) params.append("email", searchEmail);
            if (searchParents) params.append("parentsName", searchParents);
            if (searchStatus !== "") params.append("isActive", searchStatus);
            if (searchClassId) params.append("classId", searchClassId);
            if (searchSectionId) params.append("sectionId", searchSectionId);
            if (searchSessionId) params.append("academicSessionId", searchSessionId);

            const res = await fetch(`${API_BASE_URL}/students?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        Promise.all([
            fetch(`${API_BASE_URL}/classes`).then(r => r.json()),
            fetch(`${API_BASE_URL}/academic-sessions`).then(r => r.json())
        ]).then(([classesData, sessionsData]) => {
            setClasses(Array.isArray(classesData) ? classesData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            // Default to active session
            const activeSession = sessionsData.find((s: any) => s.isActive);
            if (activeSession) setSearchSessionId(activeSession.id.toString());
        }).catch(() => { });
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents();
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSearchClassId(val);
        setSearchSectionId("");
        if (val) {
            const cls = classes.find((c: any) => c.id === parseInt(val));
            setSections(cls?.sections || []);
        } else {
            setSections([]);
        }
    };

    const handleReset = () => {
        setSearchId("");
        setSearchFirstName("");
        setSearchLastName("");
        setSearchEmail("");
        setSearchParents("");
        setSearchStatus("");
        setSearchClassId("");
        setSearchSectionId("");
        const activeSession = sessions.find((s: any) => s.isActive);
        setSearchSessionId(activeSession ? activeSession.id.toString() : "");
        setSections([]);
        // will trigger by useEffect or just call it after state flush:
        setTimeout(() => fetchStudents(), 0);
    };

    const columns = [
        { header: "ID", accessor: "id", sortable: true },
        { header: "Roll No", accessor: "rollNo", sortable: true, render: (row: any) => (row.rollNo && row.rollNo !== 0) ? row.rollNo : 'N/A' },
        { header: "First Name", accessor: "firstName", sortable: true },
        { header: "Last Name", accessor: "lastName", sortable: true },
        {
            header: "Class / Section",
            render: (row: any) => row.class ? `${row.class.name} ${row.section ? '- ' + row.section.name : ''}` : '-'
        },
        {
            header: "Subjects",
            render: (row: any) => row.studentSubjects && row.studentSubjects.length > 0
                ? row.studentSubjects.map((ss: any) => (ss.subject || ss.extraSubject)?.name).filter(Boolean).join(', ')
                : '-'
        },
        {
            header: "Status",
            render: (row: any) => (
                <span className={`px-2 py-1 font-semibold leading-tight ${row.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} rounded-full`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: "Actions",
            render: (row: any) => (
                <Link href={`/dashboard/students/${row.id}/edit`} className="font-medium text-blue-600 hover:underline">Edit</Link>
            )
        }
    ];

    return (
        <main className="p-4 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Students Management</h1>
                    <div className="space-x-2">
                        <Link href="/dashboard/students/promotions" className="text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">
                            Bulk Promotions
                        </Link>
                        <Link href="/dashboard/students/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">
                            Add Student
                        </Link>
                    </div>
                </div>

                {/* Advanced Search Filter */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Search Students</h2>
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Student ID</label>
                                <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2" placeholder="e.g. 1" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" value={searchFirstName} onChange={e => setSearchFirstName(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2" placeholder="First Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" value={searchLastName} onChange={e => setSearchLastName(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2" placeholder="Last Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input type="text" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2" placeholder="Email Address" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Parent's Name</label>
                                <input type="text" value={searchParents} onChange={e => setSearchParents(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2" placeholder="Mother or Father" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2">
                                    <option value="">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
                                <select value={searchSessionId} onChange={e => setSearchSessionId(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2">
                                    <option value="">All Sessions</option>
                                    {sessions.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                                <select value={searchClassId} onChange={handleClassChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2">
                                    <option value="">All Classes</option>
                                    {classes.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Section</label>
                                <select value={searchSectionId} onChange={e => setSearchSectionId(e.target.value)} disabled={!searchClassId} className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option value="">All Sections</option>
                                    {sections.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={handleReset} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200">
                                Reset
                            </button>
                            <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <Table
                        columns={columns}
                        data={students}
                        loading={loading}
                        defaultSortColumn="id"
                        defaultSortDirection="asc"
                        emptyMessage="No students found matching the search criteria."
                    />
                </div>
            </div>
        </main>
    );
}
