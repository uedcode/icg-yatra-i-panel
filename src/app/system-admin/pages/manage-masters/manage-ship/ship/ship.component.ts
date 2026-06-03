import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/service/auth/auth.service';
import { MasterShipService } from 'src/app/service/master/master-ship.service';
declare var $: any;

@Component({
    selector: 'app-ship',
    templateUrl: './ship.component.html',
    styleUrls: ['./ship.component.css'],
    standalone: false
})
export class ShipComponent implements OnInit {
  constructor(
    private $common: CommonService,
    private $ship: MasterShipService,
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

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
        },
      };
      
      this.$ship.get(this.config).subscribe(
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
    $('#addship').modal('show');
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
      this.$ship.delete(config).subscribe(
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
