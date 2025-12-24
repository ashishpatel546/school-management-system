"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTeacherPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        isActive: true,
    });
    const [assignments, setAssignments] = useState<any[]>([]);

    // Assignment Form State
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const [teachersRes, classesRes, subjectsRes] = await Promise.all([
                    fetch(`http://127.0.0.1:3000/teachers`),
                    fetch(`http://127.0.0.1:3000/classes`),
                    fetch(`http://127.0.0.1:3000/extra-subjects`)
                ]);

                if (!teachersRes.ok) throw new Error("Failed to fetch teacher");
                const teachers = await teachersRes.json();
                const teacher = teachers.find((t: any) => t.id === parseInt(id));

                if (teacher) {
                    setFormData({
                        firstName: teacher.firstName,
                        lastName: teacher.lastName,
                        email: teacher.email,
                        isActive: teacher.isActive,
                    });
                    // Filter active assignments
                    const activeAssignments = teacher.subjectAssignments?.filter((a: any) => a.isActive) || [];
                    setAssignments(activeAssignments);
                } else {
                    setError("Teacher not found");
                }

                if (classesRes.ok) setClasses(await classesRes.json());
                if (subjectsRes.ok) setSubjects(await subjectsRes.json());

            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            // Note: Backend might need a specific PATCH endpoint for updating basic details
            // For now assuming a generic update or we might need to implement it
            const res = await fetch(`http://127.0.0.1:3000/teachers/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to update teacher");
            }

            router.push("/dashboard/teachers");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Failed to update teacher. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleAssignSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssignLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:3000/teachers/${id}/assign-subject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: parseInt(selectedClass),
                    sectionId: parseInt(selectedSection),
                    subjectId: parseInt(selectedSubject)
                })
            });

            if (!res.ok) throw new Error("Failed to assign subject");

            // Refresh logic - simplified by re-fetching or manually updating list
            // For now, let's just alert and maybe reload or append to list if we returned the new assignment
            alert("Subject assigned successfully");
            window.location.reload(); // Simple reload to refresh all data including history side effects if any
        } catch (err) {
            console.error(err);
            alert("Failed to assign subject");
        } finally {
            setAssignLoading(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    // Derived state for sections based on selected class
    const sectionsForClass = classes.find(c => c.id.toString() === selectedClass)?.sections || [];

    return (
        <main className="p-4 space-y-6">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Teacher</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900">First name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900">Last name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        />
                    </div>

                    <div className="flex items-center mb-6">
                        <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900">Active</label>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link href="/dashboard/teachers" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>

            {/* Subject Assignments */}
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-4 text-slate-800">Subject Assignments</h3>

                {/* List Current */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Current Assignments</h4>
                    {assignments.length === 0 ? (
                        <p className="text-gray-500 italic">No active subject assignments.</p>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Subject</th>
                                        <th scope="col" className="px-6 py-3">Class</th>
                                        <th scope="col" className="px-6 py-3">Section</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment: any) => (
                                        <tr key={assignment.id} className="bg-white border-b">
                                            <td className="px-6 py-4 font-medium text-gray-900">{assignment.subject?.name}</td>
                                            <td className="px-6 py-4">{assignment.class?.name}</td>
                                            <td className="px-6 py-4">{assignment.section?.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add New */}
                <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-700 mb-4">Assign New Subject</h4>
                    <form onSubmit={handleAssignSubject} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                <option value="">Select Class</option>
                                {classes.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Section</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
                            >
                                <option value="">Select Section</option>
                                {sectionsForClass.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={assignLoading || !selectedClass || !selectedSection || !selectedSubject}
                            className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                        >
                            {assignLoading ? 'Assigning...' : 'Assign'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
