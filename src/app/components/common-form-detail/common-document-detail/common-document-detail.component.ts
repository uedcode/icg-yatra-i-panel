import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
import { CommonService } from 'src/app/service/core/common.service';
import { FormManageService } from 'src/app/service/form/form-manage.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-document-detail',
    templateUrl: './common-document-detail.component.html',
    styleUrls: ['./common-document-detail.component.css'],
    standalone: false
})
export class CommonDocumentDetailComponent implements OnInit {
  constructor(
    private $common: CommonService,
    public $auth: AuthService,
    public $formManage: FormManageService,
    public $codeDocInfo: CodeDocInfoService
  ) {}

  fileUrl = environment.fileUrl;
    @Input() formDocsDTOs:any=[];
  ngOnInit() {}
  // Document add end
}
