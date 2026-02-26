export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const fetcher = async (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

    const res = await fetch(fullUrl);

    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        // Attach extra info to the error object.
        (error as any).info = await res.json().catch(() => ({}));
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
};
