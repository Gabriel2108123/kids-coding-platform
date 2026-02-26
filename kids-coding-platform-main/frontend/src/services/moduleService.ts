interface Module {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  skills: string[];
  content: {
    introduction: string;
    videoUrl?: string;
    lessons: Array<{
      id: string;
      title: string;
      type: 'video' | 'interactive' | 'quiz' | 'project';
      content: any;
      estimatedTime: number;
    }>;
  };
  gamification: {
    xpReward: number;
    badgeRewards: string[];
    unlocks: string[];
  };
  ageGroups: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ModuleProgress {
  moduleId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  completedLessons: string[];
  currentLesson?: string;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number;
  scores: { [lessonId: string]: number };
}

interface QuizSubmission {
  moduleId: string;
  lessonId: string;
  answers: { [questionId: string]: any };
  score: number;
  timeSpent: number;
}

class ModuleService {
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

  async getAllModules(): Promise<Module[]> {
    return this.request<Module[]>('/modules');
  }

  async getModuleById(moduleId: string): Promise<Module> {
    return this.request<Module>(`/modules/${moduleId}`);
  }

  async getModulesByCategory(category: string): Promise<Module[]> {
    return this.request<Module[]>(`/modules?category=${category}`);
  }

  async getModulesByDifficulty(difficulty: string): Promise<Module[]> {
    return this.request<Module[]>(`/modules?difficulty=${difficulty}`);
  }

  async getModulesByAgeGroup(ageGroup: string): Promise<Module[]> {
    return this.request<Module[]>(`/modules?ageGroup=${ageGroup}`);
  }

  async getRecommendedModules(): Promise<Module[]> {
    return this.request<Module[]>('/modules/recommended');
  }

  async getUserProgress(): Promise<ModuleProgress[]> {
    return this.request<ModuleProgress[]>('/users/progress/modules');
  }

  async getModuleProgress(moduleId: string): Promise<ModuleProgress> {
    return this.request<ModuleProgress>(`/users/progress/modules/${moduleId}`);
  }

  async startModule(moduleId: string): Promise<ModuleProgress> {
    return this.request<ModuleProgress>(`/modules/${moduleId}/start`, {
      method: 'POST',
    });
  }

  async completeLesson(moduleId: string, lessonId: string, timeSpent: number): Promise<ModuleProgress> {
    return this.request<ModuleProgress>(`/modules/${moduleId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    });
  }

  async submitQuiz(submission: QuizSubmission): Promise<{ score: number; passed: boolean; progress: ModuleProgress }> {
    return this.request(`/modules/${submission.moduleId}/quiz/submit`, {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  async updateProgress(moduleId: string, progress: Partial<ModuleProgress>): Promise<ModuleProgress> {
    return this.request<ModuleProgress>(`/users/progress/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  }

  async getModuleLeaderboard(moduleId: string): Promise<Array<{
    user: { username: string; avatar?: string };
    score: number;
    completionTime: number;
    rank: number;
  }>> {
    return this.request(`/modules/${moduleId}/leaderboard`);
  }

  async rateModule(moduleId: string, rating: number, review?: string): Promise<void> {
    await this.request(`/modules/${moduleId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  async searchModules(query: string, filters?: {
    category?: string;
    difficulty?: string;
    ageGroup?: string;
    skills?: string[];
  }): Promise<Module[]> {
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

    return this.request<Module[]>(`/modules/search?${searchParams}`);
  }

  async getModuleStats(moduleId: string): Promise<{
    totalStudents: number;
    averageScore: number;
    averageTime: number;
    completionRate: number;
    difficulty: string;
    ratings: { average: number; count: number };
  }> {
    return this.request(`/modules/${moduleId}/stats`);
  }

  async bookmarkModule(moduleId: string): Promise<void> {
    await this.request(`/modules/${moduleId}/bookmark`, {
      method: 'POST',
    });
  }

  async unbookmarkModule(moduleId: string): Promise<void> {
    await this.request(`/modules/${moduleId}/bookmark`, {
      method: 'DELETE',
    });
  }

  async getBookmarkedModules(): Promise<Module[]> {
    return this.request<Module[]>('/users/bookmarks/modules');
  }
}

export const moduleService = new ModuleService();
export { ModuleService };
export type { Module, ModuleProgress, QuizSubmission };
