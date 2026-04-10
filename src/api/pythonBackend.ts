/**
 * ECD Backend API Integration
 * Connected to live Render Node.js Backend.
 */

export const API_BASE_URL = "https://ecd-backend-xqsw.onrender.com";

// Helper function to handle fetch and errors
async function apiFetch(endpoint: string) {
  try {
    // We add a slash only if the endpoint doesn't already have one
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.warn(`Endpoint ${endpoint} not found (404). Check your Backend server.js`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return []; // Return empty array so the UI doesn't break
  }
}

/**
 * Most backends use one main route to get all Excel data.
 * If your server.js uses app.get('/ecd-data', ...), use '/ecd-data' below.
 */

export async function fetchChildren() {
  // Try changing '/api/children' to '/ecd-data' if the first one fails
  return await apiFetch("/ecd-data"); 
}

export async function fetchRiskData() {
  return await apiFetch("/ecd-data");
}

export async function fetchReferralData() {
  return await apiFetch("/ecd-data");
}

export async function fetchOutcomesData() {
  return await apiFetch("/ecd-data");
}

export async function fetchWorkforceData() {
  return await apiFetch("/ecd-data");
}