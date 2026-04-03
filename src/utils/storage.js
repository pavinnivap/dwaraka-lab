// Data management utility using localStorage

const KEYS = {
  TESTS: 'dw_lab_tests',
  REPORTS: 'dw_lab_reports',
  LAST_REPORT_ID: 'dw_last_report_id'
};

// Initial sample data
const INITIAL_TESTS = [
  { id: 1, name: 'Haemoglobin', uom: 'gms%', normal_range: '4.5 - 11.0', amount: '' },
  { id: 2, name: 'Blood sugar fasting', uom: 'mg/dL', normal_range: '70 - 110', amount: '' },
  { id: 3, name: 'Blood sugar post prandial', uom: 'mg/dL', normal_range: 'Up to 140', amount: '' },
  { id: 4, name: 'Blood sugar random', uom: 'mg/dL', normal_range: '80-120', amount: '' },
  { id: 6, name: 'Blood urea', uom: 'mg/dL', normal_range: 'Up to 50', amount: '' },
  { id: 7, name: 'Serum creatinine', uom: 'mg/dL', normal_range: '0.6 - 1.1', amount: '' },
  { id: 8, name: 'Total cholestrol', uom: 'mg/dL', normal_range: '150-200', amount: '' },
  { id: 9, name: 'HDL', uom: 'mg/dL', normal_range: '35-80', amount: '' },
  { id: 10, name: 'LDL', uom: 'mg/dL', normal_range: '40-91', amount: '' },
  { id: 11, name: 'Triglycerides', uom: 'mg/dL', normal_range: '60-165', amount: '' },

];

const getStoredData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const db = {
  // --- Tests ---
  getTests: async () => {
    let storedTests = getStoredData(KEYS.TESTS, null);

    if (storedTests === null) {
      // First time initialization
      setStoredData(KEYS.TESTS, INITIAL_TESTS);
      return INITIAL_TESTS;
    }

    // Check for any missing INITIAL_TESTS that should be there
    let updated = false;
    const currentTests = [...storedTests];

    INITIAL_TESTS.forEach(defaultTest => {
      const exists = currentTests.some(t => t.name.toLowerCase() === defaultTest.name.toLowerCase());
      if (!exists) {
        // Add missing default test with a new ID
        const newId = currentTests.length > 0 ? Math.max(...currentTests.map(t => t.id)) + 1 : 1;
        currentTests.push({ ...defaultTest, id: newId });
        updated = true;
      }
    });

    if (updated) {
      setStoredData(KEYS.TESTS, currentTests);
      return currentTests;
    }

    return storedTests;
  },

  saveTest: async (testData) => {
    let tests = getStoredData(KEYS.TESTS, []);
    let savedTest;

    if (testData.id) {
      // Update
      const index = tests.findIndex(t => t.id === testData.id);
      if (index !== -1) {
        tests[index] = { ...testData };
        savedTest = tests[index];
      }
    } else {
      // Insert
      const newId = tests.length > 0 ? Math.max(...tests.map(t => t.id)) + 1 : 1;
      savedTest = { ...testData, id: newId };
      tests.push(savedTest);
    }

    setStoredData(KEYS.TESTS, tests);
    return [savedTest]; // Returning as array to mimic Supabase response
  },

  deleteTest: async (id) => {
    let tests = getStoredData(KEYS.TESTS, []);
    const filtered = tests.filter(t => t.id !== id);
    setStoredData(KEYS.TESTS, filtered);
    return { success: true };
  },

  // --- Reports ---
  getReports: async () => {
    const reports = getStoredData(KEYS.REPORTS, []);
    const tests = getStoredData(KEYS.TESTS, INITIAL_TESTS);

    // Join with tests
    return reports.map(report => ({
      ...report,
      tests: tests.find(t => t.id.toString() === report.test_id.toString()) || null
    }));
  },

  saveReport: async (reportData) => {
    const reports = getStoredData(KEYS.REPORTS, []);
    const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;

    const newReport = {
      ...reportData,
      id: newId,
      created_at: new Date().toISOString()
    };

    reports.push(newReport);
    setStoredData(KEYS.REPORTS, reports);

    // Mimic the joined response for patient information
    // Current backend returns report joined with patient
    // Note: In our local storage, we're embedding patient info directly in the report for simplicity
    const responseData = {
      ...newReport,
      patients: {
        patient_name: newReport.patient_name,
        age: newReport.age,
        gender: newReport.gender,
        address: newReport.address,
        contact_number: newReport.contact_number
      }
    };

    return [responseData]; // Returning as array to mimic Supabase response
  }
};
