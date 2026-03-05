const API_URL = process.env.PUBLIC_API_URL || "http://localhost:3001";

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    quantity: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    createdAt: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    customerId: number;
    productId: number;
    quantity: number;
    totalPrice: number;
    status: "pending" | "completed" | "cancelled";
    createdAt: string;
    customer?: Customer;
    product?: Product;
}

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "API request failed");
    }

    return response.json();
}

// ===== Auth =====
export const authApi = {
    login: (data: { email: string; password: string }) =>
        apiRequest<User>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    signup: (data: { name: string; email: string; password: string }) =>
        apiRequest<User>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
};

function buildQuery(params?: Record<string, string | number | undefined>): string {
    const query = new URLSearchParams();
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
        }
    }
    return query.toString();
}

function createCrudApi<T, P extends Record<string, string | number | undefined> = Record<string, string | number | undefined>>(basePath: string) {
    return {
        getAll: (params?: P) =>
            apiRequest<PaginatedResponse<T>>(`${basePath}?${buildQuery(params)}`),
        getOne: (id: number) =>
            apiRequest<T>(`${basePath}/${id}`),
        create: (data: Partial<T>) =>
            apiRequest<T>(basePath, { method: "POST", body: JSON.stringify(data) }),
        update: (id: number, data: Partial<T>) =>
            apiRequest<T>(`${basePath}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
        delete: (id: number) =>
            apiRequest<{ message: string }>(`${basePath}/${id}`, { method: "DELETE" }),
    };
}

// ===== Products =====
export const productsApi = createCrudApi<Product, { search?: string; page?: number; limit?: number }>("/products");

// ===== Customers =====
export const customersApi = createCrudApi<Customer, { search?: string; page?: number; limit?: number }>("/customers");

// ===== Orders =====
export const ordersApi = createCrudApi<Order, { search?: string; status?: string; page?: number; limit?: number }>("/orders");

// ===== Seed =====
export const seedApi = {
    run: () => apiRequest<{ message: string; data: Record<string, number> }>("/seed"),
};
