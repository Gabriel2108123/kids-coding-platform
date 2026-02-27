import { ParentAccount, ChildProfile, ParentAuthResponse, ChildAuthResponse, ParentRegistrationData, ChildRegistrationData } from '../types/family';

class FamilyAuthService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ==========================================
  // PARENT AUTHENTICATION
  // ==========================================

  async registerParent(data: ParentRegistrationData): Promise<ParentAuthResponse> {
    try {
      // Transform parent registration data to match backend User model
      const registrationData = {
        username: data.email.split('@')[0], // Use email prefix as username
        email: data.email,
        password: data.password,
        dateOfBirth: '1980-01-01T00:00:00.000Z', // ISO string format
        displayName: `${data.firstName} ${data.lastName}`,
        role: 'parent',
        preferredLanguage: 'en',
        familyName: data.familyName || '',
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || ''
      };

      // eslint-disable-next-line no-console
      console.log('Sending registration data:', registrationData);

      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      // eslint-disable-next-line no-console
      console.log('Registration response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Store parent token - backend returns token in data object
      if (result.data?.token) {
        localStorage.setItem('parentToken', result.data.token);
        localStorage.setItem('userType', 'parent');
      }

      // Transform response to match expected frontend format
      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: result.data.user,
          token: result.data.token,
          family: { children: [] }
        }
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginParent(email: string, password: string): Promise<ParentAuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();

      // Check if user is a parent
      if (result.data?.user && result.data.user.role !== 'parent') {
        throw new Error('Access denied. This account is not a parent account.');
      }

      // Store parent token - backend returns token in data object
      if (result.data?.token) {
        localStorage.setItem('parentToken', result.data.token);
        localStorage.setItem('userType', 'parent');
      }

      // Transform response to match expected frontend format
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: result.data.user,
          token: result.data.token,
          family: { children: [] } // Will be populated when we implement child management
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getParentProfile(): Promise<ParentAccount> {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        throw new Error('No parent token found');
      }

      // eslint-disable-next-line no-console
      console.log('Fetching parent profile with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // eslint-disable-next-line no-console
      console.log('Parent profile response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // eslint-disable-next-line no-console
          console.log('Parent token expired - cleaning up');
          localStorage.removeItem('parentToken');
          localStorage.removeItem('userType');
          throw new Error('Session expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch parent profile');
      }

      const result = await response.json();
      // eslint-disable-next-line no-console
      console.log('Parent profile fetched successfully');
      return result.data; // Backend returns profile in data object
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get parent profile error:', error);
      throw error;
    }
  }

  async updateParentProfile(updates: Partial<ParentAccount>): Promise<ParentAccount> {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        throw new Error('No parent token found');
      }

      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('parentToken');
          localStorage.removeItem('userType');
          throw new Error('Session expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update parent profile');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // CHILD MANAGEMENT
  // ==========================================

  async addChild(childData: ChildRegistrationData): Promise<ChildProfile> {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        throw new Error('Parent not authenticated');
      }

      // Transform child data to match backend User model requirements
      const registrationData = {
        username: childData.username,
        email: `${childData.username}@kids.local`, // Generate email for child
        password: childData.password,
        dateOfBirth: childData.dateOfBirth, // Should be ISO string format
        displayName: childData.displayName,
        preferredLanguage: 'en'
      };

      // eslint-disable-next-line no-console
      console.log('Sending child registration data:', registrationData);

      const response = await fetch(`${this.baseURL}/users/children`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      // eslint-disable-next-line no-console
      console.log('Add child response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add child');
      }

      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Add child error:', error);
      throw error;
    }
  }

  async getChildren(): Promise<ChildProfile[]> {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        throw new Error('Parent not authenticated');
      }

      // eslint-disable-next-line no-console
      console.log('Fetching children with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${this.baseURL}/users/children`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // eslint-disable-next-line no-console
      console.log('Get children response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // eslint-disable-next-line no-console
          console.log('Parent token expired - cleaning up');
          localStorage.removeItem('parentToken');
          localStorage.removeItem('userType');
          throw new Error('Session expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch children');
      }

      const result = await response.json();
      // eslint-disable-next-line no-console
      console.log('Children fetched successfully:', result.data);
      return result.data || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get children error:', error);
      throw error;
    }
  }

  async updateChild(childId: string, updates: Partial<ChildProfile>): Promise<ChildProfile> {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        throw new Error('Parent not authenticated');
      }

      // eslint-disable-next-line no-console
      console.log('Sending updateChild request:', {
        url: `${this.baseURL}/users/children/${childId}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: updates
      });

      const response = await fetch(`${this.baseURL}/users/children/${childId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      // eslint-disable-next-line no-console
      console.log('UpdateChild response status:', response.status);

      const responseData = await response.json();
      // eslint-disable-next-line no-console
      console.log('UpdateChild response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Server responded with status ${response.status}`);
      }

      return responseData.data; // Backend returns updated child in data object
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('UpdateChild service error:', error);
      throw error;
    }
  }

  async deleteChild(childId: string): Promise<void> {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        throw new Error('Parent not authenticated');
      }

      const response = await fetch(`${this.baseURL}/users/children/${childId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete child');
      }
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // CHILD AUTHENTICATION
  // ==========================================

  async loginChild(username: string, password: string): Promise<ChildAuthResponse> {
    try {
      // For child login, we use the existing login endpoint
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username.includes('@') ? username : `${username}@kids.local`,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();

      // Check if user is a student (child) - backend returns data in result.data
      if (result.data?.user && result.data.user.role !== 'student') {
        throw new Error('Access denied. This account is not a child account.');
      }

      // Store child token - backend returns token in data object
      if (result.data?.token) {
        localStorage.setItem('childToken', result.data.token);
        localStorage.setItem('userType', 'child');
        localStorage.setItem('childId', result.data.user._id);
      }

      // Transform response to match expected frontend format
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: result.data.user,
          token: result.data.token,
          permissions: {
            canCreateProjects: true,
            canShareProjects: true,
            maxDailyTime: 60,
            allowedFeatures: []
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getChildProfile(): Promise<ChildProfile> {
    try {
      const token = localStorage.getItem('childToken');
      if (!token) {
        throw new Error('No child token found');
      }

      // eslint-disable-next-line no-console
      console.log('Fetching child profile with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // eslint-disable-next-line no-console
      console.log('Child profile response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // eslint-disable-next-line no-console
          console.log('Child token expired - cleaning up');
          localStorage.removeItem('childToken');
          localStorage.removeItem('userType');
          localStorage.removeItem('childId');
          throw new Error('Session expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch child profile');
      }

      const result = await response.json();
      // eslint-disable-next-line no-console
      console.log('Child profile fetched successfully');
      return result.data; // Backend returns profile in data object
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get child profile error:', error);
      throw error;
    }
  }

  async updateChildProfile(updates: Partial<ChildProfile>): Promise<ChildProfile> {
    try {
      const token = localStorage.getItem('childToken');
      if (!token) {
        throw new Error('No child token found');
      }

      // eslint-disable-next-line no-console
      console.log('Updating child profile with:', updates);

      const response = await fetch(`${this.baseURL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      // eslint-disable-next-line no-console
      console.log('Update child profile response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('childToken');
          localStorage.removeItem('userType');
          localStorage.removeItem('childId');
          throw new Error('Session expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      // eslint-disable-next-line no-console
      console.log('Child profile updated successfully');
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Update child profile error:', error);
      throw error;
    }
  }

  // ==========================================
  // SHARED UTILITIES
  // ==========================================

  logout(): void {
    localStorage.removeItem('parentToken');
    localStorage.removeItem('childToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('childId');
  }

  getCurrentUserType(): 'parent' | 'child' | null {
    return localStorage.getItem('userType') as 'parent' | 'child' | null;
  }

  isAuthenticated(): boolean {
    const userType = this.getCurrentUserType();
    const hasToken = userType === 'parent'
      ? !!localStorage.getItem('parentToken')
      : userType === 'child'
        ? !!localStorage.getItem('childToken')
        : false;

    return hasToken;
  }

  async getCurrentUser(): Promise<ParentAccount | ChildProfile | null> {
    try {
      const userType = this.getCurrentUserType();
      if (userType === 'parent') {
        return await this.getParentProfile();
      } else if (userType === 'child') {
        return await this.getChildProfile();
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const familyAuthService = new FamilyAuthService();
export default familyAuthService;
