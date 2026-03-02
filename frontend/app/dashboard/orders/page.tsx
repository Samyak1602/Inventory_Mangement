"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { ordersApi, productsApi, customersApi, type Order, type Product, type Customer } from "@/lib/api";

// ===== Types =====
interface OrderForm {
    customerId: string;
    productId: string;
    quantity: string;
    status: "pending" | "completed" | "cancelled";
}

const emptyForm: OrderForm = {
    customerId: "",
    productId: "",
    quantity: "1",
    status: "pending",
};

export default function OrdersPage() {
    // --- State ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Dropdown data
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [customersList, setCustomersList] = useState<Customer[]>([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<OrderForm>(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // Delete state
    const [showDelete, setShowDelete] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
    const [deleting, setDeleting] = useState(false);

    const LIMIT = 10;

    // --- Load Orders ---
    const loadOrders = useCallback(async (p?: number, s?: string, st?: string) => {
        setLoading(true);
        setError("");
        try {
            const res = await ordersApi.getAll({
                page: p ?? page,
                limit: LIMIT,
                search: s ?? search,
                status: (st ?? statusFilter) || undefined,
            });
            setOrders(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load orders";
            setError(msg);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    // --- Load dropdown data for Products & Customers ---
    const loadDropdownData = async () => {
        try {
            const [prods, custs] = await Promise.all([
                productsApi.getAll({ limit: 100 }).catch(() => ({ data: [] as Product[], total: 0, page: 1, limit: 100, totalPages: 0 })),
                customersApi.getAll({ limit: 100 }).catch(() => ({ data: [] as Customer[], total: 0, page: 1, limit: 100, totalPages: 0 })),
            ]);
            setProductsList(prods.data);
            setCustomersList(custs.data);
        } catch {
            // Silent fail — dropdowns will be empty
        }
    };

    useEffect(() => {
        loadOrders();
        loadDropdownData();
    }, [loadOrders]);

    // --- Search ---
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
        loadOrders(1, value, statusFilter);
    };

    // --- Status Filter ---
    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setPage(1);
        loadOrders(1, search, value);
    };

    // --- Pagination ---
    const goToPage = (p: number) => {
        setPage(p);
        loadOrders(p);
    };

    // --- Add Order ---
    const openAddModal = () => {
        setModalMode("add");
        setForm(emptyForm);
        setFormError("");
        setEditingId(null);
        setShowModal(true);
        loadDropdownData();
    };

    // --- Edit Order ---
    const openEditModal = (order: Order) => {
        setModalMode("edit");
        setForm({
            customerId: String(order.customerId),
            productId: String(order.productId),
            quantity: String(order.quantity),
            status: order.status,
        });
        setFormError("");
        setEditingId(order.id);
        setShowModal(true);
        loadDropdownData();
    };

    // --- Save Order (Add / Edit) ---
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");

        // Validation
        if (!form.customerId || !form.productId || !form.quantity) {
            setFormError("Please fill in all required fields");
            return;
        }

        const quantity = parseInt(form.quantity);
        if (isNaN(quantity) || quantity < 1) {
            setFormError("Quantity must be at least 1");
            return;
        }

        // Calculate total price
        const selectedProduct = productsList.find((p) => p.id === Number(form.productId));
        const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

        setSaving(true);
        try {
            const payload = {
                customerId: Number(form.customerId),
                productId: Number(form.productId),
                quantity,
                totalPrice,
                status: form.status,
            };

            if (modalMode === "edit" && editingId) {
                await ordersApi.update(editingId, payload);
            } else {
                await ordersApi.create(payload);
            }

            setShowModal(false);
            loadOrders();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save order";
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Order ---
    const openDeleteConfirm = (order: Order) => {
        setDeletingOrder(order);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!deletingOrder) return;
        setDeleting(true);
        try {
            await ordersApi.delete(deletingOrder.id);
            setShowDelete(false);
            setDeletingOrder(null);
            loadOrders();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to delete order";
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    // --- Update Form Field ---
    const updateField = (field: keyof OrderForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // --- Computed total price preview ---
    const previewTotal = (() => {
        const selectedProduct = productsList.find((p) => p.id === Number(form.productId));
        const qty = parseInt(form.quantity) || 0;
        return selectedProduct ? selectedProduct.price * qty : 0;
    })();

    // --- Render ---
    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Track and manage customer orders</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div className="search-input-wrap">
                        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            fontSize: 14,
                            color: "#f1f5f9",
                            background: "rgba(10,16,30,0.9)",
                            border: "1px solid rgba(148,163,184,0.1)",
                            borderRadius: 10,
                            outline: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Order
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {error}
                    <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4, display: "flex" }}>✕</button>
                </div>
            )}

            {/* Table */}
            <div className="table-card">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner" />
                    </div>
                ) : orders.length > 0 ? (
                    <>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Order Number</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => (
                                        <tr key={order.id}>
                                            <td style={{ color: "#64748b" }}>{(page - 1) * LIMIT + idx + 1}</td>
                                            <td><span className="sku-text">{order.orderNumber}</span></td>
                                            <td style={{ fontWeight: 500, color: "#e2e8f0" }}>
                                                {order.customer?.name || `Customer #${order.customerId}`}
                                            </td>
                                            <td style={{ color: "#94a3b8" }}>
                                                {order.product?.name || `Product #${order.productId}`}
                                            </td>
                                            <td style={{ color: "#e2e8f0", fontWeight: 600 }}>{order.quantity}</td>
                                            <td className="price-text">₹{order.totalPrice?.toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ color: "#64748b", fontSize: 13 }}>
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="action-btn edit" onClick={() => openEditModal(order)} title="Edit">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => openDeleteConfirm(order)} title="Delete">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            <line x1="10" y1="11" x2="10" y2="17" />
                                                            <line x1="14" y1="11" x2="14" y2="17" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <span className="pagination-info">
                                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} orders
                            </span>
                            <div className="pagination-buttons">
                                <button className="page-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                                    ← Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .map((p, idx, arr) => (
                                        <span key={p} style={{ display: "flex", gap: 6 }}>
                                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                <span style={{ color: "#64748b", padding: "6px 4px", fontSize: 13 }}>...</span>
                                            )}
                                            <button
                                                className={`page-btn ${p === page ? "active" : ""}`}
                                                onClick={() => goToPage(p)}
                                            >
                                                {p}
                                            </button>
                                        </span>
                                    ))}
                                <button className="page-btn" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                                    Next →
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>
                        <p className="empty-title">No orders found</p>
                        <p className="empty-text">
                            {search || statusFilter ? "Try different filters" : "Create your first order to get started"}
                        </p>
                        {!search && !statusFilter && (
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAddModal}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                New Order
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ===== Add/Edit Modal ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {modalMode === "edit" ? "Edit Order" : "Create New Order"}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                {formError && (
                                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13 }}>
                                        {formError}
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label">Customer *</label>
                                    <select
                                        className="input-field"
                                        value={form.customerId}
                                        onChange={(e) => updateField("customerId", e.target.value)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <option value="">Select a customer</option>
                                        {customersList.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.email})
                                            </option>
                                        ))}
                                    </select>
                                    {customersList.length === 0 && (
                                        <span style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>
                                            No customers found. Add customers first.
                                        </span>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Product *</label>
                                    <select
                                        className="input-field"
                                        value={form.productId}
                                        onChange={(e) => updateField("productId", e.target.value)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <option value="">Select a product</option>
                                        {productsList.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} — ₹{p.price.toLocaleString()} (Stock: {p.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    {productsList.length === 0 && (
                                        <span style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>
                                            No products found. Add products first.
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className="input-group">
                                        <label className="input-label">Quantity *</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="1"
                                            min="1"
                                            value={form.quantity}
                                            onChange={(e) => updateField("quantity", e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Status</label>
                                        <select
                                            className="input-field"
                                            value={form.status}
                                            onChange={(e) => updateField("status", e.target.value)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Total Price Preview */}
                                {previewTotal > 0 && (
                                    <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Estimated Total</span>
                                        <span style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>₹{previewTotal.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                                    {saving ? (
                                        <><span className="spinner" /> Saving...</>
                                    ) : modalMode === "edit" ? (
                                        "Update Order"
                                    ) : (
                                        "Create Order"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirmation Modal ===== */}
            {showDelete && deletingOrder && (
                <div className="modal-overlay" onClick={() => setShowDelete(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Order</h2>
                            <button className="modal-close" onClick={() => setShowDelete(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="confirm-message">
                                Are you sure you want to delete order <span className="confirm-item-name">&quot;{deletingOrder.orderNumber}&quot;</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowDelete(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                                {deleting ? (
                                    <><span className="spinner" /> Deleting...</>
                                ) : (
                                    "Delete Order"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
