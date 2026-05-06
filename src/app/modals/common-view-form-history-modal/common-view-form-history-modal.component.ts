import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { FormStateService } from 'src/app/service/formState.service';

declare var $: any;

@Component({
  selector: 'app-common-view-form-history-modal',
  templateUrl: './common-view-form-history-modal.component.html',
  styleUrls: ['./common-view-form-history-modal.component.css'],
  standalone: false
})
export class CommonViewFormHistoryModalComponent implements OnInit {

   constructor(
    private $common: CommonService,
    private $formState: FormStateService
  ) { }

  @Input() stateList: Array<any> = [];
  @Input() formId: any;
  id: any;
  dataObj: any = {};
  noOfPage: any = 10;
  pageType: any;
  p = 1;
  searchObj;
  fileUrl = environment.fileUrl;
  page = 1;
  currentPageBulk = 1;
  ngOnInit() {
    $('#selected_files').on('hidden.bs.modal', () => {
      this.currentPageBulk = 1;
    });
    this.getAll();
  }
  config: any;
  getAll() {

    try {
      this.$common.showLoader();
      this.config = {
        headers: { formId: this.formId },
      };
      this.$formState.getHistory(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.stateList = response.object;
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

  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

   ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;

    if (changes.formId && changes.formId.currentValue) {
     this.getAll();
    }
  }
  // data shorting end
}
