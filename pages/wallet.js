import Head from 'next/head';
import { useState, useEffect } from 'react';
import { withAuth } from '../lib/auth';
import { apiGet } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';

function Wallet() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('/api/staff/wallet/')
            .then(data => setWallet(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <Head><title>My Wallet | Produit Classes</title></Head>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 0' }}>
                <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 600 }}>My Wallet</h2>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
                ) : wallet ? (
                    <>
                        {/* Header & Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' }}>
                                <strong>How this works:</strong> <span style={{ color: 'var(--accent-green)' }}>Total Earned</span> is money you've generated. 
                                <span style={{ color: 'var(--accent-red)', marginLeft: '4px' }}>Total Paid</span> is money already transferred to your bank account. 
                                The <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Balance</span> is what the academy currently owes you.
                            </p>
                            <button className="glass-btn" onClick={() => { setLoading(true); apiGet('/api/staff/wallet/').then(data => setWallet(data)).finally(() => setLoading(false)); }}
                                style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 1 0-2.6 6.4L3 16"/></svg>
                                Refresh Status
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid var(--accent-green)', padding: '20px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Earned</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>₹{wallet.total_earned}</div>
                            </div>
                            <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid var(--accent-red)', padding: '20px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Paid</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-red)' }}>₹{wallet.total_paid}</div>
                            </div>
                            <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid var(--accent-blue)', padding: '20px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Balance</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>₹{wallet.balance}</div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 className="section-heading" style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Transaction History</h3>
                            {wallet.transactions?.length > 0 ? (
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wallet.transactions.map(t => (
                                                <tr key={t.id}>
                                                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                                                            background: t.type === 'credit' ? 'rgba(51, 174, 120, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                                                            color: t.type === 'credit' ? 'var(--accent-green)' : 'var(--accent-red)',
                                                        }}>
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>₹{t.amount}</td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{t.note || t.task_title || '--'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>No transactions yet.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <h3 className="section-heading" style={{ justifyContent: 'center', margin: '0 0 8px' }}>Wallet not available</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your wallet will be created when you receive your first payment or earnings.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(Wallet, ['teacher', 'mentor']);
