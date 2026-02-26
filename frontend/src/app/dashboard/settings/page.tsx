"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import useSWR from "swr";
import { API_BASE_URL, fetcher } from "@/lib/api";
import { Loader } from "@/components/ui/Loader";

export default function SettingsPage() {
    const { data: sessions = [], error, isLoading: loading, mutate } = useSWR('/academic-sessions', fetcher);
    const [newSessionName, setNewSessionName] = useState("");
    const [newSessionStart, setNewSessionStart] = useState("");
    const [newSessionEnd, setNewSessionEnd] = useState("");

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/academic-sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newSessionName,
                    startDate: newSessionStart,
                    endDate: newSessionEnd,
                    isActive: sessions.length === 0, // First session defaults to active
                })
            });
            if (res.ok) {
                toast.success("Academic Session created!");
                setNewSessionName("");
                setNewSessionStart("");
                setNewSessionEnd("");
                mutate();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create session");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleSetActive = async (id: number) => {
        try {
            // Unset all active
            for (const s of sessions) {
                if (s.isActive && s.id !== id) {
                    await fetch(`${API_BASE_URL}/academic-sessions/${s.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isActive: false })
                    });
                }
            }
            // Set target active
            const res = await fetch(`${API_BASE_URL}/academic-sessions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true })
            });
            if (res.ok) {
                toast.success("Active session updated!");
                mutate();
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    return (
        <main className="p-4 flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto">
            {error && <div className="p-4 text-red-600 mb-4 bg-red-50 rounded">Error loading sessions</div>}
            <Toaster position="top-right" />
            <h1 className="text-3xl font-bold mb-6 text-slate-800">System Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Sessions panel */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Academic Sessions</h2>

                    <form onSubmit={handleCreateSession} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Add New Session</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">Name (e.g. 2026-2027)</label>
                                <input type="text" value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
                                <input type="date" value={newSessionStart} onChange={(e) => setNewSessionStart(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
                                <input type="date" value={newSessionEnd} onChange={(e) => setNewSessionEnd(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">Create Session</button>
                    </form>

                    {loading ? (
                        <Loader text="Loading sessions..." />
                    ) : (
                        <div className="relative overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Name</th>
                                        <th scope="col" className="px-4 py-3">Period</th>
                                        <th scope="col" className="px-4 py-3 text-center">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((s: any) => (
                                        <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                                            <td className="px-4 py-3 text-xs">
                                                {new Date(s.startDate).toLocaleDateString()} to {new Date(s.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {s.isActive ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded uppercase">Active</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!s.isActive && (
                                                    <button onClick={() => handleSetActive(s.id)} className="text-blue-600 hover:underline font-medium text-xs">
                                                        Set Active
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {sessions.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">No academic sessions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
