import Link from "next/link";

async function getSubjects() {
    try {
        const res = await fetch('http://localhost:3000/extra-subjects', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch subjects');
        return res.json();
    } catch (error) {
        console.error("Error loading subjects:", error);
        return [];
    }
}

export default async function SubjectsPage() {
    const subjects = await getSubjects();

    return (
        <main className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
                <Link href="/dashboard/subjects/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none">
                    Add Subject
                </Link>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Subject Name</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 ? (
                            <tr className="bg-white border-b hover:bg-gray-50">
                                <td colSpan={3} className="px-6 py-4 text-center">No subjects found.</td>
                            </tr>
                        ) : (
                            subjects.map((subject: any) => (
                                <tr key={subject.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{subject.id}</td>
                                    <td className="px-6 py-4">{subject.name}</td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/subjects/${subject.id}/edit`} className="font-medium text-blue-600 hover:underline">Edit</Link>
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
