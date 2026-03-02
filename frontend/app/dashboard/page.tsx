"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi, customersApi, ordersApi, type Product, type Customer, type Order } from "@/lib/api";

interface DashboardStats {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
    lowStockProducts: Product[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        lowStockProducts: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [products, customers, orders] = await Promise.all([
                productsApi.getAll({ limit: 100 }).catch(() => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
                customersApi.getAll({ limit: 100 }).catch(() => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
                ordersApi.getAll({ limit: 100 }).catch(() => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
            ]);

            const revenue = orders.data.reduce((sum: number, o: Order) => sum + (o.totalPrice || 0), 0);
            const lowStock = products.data.filter((p: Product) => p.quantity < 10);

            setStats({
                totalProducts: products.total,
                totalCustomers: customers.total,
                totalOrders: orders.total,
                totalRevenue: revenue,
                recentOrders: orders.data.slice(0, 5),
                lowStockProducts: lowStock.slice(0, 5),
            });
        } catch {
            // Backend not running yet - show zeros
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Overview of your inventory</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                        </div>
                    </div>
                    <div className="stat-value">{stats.totalProducts}</div>
                    <div className="stat-label">Total Products</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        </div>
                    </div>
                    <div className="stat-value">{stats.totalCustomers}</div>
                    <div className="stat-label">Total Customers</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                    </div>
                    <div className="stat-value">{stats.totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                    </div>
                    <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <Link href="/dashboard/products" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Manage Products
                </Link>
                <Link href="/dashboard/customers" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
                    Manage Customers
                </Link>
                <Link href="/dashboard/orders" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
                    Manage Orders
                </Link>
            </div>

            {/* Recent Orders */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>Recent Orders</h2>
                <div className="table-card">
                    {stats.recentOrders.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td><span className="sku-text">{order.orderNumber}</span></td>
                                            <td>{order.customer?.name || `Customer #${order.customerId}`}</td>
                                            <td>{order.product?.name || `Product #${order.productId}`}</td>
                                            <td className="price-text">₹{order.totalPrice?.toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <p className="empty-title">No orders yet</p>
                            <p className="empty-text">Orders will appear here once the backend is running and seeded.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>⚠️ Low Stock Alert</h2>
                    <div className="table-card">
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Stock</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.lowStockProducts.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td><span className="sku-text">{p.sku}</span></td>
                                            <td><span className="stock-low">{p.quantity} left</span></td>
                                            <td>
                                                <Link href="/dashboard/products" style={{ color: "#818cf8", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                                                    Update →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
