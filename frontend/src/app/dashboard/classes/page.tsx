import Link from "next/link";

async function getClasses() {
    try {
        const res = await fetch('http://localhost:3000/classes', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch classes');
        return res.json();
    } catch (error) {
        console.error("Error loading classes:", error);
        return [];
    }
}

export default async function ClassesPage() {
    const classes = await getClasses();

    return (
        <main className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
                <div>
                    <Link href="/dashboard/classes/new" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none">
                        Add Class
                    </Link>
                    <Link href="/dashboard/classes/sections/new" className="text-blue-700 bg-white border border-blue-700 hover:bg-blue-50 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none">
                        Add Section
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.length === 0 ? (
                    <div className="col-span-full text-center p-4 bg-white rounded-lg shadow">No classes found.</div>
                ) : (
                    classes.map((cls: any) => (
                        <div key={cls.id} className="p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="text-2xl font-bold tracking-tight text-gray-900">{cls.name}</h5>
                                <Link href={`/dashboard/classes/${cls.id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Edit
                                </Link>
                            </div>
                            <p className="font-normal text-gray-700 mb-1">
                                <strong>Class Teacher:</strong> {cls.classTeacher ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : 'Not Assigned'}
                            </p>
                            <p className="font-normal text-gray-700 mb-3">
                                <strong>Sections:</strong> {cls.sections && cls.sections.length > 0 ? cls.sections.map((s: any) => s.name).join(', ') : 'None'}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
