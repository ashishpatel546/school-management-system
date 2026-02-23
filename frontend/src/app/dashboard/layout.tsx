"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when route changes (mobile only functionality expectation)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const getLinkClass = (path: string) => {
        const baseClass = "flex items-center p-2 rounded-lg group";
        return isActive(path)
            ? `${baseClass} bg-blue-100 text-blue-700`
            : `${baseClass} text-gray-900 hover:bg-gray-100`;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
                <div className="flex flex-wrap justify-between items-center">
                    <div className="flex justify-start items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer sm:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                            </svg>
                        </button>
                        <span className="self-center text-xl font-semibold whitespace-nowrap text-slate-900">
                            {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'EduSphere'} Dashboard
                        </span>
                    </div>
                    <div className="flex items-center lg:order-2">
                        <Link href="/" className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 mr-2 focus:outline-none">
                            Log out
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16 overflow-hidden bg-gray-50">
                {/* Mobile overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-gray-900/50 sm:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 sm:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Sidebar">
                    <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                        <ul className="space-y-2 font-medium">
                            <li>
                                <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                                    <span className="ml-3">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/students" className={getLinkClass("/dashboard/students")}>
                                    <span className="ml-3">Students</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/teachers" className={getLinkClass("/dashboard/teachers")}>
                                    <span className="ml-3">Teachers</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/subjects" className={getLinkClass("/dashboard/subjects")}>
                                    <span className="ml-3">Subjects</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/classes" className={getLinkClass("/dashboard/classes")}>
                                    <span className="ml-3">Classes</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/enrollment" className={getLinkClass("/dashboard/enrollment")}>
                                    <span className="ml-3">Enrollment</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/attendance" className={getLinkClass("/dashboard/attendance")}>
                                    <span className="ml-3">Attendance</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/fees" className={getLinkClass("/dashboard/fees")}>
                                    <span className="ml-3">Fees</span>
                                </Link>
                            </li>
                            <li className="pt-4 mt-4 space-y-2 border-t border-gray-200">
                                <Link href="/dashboard/settings" className={getLinkClass("/dashboard/settings")}>
                                    <span className="ml-3">Settings</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </aside>

                <div id="main-content" className="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64">
                    {children}
                </div>
            </div>
        </div>
    );
}
