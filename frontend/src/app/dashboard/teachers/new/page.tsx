"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddTeacherPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:3000/teachers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server Error:", errorData);
                throw new Error(errorData.message || "Failed to create teacher");
            }

            router.push("/dashboard/teachers");
            router.refresh();
        } catch (err: any) {
            console.error("Submission Error:", err);
            setError(err.message || "Failed to create teacher. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Teacher</h2>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                        {error}
                    </div>
                )}

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
                                placeholder="Jane"
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
                                placeholder="Smith"
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
                            placeholder="jane.smith@school.com"
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
                            disabled={loading}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Teacher'}
                        </button>
                        <Link href="/dashboard/teachers" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
