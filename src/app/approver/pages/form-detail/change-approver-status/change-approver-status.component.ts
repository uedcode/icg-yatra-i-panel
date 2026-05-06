import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { AuthService } from 'src/app/service/auth.service';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PilotageHistoryService } from 'src/app/service/pilotage-history.service';
declare var $: any;

@Component({
    selector: 'app-change-approver-status',
    templateUrl: './change-approver-status.component.html',
    styleUrls: ['./change-approver-status.component.css'],
    standalone: false
})
export class ChangeApproverStatusComponent implements OnInit {

  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    private $pilotageService: PilotageHistoryService,
    private route: ActivatedRoute,

  ) { }

  @Input() changeStatusObj;
  @Output() removeIndex = new EventEmitter();
  @ViewChild('requestForm', { static: true }) requestForm: NgForm;
  userIdDetails: any;
  codeRoleList: any;
  codeStatus: any;
  formObj: any = {};
  config;
  state;
  statusId;
  ngOnInit() {
    this.codeStatus = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();
    this.route.queryParams.subscribe((params) => {
      this.statusId = params?.statusId;
    });
  }
  changeStatusWithApprover() {
    try {
      
      let tempState = "";
      if (this.changeStatusObj?.requestType === "Approve") {
        tempState = this.codeStatus?.approved || "approved";
      } else if (this.changeStatusObj?.requestType === "Reject") {
        tempState = this.codeStatus?.rejected || "rejected";
      } else {
        throw new Error("Invalid requestType in changeStatusObj.");
      }
      let remarks = this.formObj?.remarks;
      this.config = {
        headers: {
          "id": this.changeStatusObj?.statusId,
          "remark": remarks,
          "statusId": tempState,
        }
      }
      
      this.$pilotageService.changeStatusById(this.config).subscribe(
        (response) => {
          if (response.status === true) {
            $("#change_status_approver_modal").modal("hide");
            this.$common.showMessage(`${response.message}`);
            this.removeIndex.emit(this.changeStatusObj?.statusId);
            location.reload();
          } else {
            throw new Error(response.message || "Unknown error occurred.");
          }
        },
        (err) => {
          console.error("API Error:", err);
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      console.error("Error in changeStatusWithApprover:", error);
      this.$common.hideLoader();
    }
  }
}
