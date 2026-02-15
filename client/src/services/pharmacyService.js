import axios from 'axios';

const API_URL = 'http://localhost:5000/api/pharmacy';

// Get all pharmacy prescriptions
export const getPrescriptions = async (status = null) => {
    try {
        const params = status ? { status } : {};
        const response = await axios.get(`${API_URL}/prescriptions`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
    }
};

// Get prescription by ID
export const getPrescriptionById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/prescriptions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching prescription:', error);
        throw error;
    }
};

// Mark prescription as dispensed
export const dispensePrescription = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/prescriptions/${id}/dispense`, data);
        return response.data;
    } catch (error) {
        console.error('Error dispensing prescription:', error);
        throw error;
    }
};

// Get pharmacy statistics
export const getPharmacyStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pharmacy stats:', error);
        throw error;
    }
};
