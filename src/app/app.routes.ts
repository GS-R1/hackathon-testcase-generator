import { Routes } from '@angular/router';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/analysis', pathMatch: 'full' },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'settings', component: SettingsComponent }
];
