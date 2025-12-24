"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

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
                <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0" aria-label="Sidebar">
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
