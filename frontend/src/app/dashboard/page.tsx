import type { Metadata } from "next";
import Link from "next/link";
import { Users, GraduationCap, Presentation, IndianRupee, UserCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Dashboard",
};

async function getStats() {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${url}/dashboard/stats`, { cache: 'no-store' });
        if (!res.ok) return { students: 0, teachers: 0, classes: 0, feesCollected: 0, attendanceToday: 0 };
        return res.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { students: 0, teachers: 0, classes: 0, feesCollected: 0, attendanceToday: 0 };
    }
}

export default async function Dashboard() {
    const stats = await getStats();

    const statCards = [
        {
            title: "Total Students",
            value: stats.students,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            borderColor: "border-blue-200"
        },
        {
            title: "Present Today",
            value: stats.attendanceToday || 0,
            icon: UserCheck,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            borderColor: "border-emerald-200"
        },
        {
            title: "Teachers",
            value: stats.teachers,
            icon: GraduationCap,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            borderColor: "border-purple-200"
        },
        {
            title: "Total Classes",
            value: stats.classes,
            icon: Presentation,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            borderColor: "border-orange-200"
        },
        {
            title: "Fees Collected (M)",
            value: `₹${stats.feesCollected?.toLocaleString('en-IN') || 0}`,
            icon: IndianRupee,
            color: "text-rose-600",
            bgColor: "bg-rose-100",
            borderColor: "border-rose-200"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                        <p className="mt-1 text-slate-500 text-sm">Welcome back! Here's what's happening today.</p>
                    </div>
                    <div className="self-start sm:self-auto flex items-center space-x-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span>Live Data System Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border ${stat.borderColor} hover:shadow-md transition-shadow relative overflow-hidden group`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bgColor} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
                                <div className="relative flex flex-col h-full justify-between">
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} shadow-inner`}>
                                            <Icon className="w-6 h-6" strokeWidth={2} />
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
                        <div className="flex items-center justify-center h-48 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-sm">No recent activity to display</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/students/new" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100 group">
                                <Users className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-3" />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700">Add Student</span>
                            </Link>
                            <Link href="/dashboard/fees" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors border border-slate-100 group">
                                <IndianRupee className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-3" />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700">Collect Fee</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
