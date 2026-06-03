import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { DocumentService } from 'src/app/service/form/document.service';
import { MappingService } from 'src/app/service/admin/mapping.service';
declare var $: any;
@Component({
    selector: 'app-mapping-unit',
    templateUrl: './mapping-unit.component.html',
    styleUrls: ['./mapping-unit.component.scss'],
    standalone: false
})
export class MappingUnitComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $mapping: MappingService,
    private datePipe: DatePipe,
    private location: Location
  ) {}

  @Input() dataList: Array<any> = [];

  id: any;
  dataObj: any = {};
  noOfPage: any = 10;
  pageType: any;
  p = 1;
  searchObj;
  fileUrl = environment.fileUrl;

  ngOnInit() {
    this.getAll();
  }

  config: any;
  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      this.$mapping.get(this.config).subscribe(
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
  editRecord(category) {
    $('#unitMapping').modal('show');
    this.dataObj = { ...category };
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
      this.$mapping.delete(config).subscribe((response: any) => {
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

  // back button start
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
  // back button end

  updateDataList(dataList) {
    this.dataList = dataList;
    this.getAll();
  }
  
}
