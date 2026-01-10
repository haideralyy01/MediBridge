// Utility functions for user authentication and data management

export const clearUserData = () => {
  // Clear all user-specific data from localStorage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_data");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");
  localStorage.removeItem("google_id");
  localStorage.removeItem("patient_id");
  localStorage.removeItem("doctor_profile"); // Legacy data
  
  // Clear ALL namespaced and user-specific cached data
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith("user_") || 
      key.startsWith("doctor_") || 
      key.startsWith("patient_") ||
      key.startsWith("health_records") ||
      key.startsWith("prescribed_medicines") ||
      key.startsWith("prescribed_tests") ||
      key.includes(":") // Clear all namespaced keys like "health_records:123"
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("auth_token");
  const userData = localStorage.getItem("user_data");
  return !!(token && userData);
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

export const updateUserData = (updates: any) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem("user_data", JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
};

export const logout = async () => {
  const authToken = localStorage.getItem("auth_token");
  
  // Call backend logout endpoint if token exists
  if (authToken) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
  
  // Clear all user data
  clearUserData();
  
  // Redirect to login
  window.location.href = "/login";
};