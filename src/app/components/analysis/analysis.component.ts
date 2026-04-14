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
  qualityScore?: string;
  qualityScoreHtml?: SafeHtml;
  iterations?: number;
}

interface QualityAssessment {
  quality_category: 'GOOD' | 'OK' | 'BAD';
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  overall_score: number;
  category_scores: {
    user_story_clarity: number;
    acceptance_criteria: number;
    business_value: number;
    technical_requirements: number;
    definition_of_done: number;
    context_and_detail: number;
  };
  missing_keywords: string[];
  improvement_points: Array<{
    label: string;
    prompt: string;
  }>;
  summary: string;
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
  qualityAssessment: QualityAssessment | null = null;
  qualityAssessmentLoading: boolean = false;
  qualityAssessmentError: string = '';
  improvementResponses: Record<number, string> = {};
  consolidatedResponse: string = '';
  showContextForm: boolean = false;
  showJustification: boolean = false;

  analysisResults: AnalysisResult[] = [];
  userFeedback: string = '';

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

        // Validate work item data before proceeding to Agent calls
        if (!this.itemData?.fields || Object.keys(this.itemData.fields).length === 0) {
          this.error = 'Retrieved work item has no fields. Please check your permissions for this item.';
          this.loading = false;
          return;
        }

        // Check for essential fields
        if (!this.itemData.fields['System.Title']) {
          this.error = 'Work item is missing essential data. You may not have sufficient permissions to view this item.';
          this.loading = false;
          return;
        }

        // Auto-assess PBI quality when fetched
        await this.assessPBIQuality();
      } else {
        this.error = result.error || 'Failed to fetch PBI';
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  async assessPBIQuality() {
    this.qualityAssessmentLoading = true;
    this.qualityAssessmentError = '';
    this.qualityAssessment = null;

    // Validate work item data before calling Agent
    if (!this.itemData?.fields || Object.keys(this.itemData.fields).length === 0) {
      this.qualityAssessmentError = 'Cannot assess quality: work item has no fields';
      this.qualityAssessmentLoading = false;
      return;
    }

    if (!this.itemData.fields['System.Title']) {
      this.qualityAssessmentError = 'Cannot assess quality: work item missing essential data';
      this.qualityAssessmentLoading = false;
      return;
    }

    try {
      console.log('Auto-assessing PBI quality...');
      const result = await this.apiService.analyzeWithClaude(this.itemData, 'pbiQualityAssessment');

      if (result.success) {
        // Parse JSON response
        try {
          const jsonMatch = result.data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            this.qualityAssessment = JSON.parse(jsonMatch[0]);
            console.log('Quality assessment:', this.qualityAssessment);
          } else {
            this.qualityAssessmentError = 'Failed to parse quality assessment response';
          }
        } catch (parseError) {
          console.error('Failed to parse quality assessment JSON:', parseError);
          console.log('Raw response:', result.data);
          this.qualityAssessmentError = 'Failed to parse quality assessment';
        }
      } else {
        this.qualityAssessmentError = result.error || 'Quality assessment failed';
      }
    } catch (error: any) {
      console.error('Error assessing PBI quality:', error);
      this.qualityAssessmentError = error.message || 'Failed to assess PBI quality';
    } finally {
      this.qualityAssessmentLoading = false;
    }
  }

  buildAdditionalContext(): string {
    if (!this.qualityAssessment?.missing_keywords) return '';

    // Use consolidated response if available
    if (this.consolidatedResponse && this.consolidatedResponse.trim()) {
      const keywords = this.qualityAssessment.missing_keywords.join(', ');
      return `Additional context for missing information (${keywords}):\n\n${this.consolidatedResponse}`;
    }

    return '';
  }

  getConsolidatedPrompt(): string {
    if (!this.qualityAssessment?.improvement_points || this.qualityAssessment.improvement_points.length === 0) {
      return '';
    }

    // Create a concise prompt using only the critical improvement points (3-5 items)
    // Format as numbered list
    const prompts = this.qualityAssessment.improvement_points
      .map((point, index) => `${index + 1}. ${point.prompt}`)
      .join('\n');

    return prompts;
  }

  async generateTestCases(withFeedback: boolean = false) {
    if (!this.itemData) {
      this.error = 'Please fetch a PBI first';
      return;
    }

    // Validate work item data before calling Agent
    if (!this.itemData?.fields || Object.keys(this.itemData.fields).length === 0) {
      this.error = 'Work item data is incomplete. Please fetch a valid PBI with proper permissions.';
      return;
    }

    if (!this.itemData.fields['System.Title']) {
      this.error = 'Work item is missing essential data required for test case generation.';
      return;
    }

    if (withFeedback && !this.userFeedback.trim()) {
      this.error = 'Please provide feedback before regenerating';
      return;
    }

    this.loading = true;
    this.error = '';

    // Get the previous test cases if providing feedback
    const previousTestCases = withFeedback && this.analysisResults.length > 0
      ? this.analysisResults[this.analysisResults.length - 1].content
      : undefined;

    // Build additional context from quality assessment improvement points
    const additionalContext = this.buildAdditionalContext();

    if (!withFeedback) {
      this.analysisResults = [];
      this.userFeedback = '';
    }

    try {
      const result = await this.apiService.analyzeWithClaude(
        this.itemData,
        'testCases',
        withFeedback ? this.userFeedback : undefined,
        previousTestCases,
        additionalContext || undefined
      );

      if (result.success) {
        const htmlContent = marked.parse(result.data);

        let qualityScoreHtml: SafeHtml | undefined = undefined;
        if (result.qualityScore) {
          qualityScoreHtml = this.sanitizer.sanitize(1, marked.parse(result.qualityScore)) || '';
        }

        this.analysisResults.push({
          type: 'testCases',
          content: result.data,
          htmlContent: this.sanitizer.sanitize(1, htmlContent) || '',
          timestamp: new Date(),
          qualityScore: result.qualityScore,
          qualityScoreHtml: qualityScoreHtml,
          iterations: result.iterations
        });

        // Clear feedback after successful regeneration
        if (withFeedback) {
          this.userFeedback = '';
        }
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
    this.qualityAssessment = null;
    this.qualityAssessmentLoading = false;
    this.qualityAssessmentError = '';
    this.improvementResponses = {};
    this.consolidatedResponse = '';
    this.showContextForm = false;
    this.showJustification = false;
    this.error = '';
  }

  getQualityCategoryClass(): string {
    if (!this.qualityAssessment) return '';
    const category = this.qualityAssessment.quality_category;
    return category === 'GOOD' ? 'quality-good' :
           category === 'OK' ? 'quality-ok' : 'quality-bad';
  }

  getQualityCategoryIcon(): string {
    if (!this.qualityAssessment) return '';
    const category = this.qualityAssessment.quality_category;
    return category === 'GOOD' ? '✓' :
           category === 'OK' ? '⚠' : '✗';
  }

  toggleContextForm() {
    this.showContextForm = !this.showContextForm;
  }

  toggleJustification() {
    this.showJustification = !this.showJustification;
  }
}
