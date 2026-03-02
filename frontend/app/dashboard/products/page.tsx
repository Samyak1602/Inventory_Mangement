"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { productsApi, type Product } from "@/lib/api";

// ===== Types =====
interface ProductForm {
    name: string;
    sku: string;
    category: string;
    price: string;
    quantity: string;
    description: string;
}

const emptyForm: ProductForm = {
    name: "",
    sku: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
};

export default function ProductsPage() {
    // --- State ---
    const [products, setProducts] = useState<Product[]>([]);
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
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // Delete state
    const [showDelete, setShowDelete] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const LIMIT = 10;

    // --- Load Products ---
    const loadProducts = useCallback(async (p?: number, s?: string) => {
        setLoading(true);
        setError("");
        try {
            const res = await productsApi.getAll({
                page: p ?? page,
                limit: LIMIT,
                search: s ?? search,
            });
            setProducts(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load products";
            setError(msg);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // --- Search ---
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
        loadProducts(1, value);
    };

    // --- Pagination ---
    const goToPage = (p: number) => {
        setPage(p);
        loadProducts(p);
    };

    // --- Add Product ---
    const openAddModal = () => {
        setModalMode("add");
        setForm(emptyForm);
        setFormError("");
        setEditingId(null);
        setShowModal(true);
    };

    // --- Edit Product ---
    const openEditModal = (product: Product) => {
        setModalMode("edit");
        setForm({
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: String(product.price),
            quantity: String(product.quantity),
            description: product.description || "",
        });
        setFormError("");
        setEditingId(product.id);
        setShowModal(true);
    };

    // --- Save Product (Add / Edit) ---
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");

        // Validation
        if (!form.name || !form.sku || !form.category || !form.price || !form.quantity) {
            setFormError("Please fill in all required fields");
            return;
        }

        const price = parseFloat(form.price);
        const quantity = parseInt(form.quantity);
        if (isNaN(price) || price < 0) {
            setFormError("Price must be a valid positive number");
            return;
        }
        if (isNaN(quantity) || quantity < 0) {
            setFormError("Quantity must be a valid positive number");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                sku: form.sku,
                category: form.category,
                price,
                quantity,
                description: form.description || undefined,
            };

            if (modalMode === "edit" && editingId) {
                await productsApi.update(editingId, payload);
            } else {
                await productsApi.create(payload);
            }

            setShowModal(false);
            loadProducts();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save product";
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Product ---
    const openDeleteConfirm = (product: Product) => {
        setDeletingProduct(product);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!deletingProduct) return;
        setDeleting(true);
        try {
            await productsApi.delete(deletingProduct.id);
            setShowDelete(false);
            setDeletingProduct(null);
            loadProducts();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to delete product";
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    // --- Update Form Field ---
    const updateField = (field: keyof ProductForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // --- Render ---
    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">Manage your inventory products</p>
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
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Product
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
                ) : products.length > 0 ? (
                    <>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product Name</th>
                                        <th>SKU</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, idx) => (
                                        <tr key={product.id}>
                                            <td style={{ color: "#64748b" }}>{(page - 1) * LIMIT + idx + 1}</td>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{product.name}</div>
                                                    {product.description && (
                                                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td><span className="sku-text">{product.sku}</span></td>
                                            <td><span className="category-badge">{product.category}</span></td>
                                            <td className="price-text">₹{product.price.toLocaleString()}</td>
                                            <td>
                                                <span className={product.quantity < 10 ? "stock-low" : "stock-ok"}>
                                                    {product.quantity}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="action-btn edit" onClick={() => openEditModal(product)} title="Edit">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => openDeleteConfirm(product)} title="Delete">
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
                                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} products
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
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                        </div>
                        <p className="empty-title">No products found</p>
                        <p className="empty-text">
                            {search ? "Try a different search term" : "Add your first product to get started"}
                        </p>
                        {!search && (
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAddModal}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Product
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
                                {modalMode === "edit" ? "Edit Product" : "Add New Product"}
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
                                    <label className="input-label">Product Name *</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. iPhone 15 Pro"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className="input-group">
                                        <label className="input-label">SKU *</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. ELEC-001"
                                            value={form.sku}
                                            onChange={(e) => updateField("sku", e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Category *</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. Electronics"
                                            value={form.category}
                                            onChange={(e) => updateField("category", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className="input-group">
                                        <label className="input-label">Price (₹) *</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(e) => updateField("price", e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Quantity *</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="0"
                                            min="0"
                                            value={form.quantity}
                                            onChange={(e) => updateField("quantity", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Description</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="Optional product description..."
                                        rows={3}
                                        style={{ resize: "vertical" }}
                                        value={form.description}
                                        onChange={(e) => updateField("description", e.target.value)}
                                    />
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
                                        "Update Product"
                                    ) : (
                                        "Add Product"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirmation Modal ===== */}
            {showDelete && deletingProduct && (
                <div className="modal-overlay" onClick={() => setShowDelete(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Product</h2>
                            <button className="modal-close" onClick={() => setShowDelete(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="confirm-message">
                                Are you sure you want to delete <span className="confirm-item-name">&quot;{deletingProduct.name}&quot;</span>?
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
                                    "Delete Product"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
