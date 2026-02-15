import axios from 'axios';

const API_URL = 'http://localhost:5000/api/laboratory';

export const getLaboratoryStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching laboratory stats:', error);
        throw error;
    }
};

export const getPrescriptions = async (status = null) => {
    try {
        const url = status ? `${API_URL}/prescriptions?status=${status}` : `${API_URL}/prescriptions`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
    }
};

export const getPrescriptionById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/prescriptions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching prescription:', error);
        throw error;
    }
};

export const uploadReport = async (id, reportFiles, labTechnician) => {
    try {
        const formData = new FormData();

        // Append multiple files
        if (Array.isArray(reportFiles)) {
            reportFiles.forEach(file => {
                formData.append('reports', file);
            });
        } else {
            // Single file fallback
            formData.append('reports', reportFiles);
        }

        formData.append('lab_technician', labTechnician);

        const response = await axios.post(`${API_URL}/prescriptions/${id}/upload-report`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading report:', error);
        throw error;
    }
};

export const sendReportToDoctor = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/prescriptions/${id}/send-report`);
        return response.data;
    } catch (error) {
        console.error('Error sending report to doctor:', error);
        throw error;
    }
};
