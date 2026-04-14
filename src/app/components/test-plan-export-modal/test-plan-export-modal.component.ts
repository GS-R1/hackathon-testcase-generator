import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface TestPlan {
  id: number;
  name: string;
  rootSuite?: { id: number; name: string };
}

interface TestSuite {
  id: number;
  name: string;
  suiteType: string;
  parentSuiteId?: number;
  isRoot?: boolean;
}

@Component({
  selector: 'app-test-plan-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-plan-export-modal.component.html',
  styleUrl: './test-plan-export-modal.component.scss'
})
export class TestPlanExportModalComponent implements OnInit {
  @Input() testCasesMarkdown: string = '';
  @Input() pbiId: number | null = null;
  @Input() project: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() exported = new EventEmitter<any>();

  loading: boolean = false;
  error: string = '';

  // Project structure
  projectInfo: any = null;
  areaPaths: string[] = [];
  iterationPaths: string[] = [];
  selectedAreaPath: string = '';
  selectedIteration: string = '';

  // Test Plans
  testPlans: TestPlan[] = [];
  selectedPlanId: number | string = '';
  newPlanName: string = '';

  // Test Suites
  testSuites: TestSuite[] = [];
  selectedSuiteId: number | string = '';
  newSuiteName: string = '';
  newSuiteType: 'StaticTestSuite' | 'RequirementTestSuite' = 'StaticTestSuite';
  requirementId: number | null = null;
  rootSuiteId: number | null = null;

  // UI State
  showNewPlanForm: boolean = false;
  showNewSuiteForm: boolean = false;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadProjectInfo();
    await this.loadTestPlans();
  }

  async loadProjectInfo() {
    try {
      const result = await this.apiService.getProjectInfo(this.project);
      if (result.success) {
        this.projectInfo = result.data;
        this.areaPaths = result.data.areaPaths;
        this.iterationPaths = result.data.iterationPaths;
        this.selectedAreaPath = result.data.defaultAreaPath;
        this.selectedIteration = result.data.defaultIteration;
      }
    } catch (error: any) {
      console.error('Failed to load project info:', error);
      // Use fallback values
      this.selectedAreaPath = this.project;
      this.selectedIteration = this.project;
    }
  }

  async loadTestPlans() {
    this.loading = true;
    this.error = '';

    try {
      const result = await this.apiService.getTestPlans(this.project);
      if (result.success) {
        this.testPlans = result.data;
      } else {
        this.error = result.error || 'Failed to load test plans';
      }
    } catch (error: any) {
      this.error = error.error?.error || error.message || 'Failed to load test plans';
    } finally {
      this.loading = false;
    }
  }

  async onPlanChange() {
    if (this.selectedPlanId === 'other') {
      this.showNewPlanForm = true;
      this.testSuites = [];
      this.rootSuiteId = null;
      return;
    }

    this.showNewPlanForm = false;

    if (this.selectedPlanId) {
      await this.loadTestSuites(parseInt(this.selectedPlanId as string));
    }
  }

  async loadTestSuites(planId: number) {
    this.loading = true;
    this.error = '';

    try {
      const result = await this.apiService.getTestSuites(this.project, planId);
      if (result.success) {
        this.rootSuiteId = result.data.rootSuiteId;
        // Filter out root suite from display
        this.testSuites = result.data.suites.filter((s: TestSuite) => !s.isRoot);
      } else {
        this.error = result.error || 'Failed to load test suites';
      }
    } catch (error: any) {
      this.error = error.error?.error || error.message || 'Failed to load test suites';
    } finally {
      this.loading = false;
    }
  }

  onSuiteChange() {
    if (this.selectedSuiteId === 'other') {
      this.showNewSuiteForm = true;
    } else {
      this.showNewSuiteForm = false;
    }
  }

  async submit() {
    this.loading = true;
    this.error = '';

    try {
      let planId = this.selectedPlanId;
      let suiteId = this.selectedSuiteId;
      let parentSuiteId = this.rootSuiteId;

      // Create new test plan if "Other" selected
      if (this.selectedPlanId === 'other') {
        if (!this.newPlanName.trim()) {
          this.error = 'Please enter a test plan name';
          this.loading = false;
          return;
        }

        const planResult = await this.apiService.createTestPlan(
          this.project,
          this.newPlanName,
          this.selectedAreaPath,
          this.selectedIteration
        );

        if (!planResult.success) {
          this.error = planResult.error || 'Failed to create test plan';
          this.loading = false;
          return;
        }

        planId = planResult.data.id;
        parentSuiteId = planResult.data.rootSuite.id;
        console.log('Created test plan with root suite:', parentSuiteId);
      }

      // Create new test suite if "Other" selected or if creating new plan
      if (this.selectedSuiteId === 'other' || this.selectedPlanId === 'other') {
        if (!this.newSuiteName.trim()) {
          // Default suite name when creating new plan
          this.newSuiteName = 'Test Cases';
        }

        if (!parentSuiteId) {
          this.error = 'Could not determine parent suite for new test suite';
          this.loading = false;
          return;
        }

        // Use current PBI as requirement if not specified and requirement-based
        let actualRequirementId: number | undefined = undefined;
        if (this.newSuiteType === 'RequirementTestSuite') {
          actualRequirementId = (this.requirementId !== null ? this.requirementId : this.pbiId) || undefined;
        }

        const suiteResult = await this.apiService.createTestSuite(
          this.project,
          planId as number,
          this.newSuiteName,
          this.newSuiteType,
          parentSuiteId,
          actualRequirementId
        );

        if (!suiteResult.success) {
          this.error = suiteResult.error || 'Failed to create test suite';
          this.loading = false;
          return;
        }

        suiteId = suiteResult.data.id;
      }

      // Export test cases
      const exportResult = await this.apiService.exportTestCases(
        this.project,
        planId as number,
        suiteId as number,
        this.testCasesMarkdown,
        this.pbiId || undefined
      );

      if (exportResult.success) {
        this.exported.emit(exportResult.data);
        this.closeModal();
      } else {
        this.error = exportResult.error || 'Failed to export test cases';
      }
    } catch (error: any) {
      this.error = error.error?.error || error.message || 'Export failed';
    } finally {
      this.loading = false;
    }
  }

  closeModal() {
    this.close.emit();
  }

  canSubmit(): boolean {
    // Must have valid plan selection
    const hasPlan = this.selectedPlanId === 'other'
      ? this.newPlanName.trim().length > 0
      : this.selectedPlanId !== '';

    // Must have valid suite selection (auto-creates for new plans)
    const hasSuite = this.selectedPlanId === 'other' || this.selectedSuiteId !== '';

    return hasPlan && hasSuite && !this.loading;
  }

  getSelectedPlanName(): string {
    if (this.selectedPlanId === 'other') {
      return this.newPlanName || '(New Plan)';
    }
    const plan = this.testPlans.find(p => p.id === this.selectedPlanId);
    return plan?.name || 'Not selected';
  }

  getSelectedSuiteName(): string {
    if (this.selectedSuiteId === 'other') {
      return this.newSuiteName || 'Test Cases';
    }
    if (this.selectedPlanId === 'other') {
      return this.newSuiteName || 'Test Cases';
    }
    const suite = this.testSuites.find(s => s.id === this.selectedSuiteId);
    return suite?.name || 'Not selected';
  }
}
