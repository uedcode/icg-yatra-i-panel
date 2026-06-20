import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-document-detail',
    templateUrl: './common-document-detail.component.html',
    styleUrls: ['./common-document-detail.component.css'],
    standalone: false
})
export class CommonDocumentDetailComponent implements OnInit {
  constructor(
    public $auth: AuthService,
    public $codeDocInfo: CodeDocInfoApiService
  ) {}

  fileUrl = environment.fileUrl;
    @Input() formDocsDTOs:any=[];
  ngOnInit() {}
  // Document add end
}
