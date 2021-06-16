import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {InstanceComponent} from './components/instance/instance.component';

const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {
        path: 'dashboard', component: DashboardComponent,
        children: [
            {
                path: ':id', component: DashboardComponent
            }
        ]
    },
    {path: ':id', component: InstanceComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
    constructor() {
    }
}
