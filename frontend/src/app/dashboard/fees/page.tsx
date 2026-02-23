"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function FeesDashboardPage() {
    const [activeTab, setActiveTab] = useState<'SETUP' | 'STRUCTURES' | 'COLLECTION'>('SETUP');
    const [mounted, setMounted] = useState(false);

    // --- Setup State ---
    const [categories, setCategories] = useState<any[]>([]);
    const [structures, setStructures] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [globalSettings, setGlobalSettings] = useState({ feeDueDate: 15, lateFeePerDay: 50.0 });
    const [savingSettings, setSavingSettings] = useState(false);
    const [loadingSetup, setLoadingSetup] = useState(false);

    // New Category Form
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDesc, setNewCategoryDesc] = useState("");

    // New Structure Form
    const [formClassId, setFormClassId] = useState("");
    const [formCategoryId, setFormCategoryId] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formAcademicYear, setFormAcademicYear] = useState("2026-2027");

    // New Discount Form
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [newDiscountName, setNewDiscountName] = useState("");
    const [newDiscountType, setNewDiscountType] = useState("FLAT");
    const [newDiscountValue, setNewDiscountValue] = useState("");

    // Manage Structures State
    const [structureSearchClassId, setStructureSearchClassId] = useState("");
    const [editingStructure, setEditingStructure] = useState<any>(null);
    const [editAmount, setEditAmount] = useState("");
    const [editYear, setEditYear] = useState("");

    // --- Collection State ---
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [collectionYear, setCollectionYear] = useState("2026-2027");
    const [studentFeeDetails, setStudentFeeDetails] = useState<any>(null);
    const [loadingCollection, setLoadingCollection] = useState(false);

    // Payment Form
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [payAmount, setPayAmount] = useState("");
    const [payMethod, setPayMethod] = useState("CASH");
    const [payRemarks, setPayRemarks] = useState("");
    const [receiptData, setReceiptData] = useState<any>(null); // For receipt modal

    // Fetch Setup Data
    useEffect(() => {
        const fetchSetupData = async () => {
            try {
                const [catRes, structRes, classRes, studentRes, settingsRes, discountRes, sessionRes] = await Promise.all([
                    fetch("http://localhost:3000/fees/categories"),
                    fetch("http://localhost:3000/fees/structures"),
                    fetch("http://localhost:3000/classes"),
                    fetch("http://localhost:3000/students"),
                    fetch("http://localhost:3000/fees/settings"),
                    fetch("http://localhost:3000/fees/discounts"),
                    fetch("http://localhost:3000/academic-sessions")
                ]);
                if (catRes.ok) setCategories(await catRes.json());
                if (structRes.ok) setStructures(await structRes.json());
                if (classRes.ok) setClasses(await classRes.json());
                if (studentRes.ok) setStudents(await studentRes.json());
                if (settingsRes.ok) setGlobalSettings(await settingsRes.json());
                if (discountRes.ok) setDiscounts(await discountRes.json());

                if (sessionRes.ok) {
                    const sessList = await sessionRes.json();
                    setSessions(sessList);
                    const active = sessList.find((s: any) => s.isActive);
                    if (active) setCollectionYear(active.name);
                }
            } catch (err) {
                console.error("Failed to load setup data", err);
            }
        };
        fetchSetupData();
        setMounted(true);
    }, []);

    // Refresh Setup Data helper
    const refreshSetupData = async () => {
        const [catRes, structRes] = await Promise.all([
            fetch("http://localhost:3000/fees/categories"),
            fetch("http://localhost:3000/fees/structures")
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (structRes.ok) setStructures(await structRes.json());
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch("http://localhost:3000/fees/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    feeDueDate: parseInt(globalSettings.feeDueDate.toString()),
                    lateFeePerDay: parseFloat(globalSettings.lateFeePerDay.toString())
                })
            });
            if (res.ok) {
                toast.success("Global Settings Saved!");
                setGlobalSettings(await res.json());
            } else throw new Error("Failed to save settings");
        } catch (err) {
            toast.error("Failed to save global settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleCreateDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/fees/discounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newDiscountName,
                    type: newDiscountType,
                    value: parseFloat(newDiscountValue)
                })
            });
            if (res.ok) {
                toast.success("Discount Category Created!");
                setNewDiscountName("");
                setNewDiscountValue("");
                const dRes = await fetch("http://localhost:3000/fees/discounts");
                if (dRes.ok) setDiscounts(await dRes.json());
            } else throw new Error("Creation failed");
        } catch (err) {
            toast.error("Failed to create discount");
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/fees/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName, description: newCategoryDesc })
            });
            if (res.ok) {
                toast.success("Fee Category Created!");
                setNewCategoryName("");
                setNewCategoryDesc("");
                refreshSetupData();
            } else throw new Error("Creation failed");
        } catch (err) {
            toast.error("Failed to create category");
        }
    };

    const handleCreateStructure = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/fees/structures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: parseInt(formClassId),
                    feeCategoryId: parseInt(formCategoryId),
                    amount: parseFloat(formAmount),
                    academicYear: formAcademicYear
                })
            });
            if (res.ok) {
                toast.success("Fee Structure Created!");
                setFormAmount("");
                refreshSetupData();
            } else {
                const errData = await res.json();
                throw new Error(errData.message || "Creation failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create structure");
        }
    };

    const handleUpdateStructure = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStructure) return;
        try {
            const res = await fetch(`http://localhost:3000/fees/structures/${editingStructure.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(editAmount),
                    academicYear: editYear
                })
            });
            if (res.ok) {
                toast.success("Fee Structure Updated!");
                setEditingStructure(null);
                refreshSetupData();
            } else {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update structure");
        }
    };

    // Filter Students based on Search Query
    const filteredStudents = students.filter(s => {
        if (!searchQuery) return false;
        const searchLower = searchQuery.toLowerCase();
        return s.id.toString().includes(searchLower) ||
            s.firstName.toLowerCase().includes(searchLower) ||
            s.lastName.toLowerCase().includes(searchLower);
    });

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentId(studentId);
        const student = students.find(s => s.id.toString() === studentId);
        if (student) {
            setSearchQuery(`${student.firstName} ${student.lastName} (ID: ${student.id})`);
        }
    };

    // Fetch Student Fees whenever student changes
    useEffect(() => {
        if (!selectedStudentId) {
            setStudentFeeDetails(null);
            setSelectedMonths([]);
            return;
        }

        const fetchStudentFees = async () => {
            setLoadingCollection(true);
            try {
                const res = await fetch(`http://localhost:3000/fees/student/${selectedStudentId}?academicYear=${collectionYear}`);
                if (res.ok) {
                    setStudentFeeDetails(await res.json());
                    setSelectedMonths([]);
                }
            } catch (err) {
                console.error("Failed to load student fees", err);
            } finally {
                setLoadingCollection(false);
            }
        };
        fetchStudentFees();
    }, [selectedStudentId, collectionYear]);

    const handleCollectPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMonths.length === 0) return;

        try {
            setLoadingCollection(true);
            const res = await fetch("http://localhost:3000/fees/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: parseInt(selectedStudentId),
                    feeMonths: selectedMonths,
                    amountPaid: parseFloat(payAmount),
                    paymentMethod: payMethod,
                    remarks: payRemarks,
                    academicYear: collectionYear
                })
            });

            if (res.ok) {
                const receipt = await res.json();
                toast.success("Payment successful!");

                // Show Receipt Modal
                const student = students.find(s => s.id.toString() === selectedStudentId);

                setReceiptData({
                    receiptNumber: receipt.receiptNumber,
                    paymentDate: receipt.payments[0]?.paymentDate || new Date(),
                    amountPaid: receipt.totalPaid,
                    paymentMethod: payMethod,
                    studentName: `${student.firstName} ${student.lastName}`,
                    feeCategory: studentFeeDetails?.applicableCategories?.join(', ') || 'General',
                    academicYear: studentFeeDetails?.academicYear,
                    monthsPaid: selectedMonths.join(', ')
                });

                // Refresh fee list
                setSelectedMonths([]);
                setPayAmount("");
                setPayRemarks("");

                const feesRes = await fetch(`http://localhost:3000/fees/student/${selectedStudentId}?academicYear=${collectionYear}`);
                if (feesRes.ok) setStudentFeeDetails(await feesRes.json());

            } else {
                const errData = await res.json();
                throw new Error(errData.message || "Payment failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to process payment");
        } finally {
            setLoadingCollection(false);
        }
    };

    const printReceipt = () => {
        window.print();
    };

    if (!mounted) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <main className="p-4 flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto printable-area">
            <Toaster position="top-right" />
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    .printable-receipt, .printable-receipt * { visibility: visible; text-shadow: none; }
                    .printable-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none !important; }
                    .no-print { display: none !important; }
                    html, body, main { height: auto !important; min-height: auto !important; overflow: visible !important; background: white !important; }
                }
            `}} />

            <h1 className="text-3xl font-bold mb-6 text-slate-800 no-print">Fee Management</h1>

            {/* Receipt Modal Overlay */}
            {receiptData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 no-print">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg printable-receipt">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase tracking-wider">{process.env.NEXT_PUBLIC_SCHOOL_NAME || 'EduSphere'}</h2>
                            <p className="text-gray-500">Official Fee Receipt</p>
                        </div>

                        <div className="border-t border-b border-gray-200 py-4 mb-6 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Receipt No:</span>
                                <p className="font-bold">{receiptData.receiptNumber}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date:</span>
                                <p className="font-bold">{new Date(receiptData.paymentDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Student Name:</span>
                                <p className="font-bold">{receiptData.studentName}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Academic Year:</span>
                                <p className="font-bold">{receiptData.academicYear}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th className="py-2">Description</th>
                                        <th className="py-2">Method</th>
                                        <th className="py-2 text-right">Amount Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4">{receiptData.feeCategory} Fee</td>
                                        <td className="py-4">{receiptData.paymentMethod}</td>
                                        <td className="py-4 text-right font-bold">${parseFloat(receiptData.amountPaid).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200 text-xs text-center text-gray-500 flex justify-between">
                            <p>Authorized Signature: ____________</p>
                            <p>Thank you.</p>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4 no-print">
                            <button onClick={() => setReceiptData(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
                            <button onClick={printReceipt} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Print Receipt</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center border-b border-gray-200 no-print">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab('SETUP')}
                            className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${activeTab === 'SETUP' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                        >
                            Fee Setup (Admin)
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab('STRUCTURES')}
                            className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${activeTab === 'STRUCTURES' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                        >
                            Manage Structures
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab('COLLECTION')}
                            className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${activeTab === 'COLLECTION' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                        >
                            Fee Collection
                        </button>
                    </li>
                </ul>
                <div className="pb-2">
                    <Link href="/dashboard/fees/reports" className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        View Fee Reports
                    </Link>
                </div>
            </div>

            {/* TAB: SETUP */}
            {activeTab === 'SETUP' && (
                <div className="space-y-6 no-print animate-in fade-in duration-300">
                    {/* Global Configuration */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Global Configuration</h2>
                        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Monthly Due Date (Day)</label>
                                <input
                                    type="number" min="1" max="28"
                                    value={globalSettings.feeDueDate}
                                    onChange={(e) => setGlobalSettings({ ...globalSettings, feeDueDate: parseInt(e.target.value) || 15 })}
                                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Day of the month (e.g., 15th)</p>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Late Fee Per Day ($)</label>
                                <input
                                    type="number" step="0.01"
                                    value={globalSettings.lateFeePerDay}
                                    onChange={(e) => setGlobalSettings({ ...globalSettings, lateFeePerDay: parseFloat(e.target.value) || 0 })}
                                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Applied daily if overdue</p>
                            </div>
                            <div>
                                <button type="submit" disabled={savingSettings} className="text-white bg-green-600 hover:bg-green-700 transition-colors py-2.5 px-6 rounded text-sm w-full font-medium disabled:opacity-50">
                                    {savingSettings ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Category */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">1. Add Fee Category</h2>
                            <form onSubmit={handleCreateCategory}>
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Category Name</label>
                                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Curriculum Activity" className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                                    <input type="text" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 px-4 rounded text-sm w-full font-medium">Create Category</button>
                            </form>

                            <h3 className="text-sm font-bold mt-6 mb-2 text-slate-800">Existing Categories:</h3>
                            <ul className="text-sm text-gray-600 max-h-32 overflow-y-auto list-disc pl-5">
                                {categories.map(c => <li key={c.id}>{c.name}</li>)}
                            </ul>
                        </div>

                        {/* Assign Structure */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">2. Assign Fee Structure to Class</h2>
                            <form onSubmit={handleCreateStructure}>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Class</label>
                                        <select value={formClassId} onChange={(e) => setFormClassId(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required>
                                            <option value="">Select</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Category</label>
                                        <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required>
                                            <option value="">Select</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Amount ($)</label>
                                        <input type="number" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Academic Year</label>
                                        <input type="text" value={formAcademicYear} onChange={(e) => setFormAcademicYear(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required />
                                    </div>
                                </div>
                                <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 px-4 rounded text-sm w-full font-medium">Define Structure</button>
                            </form>
                        </div>
                    </div>

                    {/* Manage Discounts */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">3. Manage Discount Categories</h2>
                        <form onSubmit={handleCreateDiscount} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Discount Name</label>
                                <input type="text" value={newDiscountName} onChange={(e) => setNewDiscountName(e.target.value)} placeholder="e.g. Sibling Discount" className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Type</label>
                                <select value={newDiscountType} onChange={(e) => setNewDiscountType(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required>
                                    <option value="FLAT">Flat Amount ($)</option>
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Value</label>
                                <input type="number" step="0.01" value={newDiscountValue} onChange={(e) => setNewDiscountValue(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 transition-colors py-2.5 px-6 rounded text-sm w-full font-medium">Create Discount</button>
                            </div>
                        </form>

                        <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Discount Name</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map(d => (
                                        <tr key={d.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{d.name}</td>
                                            <td className="px-6 py-4">{d.type}</td>
                                            <td className="px-6 py-4">{d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}</td>
                                        </tr>
                                    ))}
                                    {discounts.length === 0 && (
                                        <tr><td colSpan={3} className="px-6 py-4 text-center">No discounts found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: STRUCTURES */}
            {activeTab === 'STRUCTURES' && (
                <div className="space-y-6 no-print animate-in fade-in duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Manage Fee Structures</h2>
                            <div className="w-64">
                                <select
                                    value={structureSearchClassId}
                                    onChange={(e) => setStructureSearchClassId(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Filter by Class (All)</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Class</th>
                                        <th scope="col" className="px-6 py-3">Category</th>
                                        <th scope="col" className="px-6 py-3">Amount ($)</th>
                                        <th scope="col" className="px-6 py-3">Academic Year</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {structures
                                        .filter(s => !structureSearchClassId || s.class.id.toString() === structureSearchClassId)
                                        .map(s => (
                                            <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{s.class.name}</td>
                                                <td className="px-6 py-4">{s.feeCategory.name}</td>
                                                <td className="px-6 py-4">${s.amount}</td>
                                                <td className="px-6 py-4">{s.academicYear}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setEditingStructure(s);
                                                            setEditAmount(s.amount.toString());
                                                            setEditYear(s.academicYear);
                                                        }}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            {structures.filter(s => !structureSearchClassId || s.class.id.toString() === structureSearchClassId).length === 0 && (
                                <div className="text-center py-8 text-gray-500">No fee structures found for this selection.</div>
                            )}
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {editingStructure && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                                <h3 className="text-lg font-bold mb-4 text-slate-800">Edit Fee Structure</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Updating <span className="font-semibold">{editingStructure.feeCategory.name}</span> for <span className="font-semibold">{editingStructure.class.name}</span>.
                                </p>
                                <form onSubmit={handleUpdateStructure}>
                                    <div className="mb-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Amount ($)</label>
                                        <input
                                            type="number" step="0.01"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Academic Year</label>
                                        <input
                                            type="text"
                                            value={editYear}
                                            onChange={(e) => setEditYear(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setEditingStructure(null)}
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: COLLECTION */}
            {activeTab === 'COLLECTION' && (
                <div className="no-print animate-in fade-in duration-300">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 relative z-20">
                        <div className="w-full md:w-1/2">
                            <label className="block mb-2 text-sm font-medium text-gray-900">Search Student by Name or ID</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (selectedStudentId) setSelectedStudentId(""); // Clear selection if typing
                                }}
                                placeholder="Search e.g., 'John', '12'"
                                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-3 transition-colors focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />

                            {/* Search Results Dropdown */}
                            {searchQuery && !selectedStudentId && (
                                <ul className="absolute z-30 mt-1 w-full md:w-1/2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(s => (
                                            <li
                                                key={s.id}
                                                onClick={() => handleSelectStudent(s.id.toString())}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                            >
                                                <div className="font-medium text-gray-900">{s.firstName} {s.lastName}</div>
                                                <div className="text-xs text-gray-500">ID: {s.id}</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-3 text-sm text-gray-500">No students found matching your search.</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Top Right: Collection Year Setting */}
                        <div className="w-full md:w-1/4 absolute top-6 right-6">
                            <label className="block mb-2 text-sm font-bold text-amber-700">Academic Year Filter</label>
                            <select
                                value={collectionYear}
                                onChange={(e) => setCollectionYear(e.target.value)}
                                className="bg-amber-50 border border-amber-300 text-amber-900 text-sm font-semibold rounded-lg block w-full p-2.5 transition-colors focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                            >
                                {sessions.map(s => (
                                    <option key={s.id} value={s.name}>{s.name} {s.isActive ? '(Current)' : ''}</option>
                                ))}
                            </select>
                            <p className="text-xs text-amber-600 mt-1">Changes the dynamic fee ledger.</p>
                        </div>
                    </div>

                    {selectedStudentId && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300 relative z-10">
                            {/* Left: 12-Month Fee Grid */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold mb-4 text-slate-800">12-Month Fee Overview</h2>
                                {loadingCollection && <div className="text-sm text-gray-500 animate-pulse">Loading fees...</div>}
                                {!loadingCollection && !studentFeeDetails && <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center h-32">Select a student to view fee details.</div>}

                                {studentFeeDetails && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {studentFeeDetails.monthlyBreakdown.map((month: any) => {
                                            const isSelected = selectedMonths.includes(month.monthKey);
                                            const canPay = month.outstanding > 0;
                                            return (
                                                <div
                                                    key={month.monthKey}
                                                    onClick={() => {
                                                        if (canPay) {
                                                            setSelectedMonths(prev =>
                                                                prev.includes(month.monthKey)
                                                                    ? prev.filter(m => m !== month.monthKey)
                                                                    : [...prev, month.monthKey]
                                                            );
                                                        } else if (month.status === 'PAID' && month.payments?.length > 0) {
                                                            const lastPayment = month.payments[month.payments.length - 1];
                                                            const student = students.find(s => s.id.toString() === selectedStudentId);
                                                            setReceiptData({
                                                                receiptNumber: lastPayment.receiptNumber,
                                                                paymentDate: lastPayment.paymentDate,
                                                                amountPaid: lastPayment.amountPaid,
                                                                paymentMethod: lastPayment.paymentMethod,
                                                                studentName: `${student?.firstName} ${student?.lastName}`,
                                                                feeCategory: studentFeeDetails?.applicableCategories?.join(', ') || 'General',
                                                                academicYear: studentFeeDetails?.academicYear,
                                                                monthsPaid: month.monthName
                                                            });
                                                        }
                                                    }}
                                                    className={`p-4 border rounded-lg transition-all relative ${canPay || month.status === 'PAID' ? 'cursor-pointer hover:shadow-md' : 'opacity-75 bg-slate-50'
                                                        } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 scale-[1.02] shadow-md z-10' :
                                                            month.status === 'OVERDUE' ? 'border-red-200 bg-red-50' :
                                                                month.status === 'PAID' ? 'border-green-200 bg-green-50' :
                                                                    month.status === 'PARTIAL' ? 'border-yellow-200 bg-yellow-50' :
                                                                        'border-slate-200 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-bold text-slate-800 text-sm">{month.monthName}</h3>
                                                        <div className="flex items-center gap-2">
                                                            {month.status === 'PAID' && month.payments?.length > 0 && (
                                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                                            )}
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${month.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                                month.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                                                    month.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-slate-100 text-slate-800'
                                                                }`}>
                                                                {month.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-slate-600">
                                                        <div className="flex justify-between"><span>Base:</span> <span>${month.baseFee}</span></div>
                                                        {month.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span> <span>-${month.discountAmount}</span></div>}
                                                        {month.lateFee > 0 && <div className="flex justify-between text-red-600"><span>Late Fee:</span> <span>+${month.lateFee}</span></div>}
                                                        <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-semibold text-slate-800">
                                                            <span>Balance:</span>
                                                            <span className={month.outstanding > 0 ? 'text-red-600' : 'text-green-600'}>${Number(month.outstanding || 0).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Right: Payment Form */}
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 h-fit sticky top-6">
                                <h2 className="text-xl font-bold mb-4 text-slate-800">Collect Payment</h2>
                                {selectedMonths.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic flex flex-col h-48 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                                        Select pending months from the left grid to collect payment.
                                    </div>
                                ) : (
                                    <form onSubmit={handleCollectPayment} className="bg-white p-5 shadow-md border border-gray-200 rounded-lg animate-in zoom-in-95 duration-200">
                                        <div className="mb-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900">Selected Months ({selectedMonths.length})</label>
                                            <div className="bg-gray-100 border border-gray-300 text-sm rounded-lg block w-full p-2.5 text-gray-600 font-medium break-words">
                                                {selectedMonths.map(mkey => studentFeeDetails.monthlyBreakdown.find((m: any) => m.monthKey === mkey)?.monthName).join(', ')}
                                            </div>
                                        </div>

                                        {(() => {
                                            const totalBalance = selectedMonths.reduce((sum, mkey) => {
                                                const m = studentFeeDetails.monthlyBreakdown.find((m: any) => m.monthKey === mkey);
                                                return sum + (Number(m?.outstanding) || 0);
                                            }, 0);

                                            return (
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-bold text-blue-700">Amount Paying ($)</label>
                                                        <span className="text-xs text-gray-500 font-medium">Total Balance: ${totalBalance.toFixed(2)}</span>
                                                    </div>
                                                    <input
                                                        type="number" step="0.01"
                                                        value={payAmount}
                                                        onChange={(e) => setPayAmount(e.target.value)}
                                                        placeholder={`Recommended: ${totalBalance.toFixed(2)}`}
                                                        className="bg-blue-50 border-2 border-blue-200 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold text-blue-900 transition-colors"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPayAmount(totalBalance.toFixed(2))}
                                                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        Fill Total Balance
                                                    </button>
                                                </div>
                                            );
                                        })()}

                                        <div className="mb-5 text-sm font-medium">
                                            <label className="block mb-3 text-gray-900">Payment Method</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['CASH', 'CARD', 'ONLINE', 'CHEQUE'].map(method => (
                                                    <label key={method} className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${payMethod === method ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}>
                                                        <input type="radio" name="payMethod" value={method} checked={payMethod === method} onChange={(e) => setPayMethod(e.target.value)} className="sr-only" />
                                                        <span className="font-medium text-xs">{method}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block mb-2 text-sm font-medium text-gray-900">Remarks/Ref No.</label>
                                            <input type="text" value={payRemarks} onChange={(e) => setPayRemarks(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 transition-colors focus:ring-blue-500 focus:border-blue-500" placeholder="Optional transaction ID..." />
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="submit" disabled={loadingCollection} className="flex-1 text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors shadow-sm">
                                                Confirm Payment
                                            </button>
                                            <button type="button" onClick={() => setSelectedMonths([])} className="px-5 py-3 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                                Clear Selection
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
