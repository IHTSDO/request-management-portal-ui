
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Request } from '../../models/request';
import { AuthoringService } from '../../services/authoring/authoring.service';
import { ToastrService } from 'ngx-toastr';
import { StatusTransformPipe } from '../../pipes/status-transform/status-transform.pipe';
import { RequestTypeTransformPipe } from '../../pipes/request-type-transform/request-type-transform.pipe';
import { ImsService } from '../../services/ims/ims.service';

enum Mode {
  NEW,
  VIEW,
  EDIT
}

@Component({
  selector: 'app-request',
  imports: [CommonModule, FormsModule, NgIf, RouterLink, StatusTransformPipe, RequestTypeTransformPipe],
  templateUrl: './request.component.html',
  styleUrl: './request.component.scss'
})
export class RequestComponent implements OnInit {

  ModeType = Mode; // Expose the Mode enum to the template for use in conditionals
  mode: Mode = Mode.NEW; // Default mode is NEW

  public formType: string = 'add-concept';
  public formLangageRefset: string = '';
  public formContextRefset: string = '';

  users: any[] = [];
  request: Request;
  requestId: string;
  country: string;

  constructor(private authoringService: AuthoringService,
    private imsService: ImsService,
    private readonly toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.country = this.activatedRoute.snapshot.paramMap.get('country');
    this.requestId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.requestId) {
      this.mode = Mode.VIEW; // Set mode to view if requestId is present
      this.authoringService.httpGetRMPRequestDetails(this.requestId).subscribe(response => {
        if (response) {
          this.request = response as Request;
          this.getUsers(); // Fetch user details for the request
        }
      });
    } else {
      this.resetFormValues(); // Reset form values to defaults
    }
  }

  getUserDisplayName(username: string): string {
    const user = this.users.find(user => user.username === username);
    if (user) {
      return user.displayName || username;
    }
    return username;
  }

  saveRequest(form: NgForm): void {
    if (this.mode === Mode.NEW) {
      if (!form.valid) {
        this.toastr.error('Please fill in all required fields before submitting.', 'Form Incomplete');
        return;
      }

      this.request.type = this.formType; // Set the type based on the form type
      this.request.country = this.country; // Set the country from the route parameter
      this.request.status = 'NEW'; // Default status for new requests
      this.request.languageRefset = this.formLangageRefset; // Set language refset
      this.request.contextRefset = this.formContextRefset; // Set context refset

      this.toastr.info('Creating new request...', 'Please wait');
      this.authoringService.httpCreateRMPRequest(this.request).subscribe(response => {
        if (response) {
          this.router.navigate([this.country]); // Navigate to the country page after creation
          this.request = response as Request;
          this.toastr.clear(); // Clear any previous toastr messages
          this.toastr.success('Request with ID: ' + this.request.id + ' has been created successfully.', 'Request Created');
        }
      }, error => {
        this.toastr.clear(); // Clear any previous toastr messages
        this.toastr.error('Failed to create request: ' + error.message, 'Error');
      }
      );
    }
  }

  resetForm(form: NgForm): void {
    const currentFormType = this.formType; // Store current form type
    form.resetForm(); // Reset the form state
    this.resetFormValues(); // Reset form values to defaults
    this.toastr.clear(); // Clear any previous toastr messages

    setTimeout(() => {
      this.formType = currentFormType;
      this.formLangageRefset = ''; // Reset language refset
      this.formContextRefset = ''; // Reset context refset
    }, 0);
  }

  private resetFormValues(): void {
    this.request = new Request(
      null, // id
      '', // type
      'NEW', // status
      this.country, // country
      '', // reporter
      '', // assignee
      '', // summary
      '', // languageRefset
      '', // contextRefset
      '', // concept
      '', // conceptId
      '', // conceptName
      '', // relationshipType
      '', // relationshipTarget
      '', // existingRelationship
      '', // memberConceptIds
      '', // eclQuery
      '', // existingDescription
      '', // newDescription
      '', // newFSN
      '', // newPT
      '', // newSynonyms
      '', // parentConcept
      '', // justification
      '', // reference
      0,  // created timestamp placeholder
      0   // updated timestamp placeholder
    );
  }

  private getUsers(): void {
    this.imsService.httpGetUser(this.request.reporter).subscribe(user => {
      if (!this.users.find(u => u.username === user.username)) {
        this.users.push(user);
      }
    });
  }

}
