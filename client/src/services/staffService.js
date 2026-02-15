const API_URL = 'http://localhost:5000/api/staff';

export const staffService = {
    // Get all staff or filter by role
    getAllStaff: async (role) => {
        let url = API_URL;
        if (role) {
            url += `?role=${encodeURIComponent(role)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch staff');
        return response.json();
    },

    addStaff: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to add staff');
        return response.json();
    },

    // Update staff
    updateStaff: async (id, data) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update staff');
        return response.json();
    },

    // Delete staff
    deleteStaff: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete staff');
        return response.json();
    }
};
