const API_URL = 'http://localhost:5000/api/nurse';

export const nurseService = {
    // Get all assigned patients
    getPatients: async () => {
        const response = await fetch(`${API_URL}/patients`);
        if (!response.ok) {
            const errData = await response.json();
            const error = new Error(errData.message || 'Failed to add vitals');
            error.sqlError = errData.sqlError;
            throw error;
        }
        return response.json();
    },

    // Add vitals for a patient
    addVitals: async (data) => {
        const response = await fetch(`${API_URL}/vitals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json();
            const error = new Error(errData.message || 'Failed to add vitals');
            error.sqlError = errData.sqlError;
            throw error;
        }
        return response.json();
    },

    // Get vitals history for a patient
    getVitals: async (patientId) => {
        const response = await fetch(`${API_URL}/vitals/${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch vitals');
        return response.json();
    },

    // Get all appointments
    getAppointments: async () => {
        const response = await fetch(`${API_URL}/appointments`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        return response.json();
    },

    // Create new appointment
    createAppointment: async (data) => {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to book appointment');
        return response.json();
    },

    // Update appointment status
    updateAppointmentStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    }
};
