import Link from "next/link";

async function getStudents() {
    try {
        const res = await fetch('http://localhost:3000/students', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
    } catch (error) {
        console.error("Error loading students:", error);
        return [];
    }
}

export default async function StudentsPage() {
    const students = await getStudents();

    return (
        <main className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Students</h1>
                <div className="space-x-2">
                    <Link href="/dashboard/students/promotions" className="text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">
                        Bulk Promotions
                    </Link>
                    <Link href="/dashboard/students/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none">
                        Add Student
                    </Link>
                </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">First Name</th>
                            <th scope="col" className="px-6 py-3">Last Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Class / Section</th>
                            <th scope="col" className="px-6 py-3">Subjects</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr className="bg-white border-b hover:bg-gray-50">
                                <td colSpan={8} className="px-6 py-4 text-center">No students found.</td>
                            </tr>
                        ) : (
                            students.map((student: any) => (
                                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{student.id}</td>
                                    <td className="px-6 py-4">{student.firstName}</td>
                                    <td className="px-6 py-4">{student.lastName}</td>
                                    <td className="px-6 py-4">{student.email}</td>
                                    <td className="px-6 py-4">
                                        {student.class ? `${student.class.name} ${student.section ? '- ' + student.section.name : ''}` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {student.studentSubjects && student.studentSubjects.length > 0
                                            ? student.studentSubjects.map((ss: any) => ss.extraSubject?.name).join(', ')
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 font-semibold leading-tight ${student.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} rounded-full`}>
                                            {student.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <Link href={`/dashboard/students/${student.id}/edit`} className="font-medium text-blue-600 hover:underline">Edit</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
