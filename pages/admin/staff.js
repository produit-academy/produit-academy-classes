import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../lib/auth';
import { apiGet } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function AdminStaff() {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/classes/admin/staff/')
      .then(setStaffList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const teachers = staffList.filter(s => s.role === 'teacher');
  const mentors = staffList.filter(s => s.role === 'mentor');

  return (
    <DashboardLayout title="Staff Directory">
      <Head>
        <title>Staff Directory | Produit Classes Admin</title>
      </Head>

      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(51,174,120,0.04)', borderLeft: '3px solid var(--accent-green)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Staff accounts are managed by HR via the <strong>Staff Portal</strong>. This is a read-only directory.
        </span>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{teachers.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Teachers</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8e44ad' }}>{mentors.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mentors</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : staffList.length > 0 ? (
        <div className="glass-card data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: staff.role === 'teacher' ? 'rgba(52,152,219,0.1)' : 'rgba(155,89,182,0.1)',
                        color: staff.role === 'teacher' ? '#2980b9' : '#8e44ad',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                      }}>
                        {(staff.first_name?.[0] || staff.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <strong>{staff.first_name} {staff.last_name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: staff.role === 'teacher' ? 'rgba(52,152,219,0.1)' : 'rgba(155,89,182,0.1)',
                      color: staff.role === 'teacher' ? '#2980b9' : '#8e44ad',
                      border: 'none', textTransform: 'capitalize'
                    }}>
                      {staff.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{staff.email}</td>
                  <td>
                    <button className="glass-btn" onClick={() => router.push(`/admin/staff/${staff.id}`)} style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card empty-state">
          <h3>No staff accounts yet</h3>
          <p>HR will onboard teachers and mentors through the Staff Portal.</p>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(AdminStaff, ['admin']);
