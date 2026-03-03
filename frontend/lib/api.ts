const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

// ===== Products =====
export const productsApi = {
    getAll: (params?: { search?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        return apiRequest<PaginatedResponse<Product>>(`/products?${query.toString()}`);
    },
    getOne: (id: number) => apiRequest<Product>(`/products/${id}`),
    create: (data: Partial<Product>) =>
        apiRequest<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Product>) =>
        apiRequest<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
        apiRequest<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
};

// ===== Customers =====
export const customersApi = {
    getAll: (params?: { search?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        return apiRequest<PaginatedResponse<Customer>>(`/customers?${query.toString()}`);
    },
    getOne: (id: number) => apiRequest<Customer>(`/customers/${id}`),
    create: (data: Partial<Customer>) =>
        apiRequest<Customer>("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Customer>) =>
        apiRequest<Customer>(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
        apiRequest<{ message: string }>(`/customers/${id}`, { method: "DELETE" }),
};

// ===== Orders =====
export const ordersApi = {
    getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.status) query.set("status", params.status);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        return apiRequest<PaginatedResponse<Order>>(`/orders?${query.toString()}`);
    },
    getOne: (id: number) => apiRequest<Order>(`/orders/${id}`),
    create: (data: Partial<Order>) =>
        apiRequest<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Order>) =>
        apiRequest<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
        apiRequest<{ message: string }>(`/orders/${id}`, { method: "DELETE" }),
};

// ===== Seed =====
export const seedApi = {
    run: () => apiRequest<{ message: string; data: Record<string, number> }>("/seed"),
};
