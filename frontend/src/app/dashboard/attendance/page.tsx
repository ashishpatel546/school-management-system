"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
}

interface Student {
    id: number;
    firstName: string;
    lastName: string;
}

interface Section {
    id: number;
    name: string;
    students: Student[];
}

interface ClassData {
    id: number;
    name: string;
    sections: Section[];
}

export default function AttendancePage() {
    const router = useRouter();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<number, { status: string, remarks: string }>>({});
    const [existingAttendance, setExistingAttendance] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Fetch Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [classesRes, teachersRes] = await Promise.all([
                    fetch("http://localhost:3000/classes"),
                    fetch("http://localhost:3000/teachers")
                ]);
                if (classesRes.ok) setClasses(await classesRes.json());
                if (teachersRes.ok) setTeachers(await teachersRes.json());
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        fetchInitialData();
    }, []);

    // Handle Class Selection Change
    useEffect(() => {
        setSelectedSectionId("");
        setStudents([]);
        setAttendanceRecords({});
        setExistingAttendance(null);
    }, [selectedClassId]);

    // Handle Section Selection Change
    useEffect(() => {
        if (selectedClassId && selectedSectionId) {
            const cls = classes.find(c => c.id.toString() === selectedClassId);
            const sec = cls?.sections.find(s => s.id.toString() === selectedSectionId);
            if (sec && sec.students) {
                setStudents(sec.students);
            } else {
                setStudents([]);
            }
        }
    }, [selectedClassId, selectedSectionId, classes]);

    // Fetch existing attendance for selected date and section
    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedClassId || !selectedSectionId || !selectedDate) return;

            try {
                setLoading(true);
                const res = await fetch(`http://localhost:3000/attendance/class/${selectedClassId}/section/${selectedSectionId}?date=${selectedDate}`);
                const data = await res.json();

                if (data && data.id) {
                    setExistingAttendance(data);
                    if (data.takenBy) {
                        setSelectedTeacherId(data.takenBy.id.toString());
                    }
                    // Populate records
                    const records: Record<number, { status: string, remarks: string }> = {};
                    data.studentAttendances.forEach((sa: any) => {
                        records[sa.student.id] = { status: sa.status, remarks: sa.remarks || "" };
                    });

                    // Fill in any students missing from the record
                    students.forEach(s => {
                        if (!records[s.id]) {
                            records[s.id] = { status: "PRESENT", remarks: "" };
                        }
                    });

                    setAttendanceRecords(records);
                } else {
                    setExistingAttendance(null);
                    // Default all to PRESENT
                    const records: Record<number, { status: string, remarks: string }> = {};
                    students.forEach(s => {
                        records[s.id] = { status: "PRESENT", remarks: "" };
                    });
                    setAttendanceRecords(records);
                }
            } catch (err) {
                console.error("Failed to fetch attendance records", err);
            } finally {
                setLoading(false);
            }
        };

        if (students.length > 0) {
            fetchAttendance();
        }
    }, [selectedClassId, selectedSectionId, selectedDate, students.length]);

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarksChange = (studentId: number, remarks: string) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const markAll = (status: string) => {
        const newRecords = { ...attendanceRecords };
        students.forEach(s => {
            if (newRecords[s.id]) {
                newRecords[s.id].status = status;
            } else {
                newRecords[s.id] = { status, remarks: "" };
            }
        });
        setAttendanceRecords(newRecords);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        if (!selectedTeacherId) {
            setMessage({ text: "Please select who is taking the attendance.", type: "error" });
            return;
        }

        const payload = {
            date: selectedDate,
            teacherId: parseInt(selectedTeacherId),
            classId: parseInt(selectedClassId),
            sectionId: parseInt(selectedSectionId),
            students: Object.entries(attendanceRecords).map(([studentId, data]) => ({
                studentId: parseInt(studentId),
                status: data.status,
                remarks: data.remarks
            }))
        };

        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to submit attendance");

            const savedData = await res.json();
            setExistingAttendance(savedData);
            setMessage({ text: "Attendance saved successfully!", type: "success" });

            // clear msg after 3s
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } catch (err) {
            setMessage({ text: "Failed to submit attendance. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const selectedClass = classes.find(c => c.id.toString() === selectedClassId);
    const availableSections = selectedClass?.sections || [];

    return (
        <main className="p-4 flex-1 h-full overflow-y-auto w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Attendance Dashboard</h1>

            {message.text && (
                <div className={`p-4 mb-6 text-sm rounded-lg ${message.type === 'error' ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
                <form className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Teacher</label>
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Class</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Section</label>
                        <select
                            value={selectedSectionId}
                            onChange={(e) => setSelectedSectionId(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            disabled={!selectedClassId}
                            required
                        >
                            <option value="">Select Section</option>
                            {availableSections.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {selectedClassId && selectedSectionId && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Student List ({students.length})
                            </h2>
                            {existingAttendance && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Last updated at: {new Date(existingAttendance.timestamp).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => markAll('PRESENT')}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-white text-green-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Mark All Present
                            </button>
                            <button
                                type="button"
                                onClick={() => markAll('ABSENT')}
                                className="px-4 py-2 ml-2 text-sm font-medium rounded-md bg-white text-red-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Mark All Absent
                            </button>
                        </div>
                    </div>

                    {students.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">No students enrolled in this section.</div>
                    )}

                    {students.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Roll / ID</th>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3 text-center">Status</th>
                                        <th scope="col" className="px-6 py-3">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => {
                                        const record = attendanceRecords[student.id] || { status: 'PRESENT', remarks: '' };
                                        return (
                                            <tr key={student.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    #{student.id}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {student.firstName} {student.lastName}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex rounded-md shadow-sm" role="group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                            className={`px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-s-lg focus:z-10 focus:ring-2 ${record.status === 'PRESENT' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700'
                                                                }`}
                                                        >
                                                            P
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                            className={`px-3 py-1.5 text-xs font-medium border border-gray-200 focus:z-10 focus:ring-2 ${record.status === 'ABSENT' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700'
                                                                }`}
                                                        >
                                                            A
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(student.id, 'LATE')}
                                                            className={`px-3 py-1.5 text-xs font-medium border border-gray-200 focus:z-10 focus:ring-2 ${record.status === 'LATE' ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700'
                                                                }`}
                                                        >
                                                            L
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(student.id, 'HALF_DAY')}
                                                            className={`px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-e-lg focus:z-10 focus:ring-2 ${record.status === 'HALF_DAY' ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700'
                                                                }`}
                                                        >
                                                            HD
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={record.remarks}
                                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                        placeholder="Notes (optional)"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || students.length === 0}
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2.5 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
