const BASE_URL = (import.meta.env.VITE_MMAUTO_URL ?? '').trim().replace(/\/+$/, '');

export const ENDPOINTS = {
    reset: '/reset',
    updateEmployee: '/update/employee/contact',
} as const;

const TIMEOUT_MS = 20_000;

export type ApiResponse = { ok: boolean; success: boolean; status: number; message: string };

export type EmployeeContact = { name: string; email: string };

async function request(method: 'POST' | 'PATCH', path: string, body: unknown = {}): Promise<ApiResponse> {
    if (!BASE_URL) {
        return { ok: false, success: false, status: 0, message: 'No server address is set. Add VITE_MMAUTO_URL to your .env file.' };
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        const message = typeof data?.message === 'string' ? data.message : '';

        if (response.ok) {
            return { ok: true, success: true, status: response.status, message };
        }
        return {
            ok: false,
            success: false,
            status: response.status,
            message: message || `The server answered with status ${response.status}.`,
        };
    } catch {
        if (controller.signal.aborted) {
            return { ok: false, success: false, status: 0, message: `The server didn't answer within ${TIMEOUT_MS / 1000} seconds.` };
        }
        return {
            ok: false,
            success: false,
            status: 0,
            message: "Couldn't reach the server. Check that it's running and allows requests from this site (CORS).",
        };
    } finally {
        window.clearTimeout(timer);
    }
}

export const resetDemo = () => request('POST', ENDPOINTS.reset);

export const updateEmployeeContact = async ({ name, email }: EmployeeContact): Promise<ApiResponse> => {
    return request('PATCH', ENDPOINTS.updateEmployee, { name, email });
};