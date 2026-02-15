const API_URL = 'http://localhost:5000/api/referrals'; // Adjust if needed

export const referralService = {
    createReferral: async (referralData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(referralData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create referral');
        }
        return response.json();
    },

    getReferralsForDoctor: async (doctorId, doctorName) => {
        // Build query string
        const params = new URLSearchParams();
        if (doctorId) params.append('doctorId', doctorId);
        if (doctorName) params.append('doctorName', doctorName);

        const response = await fetch(`${API_URL}/doctor?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch referrals');
        }
        return response.json();
    },

    getReferralsForDepartment: async (departmentId, departmentName) => {
        const params = new URLSearchParams();
        if (departmentId) params.append('departmentId', departmentId);
        if (departmentName) params.append('departmentName', departmentName);

        const response = await fetch(`${API_URL}/department?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch department referrals');
        }
        return response.json();
    },

    updateStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        return response.json();
    }
};
