import { Routes } from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {RequestComponent} from './components/request/request.component';
import {RequestManagementComponent} from './components/request-management/request-management.component';

export const routes: Routes = [
    {path: '', component: DashboardComponent},
    {path: ':country', component: RequestManagementComponent},
    {path: ':country/new-request', component: RequestComponent},
    {path: ':country/:id', component: RequestComponent}
];
