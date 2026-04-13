import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settings = {
    azureDevOpsOrg: '',
    defaultProject: '',
    defaultRepository: '',
    azureCliAuthenticated: false,
    claudeApiKeySource: 'bedrock',
    awsRegion: '',
    awsProfile: '',
    bedrockModelId: ''
  };

  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.loading = true;
    this.error = '';

    try {
      const settings = await this.apiService.getSettings();
      this.settings = settings;
    } catch (error: any) {
      this.error = error.message || 'Failed to load settings';
    } finally {
      this.loading = false;
    }
  }

  async saveSettings() {
    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const result = await this.apiService.saveSettings(this.settings);
      if (result.success) {
        this.success = 'Settings saved successfully!';
        setTimeout(() => {
          this.success = '';
        }, 3000);
      } else {
        this.error = 'Failed to save settings';
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to save settings';
    } finally {
      this.loading = false;
    }
  }

}
