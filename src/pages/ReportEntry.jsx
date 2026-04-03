import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save } from 'lucide-react';
import { db } from '../utils/storage';

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
      tests_performed: [{ test_id: '', result: '' }],
      amount: '0',
      date: new Date().toISOString().split('T')[0],
      remarks: ''
    };
  });

  const { state } = useLocation();

  // Fetch Tests from local storage
  useEffect(() => {
    db.getTests()
      .then(data => {
        if (data) setTests(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Handle Edit/Duplicate state
  useEffect(() => {
    if (state?.editReport) {
      const r = state.editReport;
      const nextId = parseInt(localStorage.getItem('last_report_id') || '0', 10) + 1;
      
      setFormData({
        serial_number: nextId.toString(),
        patient_name: r.patient_name || '',
        age: r.age || '',
        gender: r.gender || 'Male',
        address: r.address || '',
        contact_number: r.contact_number || '',
        referred_by: r.referred_by || '',
        tests_performed: r.tests_performed ? r.tests_performed.map(tp => ({ test_id: tp.test_id, result: tp.result })) : [{ test_id: '', result: '' }],
        amount: r.amount?.toString() || '0',
        date: new Date().toISOString().split('T')[0],
        remarks: r.remarks || ''
      });
    }
  }, [state, tests]); // Run when state or tests change to ensure lookup works

  const addTestRow = () => {
    setFormData(prev => ({
      ...prev,
      tests_performed: [...prev.tests_performed, { test_id: '', result: '' }]
    }));
  };

  const removeTestRow = (index) => {
    setFormData(prev => {
      const newTests = prev.tests_performed.filter((_, i) => i !== index);
      // Re-calculate amount
      const newAmount = newTests.reduce((sum, tp) => {
        const test = tests.find(t => t.id.toString() === tp.test_id.toString());
        return sum + (test ? parseFloat(test.amount || 0) : 0);
      }, 0);

      return {
        ...prev,
        tests_performed: newTests.length > 0 ? newTests : [{ test_id: '', result: '' }],
        amount: newAmount.toString()
      };
    });
  };

  const handleTestRowChange = (index, field, value) => {
    setFormData(prev => {
      const newTests = [...prev.tests_performed];
      newTests[index] = { ...newTests[index], [field]: value };
      
      // If test_id changed, update amount
      let newAmount = prev.amount;
      if (field === 'test_id') {
        newAmount = newTests.reduce((sum, tp) => {
          const test = tests.find(t => t.id.toString() === tp.test_id.toString());
          return sum + (test ? parseFloat(test.amount || 0) : 0);
        }, 0).toString();
      }

      return {
        ...prev,
        tests_performed: newTests,
        amount: newAmount
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.tests_performed.some(t => !t.test_id || !t.result)) {
      alert('Please select a test and enter result for all rows.');
      return;
    }

    localStorage.setItem('last_report_id', formData.serial_number);
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount || 0)
      };

      const data = await db.saveReport(payload);
      const createdReport = data[0];
      
      navigate(`/preview/${createdReport.id}`, { state: { ...payload, id: createdReport.id } });
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

        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Test Details
          <button type="button" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={addTestRow}>+ Add Another Test</button>
        </h3>
        
        {formData.tests_performed.map((testRow, index) => {
          const selectedTestDetails = tests.find(t => t.id.toString() === testRow.test_id.toString());
          
          return (
            <div key={index} style={{ position: 'relative', marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              {formData.tests_performed.length > 1 && (
                <button type="button" onClick={() => removeTestRow(index)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  Remove
                </button>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Test</label>
                  <select className="form-control" required value={testRow.test_id} onChange={e => handleTestRowChange(index, 'test_id', e.target.value)}>
                    <option value="" disabled>-- Choose Test --</option>
                    {tests.map(test => (
                      <option key={test.id} value={test.id}>{test.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Result Value</label>
                  <input type="text" className="form-control" required value={testRow.result} onChange={e => handleTestRowChange(index, 'result', e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit & Reference</label>
                  <div style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-color)', borderRadius: '4px', minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                    {selectedTestDetails ? (
                      <span>{selectedTestDetails.uom} | Ref: {selectedTestDetails.normal_range}</span>
                    ) : (
                      <i style={{ opacity: 0.5 }}>Select a test...</i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="form-group" style={{ maxWidth: '200px' }}>
          <label className="form-label">Total Amount ($)</label>
          <input type="number" step="0.01" className="form-control" value={formData.amount} readOnly style={{ backgroundColor: 'var(--bg-color)', fontWeight: 'bold' }} />
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
