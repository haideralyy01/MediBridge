const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async saveUser(userData) {
    const response = await fetch(`${API_BASE_URL}/ai/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save user');
    }
    
    return response.json();
  }

  async getUserRecords(userId) {
    const response = await fetch(`${API_BASE_URL}/ai/records/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user records');
    }
    
    return response.json();
  }

  async sendChatMessage(message, userRole, userContext, userId) {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userRole,
        userContext,
        userId
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }
    
    return response.json();
  }

  async getHealthSuggestions(patientData, userId) {
    const response = await fetch(`${API_BASE_URL}/ai/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientData,
        userId
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get health suggestions');
    }
    
    return response.json();
  }
}

export default new ApiService();