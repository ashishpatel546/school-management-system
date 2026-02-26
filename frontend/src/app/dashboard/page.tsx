import Link from "next/link";

async function getStats() {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${url}/dashboard/stats`, { cache: 'no-store' });
        if (!res.ok) return { students: 0, teachers: 0, classes: 0 };
        return res.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { students: 0, teachers: 0, classes: 0 };
    }
}

export default async function Dashboard() {
    const stats = await getStats();

    return (
        <main>
            <div className="px-4 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 md:h-64 p-4 flex flex-col justify-center items-center">
                        <h3 className="text-lg font-bold text-slate-700">Total Students</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.students}</p>
                        <p className="text-sm text-green-600 mt-2">● Live Data</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 md:h-64 p-4 flex flex-col justify-center items-center">
                        <h3 className="text-lg font-bold text-slate-700">Teachers</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.teachers}</p>
                        <p className="text-sm text-green-600 mt-2">● Live Data</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 md:h-64 p-4 flex flex-col justify-center items-center">
                        <h3 className="text-lg font-bold text-slate-700">Classes</h3>
                        <p className="text-3xl font-bold text-teal-600">{stats.classes}</p>
                        <p className="text-sm text-green-600 mt-2">● Live Data</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
