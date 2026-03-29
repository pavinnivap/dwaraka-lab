import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Get all tests
app.get('/api/tests', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  const { data, error } = await supabase.from('tests').select('*').order('name');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update or Insert Test
app.post('/api/tests', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  const { id, name, uom, normal_range, amount } = req.body;
  
  if (id) {
    const { data, error } = await supabase.from('tests').update({ name, uom, normal_range, amount }).eq('id', id).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } else {
    const { data, error } = await supabase.from('tests').insert([{ name, uom, normal_range, amount }]).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }
});

app.delete('/api/tests/:id', async (req, res) => {
   if (!supabase) return res.status(500).json({ error: 'Database not connected' });
   const { error } = await supabase.from('tests').delete().eq('id', req.params.id);
   if (error) return res.status(400).json({ error: error.message });
   res.json({ success: true });
});

// Get reports history
app.get('/api/reports', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  // Query reports joining patients and tests
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      patients (*),
      tests (*)
    `)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Insert new report and patient
app.post('/api/reports', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  const { patient_name, age, gender, address, contact_number, serial_number, referred_by, test_id, result, date, remarks, amount } = req.body;
  
  try {
    // 1. Insert Patient
    const { data: patientData, error: patientError } = await supabase.from('patients').insert([{
      patient_name, age, gender, address, contact_number
    }]).select().single();
    
    if (patientError) throw patientError;

    // 2. Insert Report
    const { data: reportData, error: reportError } = await supabase.from('reports').insert([{
      serial_number,
      patient_id: patientData.id,
      referred_by,
      test_id,
      result,
      date,
      remarks,
      amount
    }]).select();

    if (reportError) throw reportError;
    
    res.json(reportData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
