const API_URL = 'http://localhost:5000/api/doctor';

export const doctorService = {
    getAppointments: async (doctorName) => {
        let url = `${API_URL}/appointments`;
        if (doctorName) {
            url += `?doctorName=${encodeURIComponent(doctorName)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch doctor appointments');
        return response.json();
    },

    async getStats(doctorName) {
        let url = `${API_URL}/stats`;
        if (doctorName) {
            url += `?doctorName=${encodeURIComponent(doctorName)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch doctor stats');
        return response.json();
    },

    getLiveQueue: async (doctorName) => {
        let url = `${API_URL}/live-queue`;
        if (doctorName) {
            url += `?doctorName=${encodeURIComponent(doctorName)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch live queue');
        return response.json();
    },

    updateStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    }
};
