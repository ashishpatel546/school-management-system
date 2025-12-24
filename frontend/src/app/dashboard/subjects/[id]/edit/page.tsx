"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditSubjectPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [formData, setFormData] = useState({
        name: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchSubject = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:3000/extra-subjects`); // Ideally fetch single subject
                if (!res.ok) throw new Error("Failed to fetch subjects");
                const subjects = await res.json();
                const subject = subjects.find((s: any) => s.id === parseInt(id));

                if (subject) {
                    setFormData({
                        name: subject.name,
                    });
                } else {
                    setError("Subject not found");
                }
            } catch (err) {
                setError("Failed to load subject data");
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`http://127.0.0.1:3000/extra-subjects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to update subject");
            }

            router.push("/dashboard/subjects");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Failed to update subject. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <main className="p-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Subject</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Subject Name</label>
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

                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link href="/dashboard/subjects" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
