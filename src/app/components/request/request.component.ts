
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Request } from 'src/app/models/request';
import { AuthoringService } from 'src/app/services/authoring/authoring.service';

@Component({
  selector: 'app-request',
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './request.component.html',
  styleUrl: './request.component.scss'
})
export class RequestComponent implements OnInit {

  public formType: string = 'add-concept';
  request: Request;
  requestId: string;
  country: string;

  constructor(private authoringService: AuthoringService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.country = this.activatedRoute.snapshot.paramMap.get('country');
    this.requestId = this.activatedRoute.snapshot.paramMap.get('id');
    this.authoringService.httpGetRMPRequestDetails(this.requestId).subscribe(response => {
      if (response) {
        this.request = response as Request;
      }
    });
  }

}
