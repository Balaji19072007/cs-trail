// frontend/src/api/leaderboardApi.js

import { API_ENDPOINTS, getHeaders } from '../config/api.js';

/**
 * Fetches the global leaderboard data from the backend.
 * @param {string} timeframe - e.g., 'all-time', 'monthly'
 * @param {string} category - e.g., 'all', 'easy', 'algorithms'
 */
export const fetchLeaderboard = async (timeframe = 'all-time', category = 'all') => {
    // Construct query parameters (though backend routes/leaderboardRoutes.js currently ignores them, this is for future compatibility)
    const query = new URLSearchParams({ timeframe, category }).toString();
    const url = `${API_ENDPOINTS.LEADERBOARD.GET}?${query}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(false),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.msg || `Failed to fetch leaderboard data: ${response.statusText}`);
    }

    // The backend is expected to return an array of users with rank, name, solved, etc.
    return data;
};
