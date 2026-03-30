import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { API_URL } from '../config';

export default function Dashboard() {
  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', uom: '', normal_range: '', amount: '' });

  // Fetch tests from API
  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setTests(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleEdit = (test) => {
    setFormData(test);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this test?')) {
      await fetch(`${API_URL}/tests/${id}`, { method: 'DELETE' });
      setTests(tests.filter(t => t.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      const res = await fetch(`${API_URL}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      const savedTest = data[0]; // Supabase returns array
      
      if (formData.id) {
        setTests(tests.map(t => t.id === formData.id ? savedTest : t));
      } else {
        setTests([...tests, savedTest]);
      }
      
      setShowModal(false);
      setFormData({ id: null, name: '', uom: '', normal_range: '', amount: '' });
    } catch (err) {
      alert('Error saving test: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Laboratory Tests</h2>
        <button className="btn btn-primary" onClick={() => { setFormData({ id: null, name: '', uom: '', normal_range: '', amount: '' }); setShowModal(true); }}>
          <Plus size={18} /> Add New Test
        </button>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Unit (UOM)</th>
              <th>Normal Range</th>
              <th>Amount ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No tests available.</td></tr>
            ) : tests.map(test => (
              <tr key={test.id}>
                <td style={{ fontWeight: '500' }}>{test.name}</td>
                <td>{test.uom}</td>
                <td>{test.normal_range}</td>
                <td>${test.amount}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(test)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(test.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{formData.id ? 'Edit Test' : 'Add New Test'}</h3>
              <button className="btn" style={{ background: 'none' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Test Name</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit of Measurement (UOM)</label>
                  <input type="text" className="form-control" required value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Normal Range</label>
                  <input type="text" className="form-control" required value={formData.normal_range} onChange={e => setFormData({...formData, normal_range: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input type="number" step="0.01" className="form-control" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
