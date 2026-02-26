interface CodeExecutionRequest {
  code: string;
  language: 'javascript' | 'python' | 'scratch' | 'blockly';
  input?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description?: string;
  }>;
  timeLimit?: number;
  memoryLimit?: number;
}

interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed?: number;
  testResults?: Array<{
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
  }>;
}

interface SavedProject {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  playCount: number;
  likes: number;
  author: {
    username: string;
    avatar?: string;
  };
}

interface ProjectTemplate {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  code: string;
  language: string;
  instructions: string;
  previewImage?: string;
  tags: string[];
}

class CodeExecutionService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    return this.request<CodeExecutionResult>('/code/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateCode(code: string, language: string): Promise<{
    isValid: boolean;
    errors: Array<{
      line: number;
      column: number;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }>;
    suggestions: string[];
  }> {
    return this.request('/code/validate', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  }

  async saveProject(project: {
    title: string;
    description: string;
    code: string;
    language: string;
    isPublic: boolean;
    tags: string[];
  }): Promise<SavedProject> {
    return this.request<SavedProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(projectId: string, updates: Partial<SavedProject>): Promise<SavedProject> {
    return this.request<SavedProject>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async getUserProjects(): Promise<SavedProject[]> {
    return this.request<SavedProject[]>('/projects/user');
  }

  async getProjectById(projectId: string): Promise<SavedProject> {
    return this.request<SavedProject>(`/projects/${projectId}`);
  }

  async getPublicProjects(page = 1, limit = 20): Promise<{
    projects: SavedProject[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.request(`/projects/public?page=${page}&limit=${limit}`);
  }

  async searchProjects(query: string, filters?: {
    language?: string;
    tags?: string[];
    difficulty?: string;
  }): Promise<SavedProject[]> {
    const searchParams = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value);
          }
        }
      });
    }

    return this.request<SavedProject[]>(`/projects/search?${searchParams}`);
  }

  async likeProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}/like`, {
      method: 'POST',
    });
  }

  async unlikeProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}/like`, {
      method: 'DELETE',
    });
  }

  async incrementPlayCount(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}/play`, {
      method: 'POST',
    });
  }

  async getTemplates(): Promise<ProjectTemplate[]> {
    return this.request<ProjectTemplate[]>('/templates');
  }

  async getTemplateById(templateId: string): Promise<ProjectTemplate> {
    return this.request<ProjectTemplate>(`/templates/${templateId}`);
  }

  async getTemplatesByCategory(category: string): Promise<ProjectTemplate[]> {
    return this.request<ProjectTemplate[]>(`/templates?category=${category}`);
  }

  async createFromTemplate(templateId: string, customizations?: {
    title?: string;
    description?: string;
  }): Promise<SavedProject> {
    return this.request<SavedProject>(`/templates/${templateId}/create`, {
      method: 'POST',
      body: JSON.stringify(customizations || {}),
    });
  }

  async shareProject(projectId: string, platform: 'link' | 'social'): Promise<{
    shareUrl: string;
    embedCode?: string;
  }> {
    return this.request(`/projects/${projectId}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  }

  async reportProject(projectId: string, reason: string, details?: string): Promise<void> {
    await this.request(`/projects/${projectId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, details }),
    });
  }

  async getCodeSuggestions(code: string, language: string, cursor: number): Promise<{
    suggestions: Array<{
      text: string;
      description: string;
      type: 'function' | 'variable' | 'keyword' | 'snippet';
    }>;
  }> {
    return this.request('/code/suggestions', {
      method: 'POST',
      body: JSON.stringify({ code, language, cursor }),
    });
  }

  async formatCode(code: string, language: string): Promise<{ formattedCode: string }> {
    return this.request('/code/format', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  }
}

export const codeExecutionService = new CodeExecutionService();
export { CodeExecutionService };
export type { CodeExecutionRequest, CodeExecutionResult, SavedProject, ProjectTemplate };
