import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  async getWorkItem(workItemId: number, project: string) {
    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/workitem/${workItemId}`, {
        params: { project }
      })
    );
  }

  async analyzeWithClaude(data: any, analysisType: 'testCases' | 'impactAnalysis' | 'documentation' | 'pbiQualityAssessment', userFeedback?: string, previousTestCases?: string, additionalContext?: string) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/analyze`, {
        data,
        analysisType,
        userFeedback,
        previousTestCases,
        additionalContext
      })
    );
  }

  async getSettings() {
    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/settings`)
    );
  }

  async saveSettings(settings: any) {
    // Settings are managed via environment variables now
    return { success: true };
  }
}
