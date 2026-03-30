import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { API_URL } from '../config';

export default function ReportEntry() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  
  const [formData, setFormData] = useState(() => {
    const nextId = parseInt(localStorage.getItem('last_report_id') || '0', 10) + 1;
    return {
      serial_number: nextId.toString(),
      patient_name: '',
      age: '',
      gender: 'Male',
      address: '',
      contact_number: '',
      referred_by: '',
      test_id: '',
      result: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      remarks: ''
    };
  });

  // Fetch Tests for dropdown
  useEffect(() => {
    fetch(`${API_URL}/tests`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setTests(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleTestChange = (e) => {
    const testId = e.target.value;
    const selectedTest = tests.find(t => t.id.toString() === testId);
    
    setFormData(prev => ({
      ...prev,
      test_id: testId,
      amount: selectedTest ? selectedTest.amount : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem('last_report_id', formData.serial_number);
    
    try {
      const selectedTest = tests.find(t => t.id.toString() === formData.test_id.toString());
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount || 0)
      };

      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const createdReport = data[0];
      
      // Fuse local form data to pass to preview exactly as expected
      const previewState = {
        ...formData,
        id: createdReport.id,
        test_name: selectedTest ? selectedTest.name : 'Unknown Test'
      };

      navigate(`/preview/${createdReport.id}`, { state: previewState });
    } catch (err) {
      alert('Error saving report: ' + err.message);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>New Patient Report</h2>
      
      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Serial Number</label>
            <input type="text" className="form-control" name="serial_number" value={formData.serial_number} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" name="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Patient Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input type="text" className="form-control" name="patient_name" required value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" className="form-control" name="age" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-control" name="gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input type="text" className="form-control" name="contact_number" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <input type="text" className="form-control" name="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Test Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Referred By (Doctor)</label>
            <input type="text" className="form-control" name="referred_by" value={formData.referred_by} onChange={e => setFormData({...formData, referred_by: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Select Test</label>
            <select className="form-control" name="test_id" required value={formData.test_id} onChange={handleTestChange}>
              <option value="" disabled>-- Choose Test --</option>
              {tests.map(test => (
                <option key={test.id} value={test.id}>{test.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Result Value</label>
            <input type="text" className="form-control" name="result" required value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input type="number" step="0.01" className="form-control" name="amount" required value={formData.amount} readOnly style={{ backgroundColor: 'var(--bg-color)' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Remarks / Additional Info</label>
          <textarea className="form-control" name="remarks" rows="3" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})}></textarea>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save and Preview Report
          </button>
        </div>
      </form>
    </div>
  );
}
