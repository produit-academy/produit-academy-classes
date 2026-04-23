import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../lib/auth';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';

function AdminStaff() {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit state
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'teacher',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await apiGet('/api/classes/admin/staff/');
      setStaffList(data);
    } catch (err) {
      setError('Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (staff) => {
    setEditId(staff.id);
    setFormData({
      first_name: staff.first_name || '',
      last_name: staff.last_name || '',
      email: staff.email || '',
      password: '', // Password left blank for update
      role: staff.role || 'teacher',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to completely delete the account for ${name}? This cannot be undone.`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await apiDelete(`/api/classes/admin/staff/${id}/`);
      if (res.ok) {
        setSuccess('Staff member deleted successfully.');
        loadStaff();
        if (editId === id) resetForm();
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to delete staff member.');
      }
    } catch {
      setError('A network error occurred.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'teacher' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let res;
      if (editId) {
        // Exclude password if it's blank during edit
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        res = await apiPut(`/api/classes/admin/staff/${editId}/`, updateData);
      } else {
        res = await apiPost('/api/classes/admin/staff/', formData);
      }

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(editId ? 'Staff account updated!' : `Successfully created ${formData.role} account!`);
        resetForm();
        loadStaff();
      } else {
        const msg = data.email ? data.email[0] : (data.detail || JSON.stringify(data));
        setError(msg);
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Staff Management">
      <Head>
        <title>Staff Management | Produit Classes Admin</title>
      </Head>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Form Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
            {editId ? (
                <>Edit Staff Account</>
            ) : (
                <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="11" cy="7" r="4" /><line x1="21" y1="10" x2="21" y2="16" /><line x1="18" y1="13" x2="24" y2="13" />
                </svg>
                Add New Staff Account
                </>
            )}
            </h3>
            {editId && (
                <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                    Cancel Edit
                </button>
            )}
        </div>
        
        {!editId && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Create a teacher or mentor account. They will log in with the email and password you set.
            </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="responsive-grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                className="input-field"
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                className="input-field"
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="input-field"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="staff@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password {editId && <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>(Leave blank to keep unchanged)</span>}</label>
            <input
              className="input-field"
              type="text"
              name="password"
              required={!editId}
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="input-field"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="teacher">Teacher</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <button
            type="submit"
            className="glass-btn primary"
            disabled={submitting}
            style={{ padding: '12px 24px', marginTop: '4px' }}
          >
            {submitting ? 'Saving...' : editId ? 'Update Account' : 'Create Account'}
          </button>
        </form>
      </div>

      <h3 className="section-heading">
        Staff Directory ({staffList.length})
      </h3>

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
                <tr key={staff.id} style={{ background: editId === staff.id ? 'var(--highlight-bg)' : 'transparent' }}>
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
                      <div>
                        <strong>{staff.first_name} {staff.last_name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: staff.role === 'teacher' ? 'rgba(52,152,219,0.1)' : 'rgba(155,89,182,0.1)',
                      color: staff.role === 'teacher' ? '#2980b9' : '#8e44ad',
                      border: 'none',
                      textTransform: 'capitalize'
                    }}>
                      {staff.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{staff.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="glass-btn" onClick={() => handleEdit(staff)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                            Edit
                        </button>
                        <button className="glass-btn" onClick={() => router.push(`/admin/staff/${staff.id}`)} style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            View Analytics
                        </button>
                        <button className="glass-btn danger" onClick={() => handleDelete(staff.id, staff.first_name)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                            Delete
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card empty-state">
          <h3>No staff accounts yet</h3>
          <p>Create a teacher or mentor account above.</p>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(AdminStaff, ['admin']);
