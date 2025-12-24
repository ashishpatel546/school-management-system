"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditClassPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [sections, setSections] = useState<any[]>([]);
    const [newSectionName, setNewSectionName] = useState("");
    const [formData, setFormData] = useState({ name: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [currentClassTeacher, setCurrentClassTeacher] = useState<any>(null);

    // Helper to fetch class data
    const fetchClass = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [classesRes, teachersRes] = await Promise.all([
                fetch(`http://127.0.0.1:3000/classes`),
                fetch(`http://127.0.0.1:3000/teachers`)
            ]);

            if (!classesRes.ok) throw new Error("Failed to fetch classes");
            const classes = await classesRes.json();
            const cls = classes.find((c: any) => c.id === parseInt(id));

            if (teachersRes.ok) {
                setTeachers(await teachersRes.json());
            }

            if (cls) {
                setFormData({
                    name: cls.name,
                });
                setSections(cls.sections || []);
                setCurrentClassTeacher(cls.classTeacher);
                if (cls.classTeacher) setSelectedTeacher(cls.classTeacher.id.toString());
            } else {
                setError("Class not found");
            }
        } catch (err) {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClass();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`http://127.0.0.1:3000/classes/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to update class");
            }

            // Success message or toast could go here
            fetchClass(); // Refresh data
        } catch (err) {
            console.error(err);
            setError("Failed to update class. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectionName.trim()) return;

        try {
            const res = await fetch(`http://127.0.0.1:3000/classes/sections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: parseInt(id),
                    name: newSectionName
                })
            });
            if (!res.ok) throw new Error("Failed to add section");
            setNewSectionName("");
            fetchClass();
        } catch (err) {
            console.error(err);
            setError("Failed to add section.");
        }
    };

    const handleUpdateSection = async (sectionId: number, newName: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:3000/classes/sections/${sectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });
            if (!res.ok) throw new Error("Failed to update section");
            fetchClass();
        } catch (err) {
            console.error(err);
            setError("Failed to update section.");
        }
    };

    const handleDeleteSection = async (sectionId: number) => {
        if (!confirm("Are you sure you want to delete this section?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:3000/classes/sections/${sectionId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete section");
            fetchClass();
        } catch (err) {
            console.error(err);
            setError("Failed to delete section.");
        }
    };

    const handleAssignTeacher = async () => {
        if (!selectedTeacher) return;
        try {
            const res = await fetch(`http://127.0.0.1:3000/classes/${id}/teacher`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId: parseInt(selectedTeacher) })
            });
            if (!res.ok) throw new Error("Failed to assign teacher");
            fetchClass();
            alert("Teacher assigned successfully");
        } catch (err) {
            setError("Failed to assign teacher");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <main className="p-4 space-y-6">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Edit Class</h2>
                    <Link href="/dashboard/classes" className="text-blue-600 hover:underline">
                        &larr; Back to Classes
                    </Link>
                </div>

                {error && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">{error}</div>}

                <form onSubmit={handleClassSubmit} className="mb-8">
                    <div className="mb-6">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Class Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                {/* Class Teacher Assignment */}
                <div className="mb-8 border-t pt-6">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">Class Teacher</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium text-gray-900">Select Teacher</label>
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                <option value="">No Class Teacher</option>
                                {teachers.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAssignTeacher}
                            disabled={!selectedTeacher}
                            className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                        >
                            Assign Teacher
                        </button>
                    </div>
                    {currentClassTeacher && (
                        <p className="mt-2 text-sm text-green-600">
                            Current Class Teacher: <strong>{currentClassTeacher.firstName} {currentClassTeacher.lastName}</strong>
                        </p>
                    )}
                </div>

                {/* Sections Management */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">Manage Sections</h3>

                    <div className="space-y-3 mb-6">
                        {sections.length === 0 ? (
                            <p className="text-gray-500 italic">No sections found for this class.</p>
                        ) : (
                            sections.map((section: any) => (
                                <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                    <input
                                        type="text"
                                        defaultValue={section.name}
                                        onBlur={(e) => {
                                            if (e.target.value !== section.name) {
                                                handleUpdateSection(section.id, e.target.value);
                                            }
                                        }}
                                        className="bg-transparent border-none focus:ring-0 text-gray-800 font-medium w-full"
                                    />
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="text-red-600 hover:text-red-800 text-sm ml-4"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Section */}
                    <form onSubmit={handleAddSection} className="flex items-end gap-4 border-t pt-6 mt-6">
                        <div className="flex-1">
                            <label htmlFor="newSection" className="block mb-2 text-sm font-medium text-gray-900">Add New Section</label>
                            <input
                                type="text"
                                id="newSection"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                placeholder="e.g. Section C"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newSectionName.trim()}
                            className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Section
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
