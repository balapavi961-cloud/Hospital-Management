const API_URL = 'http://localhost:5000/api/prescriptions';

export const prescriptionService = {
    uploadPrescription: async (appointmentId, imageBase64, type = 'pharmacy') => {
        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId,
                    type,
                    image: imageBase64
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    throw new Error(error.message || 'Failed to upload prescription');
                } catch (e) {
                    throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${text.substring(0, 100)}...`);
                }
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading prescription:', error);
            throw error;
        }
    },

    getPrescriptions: async (appointmentId) => {
        try {
            const response = await fetch(`${API_URL}/${appointmentId}`);
            if (!response.ok) {
                if (response.status === 404) return [];
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    throw new Error(error.message || 'Failed to fetch prescription');
                } catch (e) {
                    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
                }
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching prescription:', error);
            throw error;
        }
    },

    sendToPharmacy: async (prescriptionId) => {
        try {
            const response = await fetch(`${API_URL}/${prescriptionId}/send-to-pharmacy`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to send prescription to pharmacy');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending to pharmacy:', error);
            throw error;
        }
    },

    sendToLab: async (prescriptionId) => {
        try {
            const response = await fetch(`${API_URL}/${prescriptionId}/send-to-lab`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to send prescription to lab');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending to lab:', error);
            throw error;
        }
    }
};
