"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EnrollmentPage() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [studentData, setStudentData] = useState<any>(null); // Full student object
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, subjectsRes, classesRes] = await Promise.all([
                    fetch("http://127.0.0.1:3000/students"),
                    fetch("http://127.0.0.1:3000/extra-subjects"),
                    fetch("http://127.0.0.1:3000/classes")
                ]);

                if (studentsRes.ok) {
                    const data = await studentsRes.json();
                    setStudents(data);
                    setFilteredStudents(data);
                }
                if (subjectsRes.ok) setSubjects(await subjectsRes.json());
                if (classesRes.ok) setClasses(await classesRes.json());
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    // Filter students based on search
    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents(students);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = students.filter((s: any) =>
            s.firstName.toLowerCase().includes(lower) ||
            s.lastName.toLowerCase().includes(lower) ||
            s.email.toLowerCase().includes(lower)
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    // Fetch full student details when selected
    useEffect(() => {
        if (!selectedStudent) {
            setStudentData(null);
            setSelectedClass("");
            setSelectedSection("");
            setSelectedSubjects([]); // Reset subjects
            return;
        }

        const fetchStudentDetails = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:3000/students/${selectedStudent}`);
                if (res.ok) {
                    const data = await res.json();
                    setStudentData(data);
                    // Pre-fill Class/Section if they have one
                    if (data.class) setSelectedClass(data.class.id.toString());
                    if (data.section) setSelectedSection(data.section.id.toString());

                    // Pre-fill subjects (map to string IDs)
                    if (data.studentSubjects) {
                        setSelectedSubjects(data.studentSubjects.map((ss: any) => ss.extraSubject.id.toString()));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch student details", err);
            }
        };
        fetchStudentDetails();
    }, [selectedStudent]);

    // Filter sections when class changes
    useEffect(() => {
        if (selectedClass) {
            const cls = classes.find((c: any) => c.id === parseInt(selectedClass));
            if (cls) {
                setSections(cls.sections || []);
            } else {
                setSections([]);
            }
        } else {
            setSections([]);
        }
    }, [selectedClass, classes]);

    const handleSubjectToggle = (subjectId: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!selectedStudent || !selectedClass || !selectedSection) {
            setError("Please select student, class, and section.");
            setLoading(false);
            return;
        }

        if (selectedSubjects.length === 0) {
            setError("Please select at least one subject.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:3000/students/${selectedStudent}/enroll`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    classId: parseInt(selectedClass),
                    sectionId: parseInt(selectedSection),
                    subjectIds: selectedSubjects.map(id => parseInt(id))
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to enroll student");
            }

            setSuccess("Student enrollment updated successfully!");
            // Refresh student data
            const updatedRes = await fetch(`http://127.0.0.1:3000/students/${selectedStudent}`);
            if (updatedRes.ok) setStudentData(await updatedRes.json());

        } catch (err) {
            setError("Failed to enroll student. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4 bg-slate-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Enrollment Management</h2>

                    {error && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">{error}</div>}
                    {success && <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">{success}</div>}

                    {/* Search / Select Student */}
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900">Search Student</label>
                        <input
                            type="text"
                            placeholder="Type name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsSearching(true);
                                setSelectedStudent("");
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2"
                        />
                        {isSearching && searchTerm && (
                            <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto mb-2">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedStudent(s.id.toString());
                                                setSearchTerm(`${s.firstName} ${s.lastName}`);
                                                setIsSearching(false);
                                            }}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            {s.firstName} {s.lastName} ({s.email})
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500 text-sm">No students found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedStudent && studentData && (
                        <div className="mb-8 border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-800">
                                Enroll: {studentData.firstName} {studentData.lastName}
                            </h3>

                            {/* Existing Enrollments Info */}
                            <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Current Enrollments</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Class:</strong> {studentData.class?.name || 'None'} - {studentData.section?.name || 'None'}
                                </p>
                                <div className="space-y-1">
                                    <strong>Subjects:</strong>
                                    {studentData.studentSubjects?.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                            {studentData.studentSubjects.map((ss: any) => (
                                                <li key={ss.id}>
                                                    {ss.extraSubject?.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-sm text-gray-500 italic ml-2">No subjects assigned</span>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-6 mb-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="class" className="block mb-2 text-sm font-medium text-gray-900">Class</label>
                                        <select
                                            id="class"
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            required
                                        >
                                            <option value="">Choose a class</option>
                                            {classes.map((cls: any) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="section" className="block mb-2 text-sm font-medium text-gray-900">Section</label>
                                        <select
                                            id="section"
                                            value={selectedSection}
                                            onChange={(e) => setSelectedSection(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            required
                                            disabled={!selectedClass}
                                        >
                                            <option value="">Choose a section</option>
                                            {sections.map((section: any) => (
                                                <option key={section.id} value={section.id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Subjects</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {subjects.map((subject: any) => (
                                            <div key={subject.id} className="flex items-center">
                                                <input
                                                    id={`subject-${subject.id}`}
                                                    type="checkbox"
                                                    value={subject.id}
                                                    checked={selectedSubjects.includes(subject.id.toString())}
                                                    onChange={() => handleSubjectToggle(subject.id.toString())}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                                <label htmlFor={`subject-${subject.id}`} className="ml-2 text-sm font-medium text-gray-900">
                                                    {subject.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">Select all subjects that apply.</p>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Update Enrollment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
