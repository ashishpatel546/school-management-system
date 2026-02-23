"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditStudentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        isActive: true,
    });
    const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch('http://localhost:3000/fees/discounts')
            .then(res => res.json())
            .then(data => setAvailableDiscounts(data))
            .catch(err => console.error("Failed to load discounts", err));

        if (!id) return;
        const fetchStudent = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:3000/students/${id}`);
                if (!res.ok) throw new Error("Failed to fetch student");
                const student = await res.json();

                if (student) {
                    setFormData({
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        isActive: student.isActive,
                    });
                    if (student.discounts) {
                        setSelectedDiscounts(student.discounts.map((d: any) => d.id));
                    }
                } else {
                    setError("Student not found");
                }
            } catch (err) {
                setError("Failed to load student data");
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
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
            const payload = {
                ...formData,
                discountIds: selectedDiscounts
            };

            const res = await fetch(`http://127.0.0.1:3000/students/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to update student");
            }

            router.push("/dashboard/students");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Failed to update student. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <main className="p-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Student</h2>

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

                    {availableDiscounts.length > 0 && (
                        <div className="mb-6">
                            <label className="block mb-3 text-sm font-medium text-gray-900">Fee Discounts</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableDiscounts.map(d => (
                                    <label key={d.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedDiscounts.includes(d.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDiscounts([...selectedDiscounts, d.id]);
                                                } else {
                                                    setSelectedDiscounts(selectedDiscounts.filter(id => id !== d.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                            {d.name} ({d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link href="/dashboard/students" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
