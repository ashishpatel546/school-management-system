"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import useSWR from "swr";
import { API_BASE_URL, fetcher } from "@/lib/api";
import { Loader } from "@/components/ui/Loader";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'system' | 'examination'>('system');

    // --- System Settings State ---
    const { data: sessions = [], error, isLoading: loading, mutate } = useSWR('/academic-sessions', fetcher);
    const [newSessionName, setNewSessionName] = useState("");
    const [newSessionStart, setNewSessionStart] = useState("");
    const [newSessionEnd, setNewSessionEnd] = useState("");

    // --- Examination Settings State ---
    const { data: examCategories = [], mutate: mutateCategories } = useSWR('/exams/categories', fetcher);
    const { data: examSettings, mutate: mutateSettings } = useSWR('/exams/settings', fetcher);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDesc, setNewCategoryDesc] = useState("");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [selectedTargetCategoryId, setSelectedTargetCategoryId] = useState<number | null>(null);

    // Grading System Settings State
    const [selectedGradingSessionId, setSelectedGradingSessionId] = useState<number | null>(null);
    const { data: gradingSystems = [], mutate: mutateGradingSystems } = useSWR(
        selectedGradingSessionId ? `/exams/grading-system/session/${selectedGradingSessionId}` : null,
        fetcher
    );
    const [newGradeName, setNewGradeName] = useState("");
    const [newGradeMin, setNewGradeMin] = useState<string>("");
    const [newGradeMax, setNewGradeMax] = useState<string>("");
    const [newGradeIsFail, setNewGradeIsFail] = useState(false);


    useEffect(() => {
        if (examSettings && examSettings.hasOwnProperty('contributingCategoryIds')) {
            setSelectedCategoryIds(examSettings.contributingCategoryIds || []);
            setSelectedTargetCategoryId(examSettings.finalTargetCategoryId || null);
        }
    }, [examSettings]);

    // Handle initial session selection for grading
    useEffect(() => {
        if (activeTab === 'examination' && !selectedGradingSessionId && sessions.length > 0) {
            const activeSession = sessions.find((s: any) => s.isActive);
            if (activeSession) {
                setSelectedGradingSessionId(activeSession.id);
            } else {
                setSelectedGradingSessionId(sessions[0].id);
            }
        }
    }, [activeTab, sessions, selectedGradingSessionId]);


    // --- System Setting Handlers ---
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

    // --- Examination Setting Handlers ---
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/exams/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName, description: newCategoryDesc })
            });
            if (res.ok) {
                toast.success("Exam Category created!");
                setNewCategoryName("");
                setNewCategoryDesc("");
                mutateCategories();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create category");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleToggleCategory = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/exams/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success("Category status updated!");
                mutateCategories();
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const toggleFinalResultCategory = (id: number) => {
        if (id === selectedTargetCategoryId) {
            toast.error("The Target Final Category cannot also be a contributing category.");
            return;
        }
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleTargetCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? parseInt(e.target.value) : null;
        if (val && selectedCategoryIds.includes(val)) {
            // Remove from contributing if it was there
            setSelectedCategoryIds(prev => prev.filter(id => id !== val));
        }
        setSelectedTargetCategoryId(val);
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/exams/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contributingCategoryIds: selectedCategoryIds,
                    finalTargetCategoryId: selectedTargetCategoryId
                })
            });
            if (res.ok) {
                toast.success("Exam settings updated!");
                mutateSettings();
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleCreateGrading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGradingSessionId) return toast.error("Select a session first");

        try {
            const res = await fetch(`${API_BASE_URL}/exams/grading-system`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: selectedGradingSessionId,
                    gradeName: newGradeName,
                    minPercentage: parseFloat(newGradeMin),
                    maxPercentage: parseFloat(newGradeMax),
                    isFailGrade: newGradeIsFail
                })
            });
            if (res.ok) {
                toast.success("Grading band created!");
                setNewGradeName("");
                setNewGradeMin("");
                setNewGradeMax("");
                setNewGradeIsFail(false);
                mutateGradingSystems();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create grading");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleDeleteGrading = async (id: number) => {
        if (!confirm("Are you sure you want to delete this grading band?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/exams/grading-system/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Grading band deleted");
                mutateGradingSystems();
            }
        } catch (err) {
            toast.error("Network error");
        }
    };


    return (
        <main className="p-4 flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto">
            {error && <div className="p-4 text-red-600 mb-4 bg-red-50 rounded">Error loading sessions</div>}
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-slate-800 pb-2">Settings</h1>
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${activeTab === 'system' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        System Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('examination')}
                        className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${activeTab === 'examination' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Examination Settings
                    </button>
                </div>
            </div>

            {activeTab === 'system' && (
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
            )}

            {activeTab === 'examination' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {/* Exam Categories panel */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Exam Categories</h2>

                            <form onSubmit={handleCreateCategory} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Add New Exam Category</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700">Name (e.g. SA1, Final)</label>
                                        <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700">Description</label>
                                        <input type="text" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">Create Category</button>
                            </form>

                            <div className="relative overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examCategories.map((c: any) => (
                                            <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {c.isActive ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded uppercase">Active</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleToggleCategory(c.id, c.isActive)} className="text-blue-600 hover:underline font-medium text-xs">
                                                        {c.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {examCategories.length === 0 && (
                                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">No exam categories found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Final Result Settings panel */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Final Result Settings</h2>

                            <div className="mb-6">
                                <label className="block mb-2 text-sm font-semibold text-slate-700">Target Final Category</label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                    value={selectedTargetCategoryId || ''}
                                    onChange={handleTargetCategoryChange}
                                >
                                    <option value="">-- None Configured --</option>
                                    {examCategories.filter((c: any) => c.isActive).map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">This category's marks will be automatically generated by summing the contributing components.</p>
                            </div>

                            <p className="text-sm font-semibold text-slate-700 mb-3">Contributing Categories:</p>
                            <div className="flex flex-col gap-2 mb-6">
                                {examCategories.filter((c: any) => c.isActive).map((c: any) => {
                                    const isTarget = c.id === selectedTargetCategoryId;
                                    return (
                                        <label key={c.id} className={`flex items-center space-x-2 text-sm font-medium ${isTarget ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800 cursor-pointer'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategoryIds.includes(c.id)}
                                                onChange={() => toggleFinalResultCategory(c.id)}
                                                disabled={isTarget}
                                                className={`rounded ${isTarget ? 'text-gray-400 focus:ring-gray-400 cursor-not-allowed' : 'text-blue-600 focus:ring-blue-500'}`}
                                            />
                                            <span>{c.name} {isTarget && <span className="text-xs italic font-normal text-slate-400">(Selected as Target)</span>}</span>
                                        </label>
                                    );
                                })}
                                {examCategories.filter((c: any) => c.isActive).length === 0 && (
                                    <span className="text-sm text-slate-500 italic">Please create and activate exam categories first.</span>
                                )}
                            </div>
                            <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">Save Result Settings</button>
                        </div>
                    </div>


                    {/* Grading System Engine */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Grading System Rules</h2>
                            <div className="mt-2 sm:mt-0">
                                <label className="text-xs text-slate-500 mr-2 uppercase font-semibold">For Session:</label>
                                <select
                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
                                    value={selectedGradingSessionId || ''}
                                    onChange={(e) => setSelectedGradingSessionId(Number(e.target.value))}
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} {s.isActive && '(Active)'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <form onSubmit={handleCreateGrading} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Add Grading Band</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Grade (e.g. A+)</label>
                                    <input type="text" value={newGradeName} onChange={(e) => setNewGradeName(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Min %</label>
                                    <input type="number" step="0.01" value={newGradeMin} onChange={(e) => setNewGradeMin(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Max % <span className="text-[9px] font-normal lowercase">(excluding)</span></label>
                                    <input type="number" step="0.01" value={newGradeMax} onChange={(e) => setNewGradeMax(e.target.value)} required className="w-full text-sm border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newGradeIsFail}
                                            onChange={(e) => setNewGradeIsFail(e.target.checked)}
                                            className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                                        />
                                        <span className="text-red-600 font-bold">Is Fail?</span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={!selectedGradingSessionId} className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:bg-blue-300">Add Grade Band</button>
                        </form>

                        {!selectedGradingSessionId ? (
                            <div className="py-8 text-center text-slate-500 italic">Please select an academic session above.</div>
                        ) : (
                            <div className="relative overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Grade</th>
                                            <th className="px-4 py-3 text-center">Min %</th>
                                            <th className="px-4 py-3 text-center">Max % <span className="text-[10px] font-normal normal-case">(excluding)</span></th>
                                            <th className="px-4 py-3 text-center">Effect</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gradingSystems.map((g: any) => (
                                            <tr key={g.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-bold text-slate-800">{g.gradeName}</td>
                                                <td className="px-4 py-3 text-center font-medium">{g.minPercentage}%</td>
                                                <td className="px-4 py-3 text-center font-medium">{g.maxPercentage}%</td>
                                                <td className="px-4 py-3 text-center">
                                                    {g.isFailGrade ? (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">Fail</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Pass</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDeleteGrading(g.id)} className="text-red-500 hover:text-red-700 hover:underline font-medium text-xs">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {gradingSystems.length === 0 && (
                                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">No grading systems defined for this session.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </main>
    );
}
