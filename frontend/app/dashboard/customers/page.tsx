"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { customersApi, type Customer } from "@/lib/api";

interface CustomerForm {
    name: string;
    email: string;
    phone: string;
    city: string;
}

const emptyForm: CustomerForm = {
    name: "",
    email: "",
    phone: "",
    city: "",
};

export default function CustomerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<CustomerForm>(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // Delete state
    const [showDelete, setShowDelete] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [deleting, setDeleting] = useState(false);

    const LIMIT = 10;

    // --- Load Customers ---
    const loadCustomers = useCallback(async (p?: number, s?: string) => {
        setLoading(true);
        setError("");
        try {
            const res = await customersApi.getAll({
                page: p ?? page,
                limit: LIMIT,
                search: s ?? search,
            });
            setCustomers(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load customers";
            setError(msg);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // --- Search ---
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
        loadCustomers(1, value);
    };

    // --- Pagination ---
    const goToPage = (p: number) => {
        setPage(p);
        loadCustomers(p, search);
    };

    // --- Add Customer ---
    const openAddModal = () => {
        setModalMode("add");
        setForm(emptyForm);
        setFormError("");
        setEditingId(null);
        setShowModal(true);
    };

    // --- Edit Customer ---
    const openEditModal = (customer: Customer) => {
        setModalMode("edit");
        setForm({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            city: customer.city || "",
        });
        setFormError("");
        setEditingId(customer.id);
        setShowModal(true);
    };

    // --- Save Customer (Add / Edit) ---
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");

        // Validation
        if (!form.name || !form.email || !form.phone) {
            setFormError("Please fill in all required fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setFormError("Please enter a valid email address");
            return;
        }

        // Phone validation — digits only, 10 digits
        const phoneDigits = form.phone.replace(/\D/g, "");
        if (phoneDigits.length < 10) {
            setFormError("Phone number must be at least 10 digits");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                city: form.city || undefined,
            };

            if (modalMode === "edit" && editingId) {
                await customersApi.update(editingId, payload);
            } else {
                await customersApi.create(payload);
            }

            setShowModal(false);
            loadCustomers();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save customer";
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Customer ---
    const openDeleteConfirm = (customer: Customer) => {
        setDeletingCustomer(customer);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!deletingCustomer) return;
        setDeleting(true);
        try {
            await customersApi.delete(deletingCustomer.id);
            setShowDelete(false);
            setDeletingCustomer(null);
            loadCustomers();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to delete customer";
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    // --- Update Form Field ---
    const updateField = (field: keyof CustomerForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // --- Render ---
    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">Manage your customer database</p>
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
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Customer
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
                ) : customers.length > 0 ? (
                    <>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>City</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer, idx) => (
                                        <tr key={customer.id}>
                                            <td style={{ color: "#64748b" }}>{(page - 1) * LIMIT + idx + 1}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #06b6d4)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{customer.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: "#94a3b8" }}>{customer.email}</td>
                                            <td style={{ color: "#94a3b8" }}>{customer.phone}</td>
                                            <td>
                                                {customer.city ? (
                                                    <span className="category-badge">{customer.city}</span>
                                                ) : (
                                                    <span style={{ color: "#475569", fontSize: 13 }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ color: "#64748b", fontSize: 13 }}>
                                                {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="action-btn edit" onClick={() => openEditModal(customer)} title="Edit">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => openDeleteConfirm(customer)} title="Delete">
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
                                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} customers
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
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <p className="empty-title">No customers found</p>
                        <p className="empty-text">
                            {search ? "Try a different search term" : "Add your first customer to get started"}
                        </p>
                        {!search && (
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAddModal}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Customer
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
                                {modalMode === "edit" ? "Edit Customer" : "Add New Customer"}
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
                                    <label className="input-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Rahul Sharma"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Email Address *</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        placeholder="e.g. rahul@example.com"
                                        value={form.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className="input-group">
                                        <label className="input-label">Phone *</label>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            placeholder="e.g. 9876543210"
                                            value={form.phone}
                                            onChange={(e) => updateField("phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">City</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. Mumbai"
                                            value={form.city}
                                            onChange={(e) => updateField("city", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                                    {saving ? (
                                        <><span className="spinner" /> Saving...</>
                                    ) : modalMode === "edit" ? (
                                        "Update Customer"
                                    ) : (
                                        "Add Customer"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirmation Modal ===== */}
            {showDelete && deletingCustomer && (
                <div className="modal-overlay" onClick={() => setShowDelete(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Customer</h2>
                            <button className="modal-close" onClick={() => setShowDelete(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="confirm-message">
                                Are you sure you want to delete <span className="confirm-item-name">&quot;{deletingCustomer.name}&quot;</span>?
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
                                    "Delete Customer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}