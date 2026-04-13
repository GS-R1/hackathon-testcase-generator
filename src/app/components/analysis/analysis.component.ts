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
  itemId: string = '';
  project: string = '';

  loading: boolean = false;
  error: string = '';
  itemData: any = null;

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
    } catch (error: any) {
      console.error('Failed to load settings:', error);
    }
  }

  async fetchItem() {
    if (!this.itemId || !this.project) {
      this.error = 'Please enter a PBI ID and project';
      return;
    }

    this.loading = true;
    this.error = '';
    this.itemData = null;

    try {
      const result = await this.apiService.getWorkItem(parseInt(this.itemId), this.project);

      if (result.success) {
        this.itemData = result.data;
      } else {
        this.error = result.error || 'Failed to fetch PBI';
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  async generateTestCases() {
    if (!this.itemData) {
      this.error = 'Please fetch a PBI first';
      return;
    }

    this.loading = true;
    this.error = '';
    this.analysisResults = [];

    try {
      const result = await this.apiService.analyzeWithClaude(this.itemData, 'testCases');

      if (result.success) {
        const htmlContent = marked.parse(result.data);
        this.analysisResults.push({
          type: 'testCases',
          content: result.data,
          htmlContent: this.sanitizer.sanitize(1, htmlContent) || '',
          timestamp: new Date()
        });
      } else {
        this.error = `Failed to generate test cases: ${result.error}`;
      }
    } catch (error: any) {
      this.error = `Error generating test cases: ${error.message}`;
    }

    this.loading = false;
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
