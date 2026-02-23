import Link from "next/link";

async function getTeachers() {
    try {
        const res = await fetch('http://localhost:3000/teachers', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch teachers');
        return res.json();
    } catch (error) {
        console.error("Error loading teachers:", error);
        return [];
    }
}

export default async function TeachersPage() {
    const teachers = await getTeachers();

    return (
        <main className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
                <Link href="/dashboard/teachers/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none">
                    Add Teacher
                </Link>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Class Teacher Of</th>
                            <th scope="col" className="px-6 py-3">Subjects</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length === 0 ? (
                            <tr className="bg-white border-b hover:bg-gray-50">
                                <td colSpan={7} className="px-6 py-4 text-center">No teachers found.</td>
                            </tr>
                        ) : (
                            teachers.map((teacher: any) => (
                                <tr key={teacher.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{teacher.id}</td>
                                    <td className="px-6 py-4">{teacher.firstName} {teacher.lastName}</td>
                                    <td className="px-6 py-4">{teacher.email}</td>
                                    <td className="px-6 py-4">
                                        {teacher.classTeacherOf && teacher.classTeacherOf.length > 0
                                            ? teacher.classTeacherOf.map((s: any) => `${s.class?.name || ''}-${s.name}`).filter(Boolean).join(', ')
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {teacher.subjectAssignments && teacher.subjectAssignments.length > 0
                                            ? teacher.subjectAssignments.map((sa: any) => `${sa.subject.name} (${sa.class.name}-${sa.section.name})`).join(', ')
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 font-semibold leading-tight ${teacher.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} rounded-full`}>
                                            {teacher.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <Link href={`/dashboard/teachers/${teacher.id}/edit`} className="font-medium text-blue-600 hover:underline">Edit</Link>
                                        <Link href={`/dashboard/teachers/${teacher.id}/history`} className="font-medium text-purple-600 hover:underline">History</Link>
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
