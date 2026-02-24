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
        fathersName: "",
        mothersName: "",
        aadhaarNumber: "",
        mobile: "",
        alternateMobile: "",
        category: "",
        bloodGroup: "",
        religion: "",
        gender: "",
        dateOfBirth: "",
        siblingId: "",
        isActive: true,
    });
    const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Sibling Modal State
    const [showSiblingModal, setShowSiblingModal] = useState(false);
    const [siblingSearch, setSiblingSearch] = useState("");
    const [siblingResults, setSiblingResults] = useState<any[]>([]);
    const [siblingLoading, setSiblingLoading] = useState(false);
    const [selectedSiblingObj, setSelectedSiblingObj] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [discRes] = await Promise.all([
                    fetch('http://localhost:3000/fees/discounts')
                ]);

                if (discRes.ok) setAvailableDiscounts(await discRes.json());

                if (!id) return;
                const studRes = await fetch(`http://127.0.0.1:3000/students/${id}`);
                if (!studRes.ok) throw new Error("Failed to fetch student");
                const student = await studRes.json();

                if (student) {
                    setFormData({
                        firstName: student.firstName || "",
                        lastName: student.lastName || "",
                        email: student.email || "",
                        fathersName: student.fathersName || "",
                        mothersName: student.mothersName || "",
                        aadhaarNumber: student.aadhaarNumber || "",
                        mobile: student.mobile || "",
                        alternateMobile: student.alternateMobile || "",
                        category: student.category || "",
                        bloodGroup: student.bloodGroup || "",
                        religion: student.religion || "",
                        gender: student.gender || "",
                        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
                        siblingId: student.siblingId ? student.siblingId.toString() : "",
                        isActive: student.isActive,
                    });
                    if (student.discounts) {
                        setSelectedDiscounts(student.discounts.map((d: any) => d.id));
                    }
                    // If a sibling is already set, load that sibling's info for display
                    if (student.siblingId) {
                        setSelectedSiblingObj({ id: student.siblingId, firstName: '(existing sibling)', lastName: '' });
                    }
                } else {
                    setError("Student not found");
                }
            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setFormData({ ...formData, [target.name]: value });
    };

    const handleSearchSibling = async () => {
        if (!siblingSearch) return;
        setSiblingLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/students?firstName=${siblingSearch}&lastName=${siblingSearch}`);
            if (res.ok) {
                const data = await res.json();
                setSiblingResults(data.filter((s: any) => s.id.toString() !== id));
            }
        } catch (err) {
            console.error("Failed to fetch sibling", err);
        } finally {
            setSiblingLoading(false);
        }
    };

    const selectSibling = (sibling: any) => {
        setSelectedSiblingObj(sibling);
        setFormData({
            ...formData,
            siblingId: sibling.id.toString(),
            fathersName: sibling.fathersName || formData.fathersName,
            mothersName: sibling.mothersName || formData.mothersName
        });
        setShowSiblingModal(false);
        setSiblingSearch("");
        setSiblingResults([]);
    };

    const clearSibling = () => {
        setSelectedSiblingObj(null);
        setFormData({ ...formData, siblingId: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                ...formData,
                siblingId: formData.siblingId ? parseInt(formData.siblingId) : null,
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
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update student");
            }

            router.push("/dashboard/students");
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to update student. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error && !formData.firstName) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <main className="p-4 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Edit Student</h2>
                    <Link href="/dashboard/students" className="text-blue-600 hover:underline">
                        &larr; Back to Students
                    </Link>
                </div>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-700 border-b pb-2">Basic Information</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div>
                                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900">First name <span className="text-red-500">*</span></label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900">Last name <span className="text-red-500">*</span></label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required />
                            </div>
                            <div>
                                <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900">Gender</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dateOfBirth" className="block mb-2 text-sm font-medium text-gray-900">Date of Birth</label>
                                <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" />
                            </div>
                            <div>
                                <label htmlFor="bloodGroup" className="block mb-2 text-sm font-medium text-gray-900">Blood Group</label>
                                <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">
                                    <option value="">Select Group</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="aadhaarNumber" className="block mb-2 text-sm font-medium text-gray-900">Aadhaar Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input type="text" id="aadhaarNumber" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-700 border-b pb-2">Contact Information</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email address <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" />
                            </div>
                            <div>
                                <label htmlFor="mobile" className="block mb-2 text-sm font-medium text-gray-900">Mobile Number</label>
                                <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" />
                            </div>
                            <div>
                                <label htmlFor="alternateMobile" className="block mb-2 text-sm font-medium text-gray-900">Alternate Mobile</label>
                                <input type="tel" id="alternateMobile" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" />
                            </div>
                        </div>
                    </div>

                    {/* Parent & Family Info */}
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-slate-700">Parent & Family Details</h3>
                            {!selectedSiblingObj ? (
                                <button type="button" onClick={() => setShowSiblingModal(true)} className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 focus:outline-none">
                                    + Add Sibling
                                </button>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">
                                        Linked Sibling: {selectedSiblingObj.firstName} {selectedSiblingObj.lastName} (ID: {selectedSiblingObj.id})
                                    </span>
                                    <button type="button" onClick={clearSibling} className="text-red-600 hover:text-red-800 text-xs font-medium underline">Remove Link</button>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="fathersName" className="block mb-2 text-sm font-medium text-gray-900">Father's Name</label>
                                <input type="text" id="fathersName" name="fathersName" value={formData.fathersName} onChange={handleChange} disabled={!!selectedSiblingObj} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed" />
                            </div>
                            <div>
                                <label htmlFor="mothersName" className="block mb-2 text-sm font-medium text-gray-900">Mother's Name</label>
                                <input type="text" id="mothersName" name="mothersName" value={formData.mothersName} onChange={handleChange} disabled={!!selectedSiblingObj} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed" />
                            </div>
                        </div>
                        {selectedSiblingObj && (
                            <p className="mt-2 text-xs text-blue-600 italic">Parent names are locked and synced with the linked sibling.</p>
                        )}
                    </div>

                    {/* Additional Demographics */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-700 border-b pb-2">Demographics</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">Category</label>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">
                                    <option value="">Select Category</option>
                                    <option value="General">General</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="OBC">OBC</option>
                                    <option value="EWS">EWS</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="religion" className="block mb-2 text-sm font-medium text-gray-900">Religion</label>
                                <select id="religion" name="religion" value={formData.religion} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">
                                    <option value="">Select Religion</option>
                                    <option value="HINDU">HINDU</option>
                                    <option value="MUSLIM">MUSLIM</option>
                                    <option value="SIKH">SIKH</option>
                                    <option value="CHRISTIAN">CHRISTIAN</option>
                                    <option value="PARSI">PARSI</option>
                                    <option value="OTHERS">OTHERS</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Administrative Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-700 border-b pb-2">Administrative Info</h3>
                        <div className="flex items-center mb-6">
                            <input
                                id="isActive"
                                name="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900">Account Active</label>
                        </div>

                        {availableDiscounts.length > 0 && (
                            <div className="mb-6">
                                <label className="block mb-3 text-sm font-medium text-gray-900">Fee Discounts applied to this student</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableDiscounts.map(d => (
                                        <label key={d.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedDiscounts.includes(d.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedDiscounts([...selectedDiscounts, d.id]);
                                                    else setSelectedDiscounts(selectedDiscounts.filter(did => did !== d.id));
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
                    </div>

                    <div className="flex items-center space-x-4 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-lg w-full sm:w-auto px-8 py-3 text-center disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link href="/dashboard/students" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-3">
                            Cancel
                        </Link>
                    </div>
                </form>

                {/* Sibling Search Modal */}
                {showSiblingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-xl font-semibold text-gray-900">Search Existing Sibling</h3>
                                <button type="button" onClick={() => setShowSiblingModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <form className="flex items-center space-x-2 mb-4" onSubmit={(e) => { e.preventDefault(); handleSearchSibling(); }}>
                                    <input type="text" value={siblingSearch} onChange={e => setSiblingSearch(e.target.value)} placeholder="Search Sibling by Name..." className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5" disabled={siblingLoading}>{siblingLoading ? '...' : 'Search'}</button>
                                </form>
                                <div className="mt-4">
                                    {siblingResults.length > 0 ? (
                                        <ul className="divide-y divide-gray-200 border rounded-lg max-h-64 overflow-y-auto">
                                            {siblingResults.map(s => (
                                                <li key={s.id} className="p-3 hover:bg-gray-50 flex justify-between items-center transition-colors">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                                                        <p className="text-xs text-gray-500">ID: {s.id} | Parents: {s.fathersName || 'N/A'}, {s.mothersName || 'N/A'}</p>
                                                    </div>
                                                    <button type="button" onClick={() => selectSibling(s)} className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-xs px-3 py-1.5 focus:outline-none">
                                                        Select
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic text-center py-4">Search to find siblings.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
