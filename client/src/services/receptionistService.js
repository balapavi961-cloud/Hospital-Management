const API_URL = 'http://localhost:5000/api/nurse';
const STAFF_API_URL = 'http://localhost:5000/api/staff';
const RECEPTIONIST_API_URL = 'http://localhost:5000/api/receptionist';

export const receptionistService = {
    // Get all patients
    getPatients: async () => {
        const response = await fetch(`${RECEPTIONIST_API_URL}/patients`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
    },

    // Add new patient (Log Book)
    addPatient: async (data) => {
        const response = await fetch(`${RECEPTIONIST_API_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to add patient');
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
    },

    // Update appointment details
    updateAppointment: async (id, data) => {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update appointment');
        return response.json();
    },

    // Get doctors for dropdown
    getDoctors: async () => {
        const response = await fetch(`${STAFF_API_URL}?role=Doctor`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        return response.json();
    },

    // Get departments
    getDepartments: async () => {
        const response = await fetch('http://localhost:5000/api/departments');
        if (!response.ok) throw new Error('Failed to fetch departments');
        return response.json();
    }
};
