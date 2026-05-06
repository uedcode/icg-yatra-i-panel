import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { DocumentService } from 'src/app/service/document.service';
import { AuthService } from 'src/app/service/auth.service';
declare var $: any;

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss'],
    standalone: false
})
export class DocumentsComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $document: DocumentService,
    public $auth: AuthService
  ) {}

  @Input() dataList: Array<any> = [];

  id: any;
  dataObj: any = {};
  noOfPage: any = 10;
  p = 1;
  searchObj;
  userIdDetails;
  fileUrl = environment.fileUrl;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.getAll();
  }

  config: any;
  visibilityIndicatorList: any = [
    {
      "descr": "No",
      "id": "0",
    },
    {
      "descr": "Yes",
      "id":"1",
    }
  ];
  getVisibilityDescription(id: string): string {
    const item = this.visibilityIndicatorList.find((indicator: any) => indicator.id === id);
    return item ? item.descr : '-'; // return the description if found, or a hyphen if not
  }
  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          codeFormId: this.userIdDetails?.moduleId
        },
      };
      
      this.$document.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;
            this.dataList = list;
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  // edit start
  editRecord(obj) {
    
    $('#adddocuments').modal('show');
    this.dataObj = { ...obj };
  }
  // edit end

  // delete start
  deleteList(id) {
    try {
      this.$common.showLoader();
      var config = {
        headers: {
          ids: id,
        },
      };
      this.$document.delete(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(response.message);
            this.dataList = this.dataList.filter(
              (elem) => elem.id != id
            );
            $('#delete_modal').modal('hide');
          }
        },
        (error) => {
          this.$common.hideLoader();
          console.log(error);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
  // delete end

  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end
}
