"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function BulkPromotionsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    // Search Params
    const [fromSessionId, setFromSessionId] = useState("");
    const [fromClassId, setFromClassId] = useState("");

    // Action Params
    const [toSessionId, setToSessionId] = useState("");
    const [toClassId, setToClassId] = useState("");
    const [toSectionId, setToSectionId] = useState("");

    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sessRes, classRes, secRes] = await Promise.all([
                fetch(`${API_BASE_URL}/academic-sessions`),
                fetch(`${API_BASE_URL}/classes`),
                fetch(`${API_BASE_URL}/sections`),
            ]);

            if (sessRes.ok) setSessions(await sessRes.json());
            if (classRes.ok) setClasses(await classRes.json());
            if (secRes.ok) setSections(await secRes.json());
        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const handleSearch = async () => {
        if (!fromSessionId || !fromClassId) {
            toast.error("Please select a Source Session and Class");
            return;
        }

        setLoading(true);
        try {
            // Ideally we'd have a specific endpoint, but for now we fetch all and filter client-side for speed
            // Or we just fetch all students and find those who have an active enrollment matching fromSession & fromClass
            const res = await fetch(`${API_BASE_URL}/students`);
            if (res.ok) {
                const allStudents = await res.json();
                const filtered = allStudents.filter((s: any) => {
                    // Look through their enrollments (assuming findAll returns enrollments now)
                    if (s.enrollments) {
                        return s.enrollments.some((e: any) =>
                            e.academicSession?.id === parseInt(fromSessionId) &&
                            e.class?.id === parseInt(fromClassId) &&
                            e.status === 'ACTIVE'
                        );
                    }
                    // Fallback to legacy check if enrollments aren't fully populated yet
                    return s.class?.id === parseInt(fromClassId);
                });
                setStudents(filtered);
                setSelectedStudentIds([]); // reset selection
            }
        } catch (error) {
            toast.error("Failed to search students");
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id: number) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const toggleAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map(s => s.id));
        }
    };

    const handlePromote = async () => {
        if (selectedStudentIds.length === 0) {
            toast.error("Please select at least one student");
            return;
        }
        if (!toSessionId || !toClassId || !toSectionId) {
            toast.error("Please fill out all Destination fields");
            return;
        }

        const payload = {
            studentIds: selectedStudentIds,
            fromSessionId: parseInt(fromSessionId),
            toSessionId: parseInt(toSessionId),
            targetClassId: parseInt(toClassId),
            targetSectionId: parseInt(toSectionId)
        };

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/students/promotions/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const result = await res.json();
                toast.success(`Successfully promoted ${result.successful} students!`);
                if (result.failed > 0) {
                    toast.error(`Failed to promote ${result.failed} students.`);
                }

                // Refresh list
                handleSearch();
            } else {
                toast.error("Failed to execute bulk promotion");
            }
        } catch (error) {
            toast.error("An error occurred during promotion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Bulk Student Promotions</h1>

            {/* Top Bar: Source Filters & Destination Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Source Config */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                        Select Source Class
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Academic Session</label>
                            <select
                                value={fromSessionId}
                                onChange={(e) => setFromSessionId(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                <option value="">Select Session...</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Class</label>
                            <select
                                value={fromClassId}
                                onChange={(e) => setFromClassId(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                <option value="">Select Class...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="mt-4 w-full text-white bg-slate-800 hover:bg-slate-900 focus:ring-4 focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        Load Students
                    </button>
                </div>

                {/* Destination Config */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <span className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                        Configure Destination
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Target Session</label>
                            <select
                                value={toSessionId}
                                onChange={(e) => setToSessionId(e.target.value)}
                                className="bg-amber-50 border border-amber-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            >
                                <option value="">Select Session...</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Promote To Class</label>
                            <select
                                value={toClassId}
                                onChange={(e) => setToClassId(e.target.value)}
                                className="bg-amber-50 border border-amber-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            >
                                <option value="">Select Class...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Assign Section</label>
                            <select
                                value={toSectionId}
                                onChange={(e) => setToSectionId(e.target.value)}
                                className="bg-amber-50 border border-amber-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            >
                                <option value="">Select Section...</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handlePromote}
                        disabled={loading || selectedStudentIds.length === 0}
                        className="mt-4 w-full text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed focus:ring-4 focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                    >
                        {loading ? 'Processing...' : `Execute Promotion for ${selectedStudentIds.length} Students`}
                    </button>
                </div>
            </div>

            {/* Student Selection Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                        <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                        Select Students
                    </h2>
                    <span className="text-sm text-slate-500 font-medium">{students.length} students loaded</span>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-500 relative">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th scope="col" className="p-4 w-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                                            checked={students.length > 0 && selectedStudentIds.length === students.length}
                                            onChange={toggleAll}
                                        />
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Student Name</th>
                                <th scope="col" className="px-6 py-3">Current Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Please select a source session and class, then click "Load Students".
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => {
                                    const isSelected = selectedStudentIds.includes(student.id);

                                    // Find current enrollment status for display
                                    const currentEnrollment = student.enrollments?.find((e: any) => e.academicSession?.id === parseInt(fromSessionId));

                                    return (
                                        <tr
                                            key={student.id}
                                            className={`border-b hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 hover:bg-amber-100' : 'bg-white'}`}
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <td className="p-4 w-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer pt-1"
                                                        checked={isSelected}
                                                        onChange={() => { }} // Handled by tr onClick
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">#{student.id}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${currentEnrollment?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                    currentEnrollment?.status === 'PROMOTED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {currentEnrollment?.status || 'UNKNOWN'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
