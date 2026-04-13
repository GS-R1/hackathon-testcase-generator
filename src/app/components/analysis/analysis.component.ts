import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { marked } from 'marked';

interface AnalysisResult {
  type: string;
  content: string;
  htmlContent: SafeHtml;
  timestamp: Date;
}

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss'
})
export class AnalysisComponent {
  itemType: 'pbi' | 'pr' = 'pbi';
  itemId: string = '';
  project: string = '';
  repositoryId: string = '';

  loading: boolean = false;
  error: string = '';
  itemData: any = null;

  selectedAnalysisTypes: {
    testCases: boolean;
    codeReview: boolean;
    impactAnalysis: boolean;
    documentation: boolean;
  } = {
    testCases: true,
    codeReview: false,
    impactAnalysis: false,
    documentation: false
  };

  analysisResults: AnalysisResult[] = [];

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {
    this.loadDefaultSettings();
  }

  async loadDefaultSettings() {
    try {
      const settings = await this.apiService.getSettings();
      if (settings.defaultProject) {
        this.project = settings.defaultProject;
      }
      if (settings.defaultRepository) {
        this.repositoryId = settings.defaultRepository;
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
    }
  }

  async fetchItem() {
    if (!this.itemId || !this.project) {
      this.error = 'Please enter an item ID and project';
      return;
    }

    this.loading = true;
    this.error = '';
    this.itemData = null;

    try {
      let result;
      if (this.itemType === 'pbi') {
        result = await this.apiService.getWorkItem(parseInt(this.itemId), this.project);
      } else {
        if (!this.repositoryId) {
          this.error = 'Repository ID is required for PRs';
          this.loading = false;
          return;
        }
        result = await this.apiService.getPullRequest(parseInt(this.itemId), this.repositoryId, this.project);
      }

      if (result.success) {
        this.itemData = result.data;
      } else {
        this.error = result.error || 'Failed to fetch item';
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  async analyzeWithClaude() {
    if (!this.itemData) {
      this.error = 'Please fetch an item first';
      return;
    }

    const selectedTypes = Object.entries(this.selectedAnalysisTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);

    if (selectedTypes.length === 0) {
      this.error = 'Please select at least one analysis type';
      return;
    }

    this.loading = true;
    this.error = '';
    this.analysisResults = [];

    for (const analysisType of selectedTypes) {
      try {
        const result = await this.apiService.analyzeWithClaude(this.itemData, analysisType as any);

        if (result.success) {
          const htmlContent = marked.parse(result.data);
          this.analysisResults.push({
            type: analysisType,
            content: result.data,
            htmlContent: this.sanitizer.sanitize(1, htmlContent) || '',
            timestamp: new Date()
          });
        } else {
          this.error += `Failed to analyze ${analysisType}: ${result.error}\n`;
        }
      } catch (error: any) {
        this.error += `Error analyzing ${analysisType}: ${error.message}\n`;
      }
    }

    this.loading = false;
  }

  getAnalysisTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      testCases: 'Test Cases',
      codeReview: 'Code Review',
      impactAnalysis: 'Impact Analysis',
      documentation: 'Documentation'
    };
    return labels[type] || type;
  }

  copyToClipboard(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  clearResults() {
    this.analysisResults = [];
    this.itemData = null;
    this.error = '';
  }
}
