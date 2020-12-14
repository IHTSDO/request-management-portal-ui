import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HeaderInterceptor } from './interceptors/header.interceptor';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { SnomedNavbarComponent } from './components/snomed-navbar/snomed-navbar.component';
import { SnomedFooterComponent } from './components/snomed-footer/snomed-footer.component';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthoringService } from './services/authoring/authoring.service';
import { RequestTabsComponent } from './components/request-tabs/request-tabs.component';
import { AddConceptFormComponent } from './components/add-concept-form/add-concept-form.component';
import { AddDescriptionFormComponent } from './components/add-description-form/add-description-form.component';
import { AddRelationshipFormComponent } from './components/add-relationship-form/add-relationship-form.component';
import { ChangeDescriptionFormComponent } from './components/change-description-form/change-description-form.component';
import { ChangeRelationshipFormComponent } from './components/change-relationship-form/change-relationship-form.component';
import { InactivateDescriptionFormComponent } from './components/inactivate-description-form/inactivate-description-form.component';
import { InactivateRelationshipFormComponent } from './components/inactivate-relationship-form/inactivate-relationship-form.component';
import { OtherFormComponent } from './components/other-form/other-form.component';
import { MatRadioModule } from '@angular/material/radio';
import { ToastrModule } from 'ngx-toastr';
import { AuthBlockComponent } from './components/auth-block/auth-block.component';

@NgModule({
    declarations: [
        AppComponent,
        SnomedNavbarComponent,
        SnomedFooterComponent,
        RequestTabsComponent,
        AddConceptFormComponent,
        AddDescriptionFormComponent,
        AddRelationshipFormComponent,
        ChangeDescriptionFormComponent,
        ChangeRelationshipFormComponent,
        InactivateDescriptionFormComponent,
        InactivateRelationshipFormComponent,
        OtherFormComponent,
        AuthBlockComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NgbTypeaheadModule,
        MatRadioModule,
        ToastrModule.forRoot(),
        ReactiveFormsModule
    ],
    providers: [
        AuthenticationService,
        AuthoringService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HeaderInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
