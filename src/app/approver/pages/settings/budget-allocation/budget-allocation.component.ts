import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimBudgetApiService } from 'src/app/service/api/claim/claim-budget-api.service';
import { CodeDirApiService } from 'src/app/service/api/code/code-dir-api.service';

@Component({
  selector: 'app-budget-allocation',
  templateUrl: './budget-allocation.component.html',
  styleUrls: ['./budget-allocation.component.scss'],
  standalone: false,
})
export class BudgetAllocationComponent implements OnInit {
  userIdDetails: any;
  dataList: any[] = [];
  directorates: any[] = [];
  budgets: any[] = [];
  currYearBudgets: any[] = [];
  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  key = 'updatedOn';
  reverse = false;

  formObj: any = {
    financialYear: '',
    typeOfAllotment: 'Initial',
    amountAllocated: null,
    presentAllocation: null,
    videLetterNo: '',
    remark: '',
    occDate: '',
    codeDirectorateDTO: { directorateId: '' },
  };
  isUpdate = false;
  updateId: any = null;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $claimBudgetApi: ClaimBudgetApiService,
    private $codeDirApi: CodeDirApiService,
    private $common: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    if (this.userIdDetails?.roleTypeId !== this.$auth.codeRoleType()?.verifier) {
      this.$common.showMessage('Budget Allocation is available for verifier role only.', 'danger');
      this.router.navigateByUrl(this.$auth.getPostLoginLandingUrl());
      return;
    }
    this.formObj.financialYear = this.userIdDetails?.financialYear || '';
    this.loadDirectorates();
    this.getBudgets();
    this.loadRemainingBudget();
  }

  getBudgets(): void {
    const config = {
      headers: {
        directorateId: this.formObj?.codeDirectorateDTO?.directorateId || '',
        unitId: this.userIdDetails?.unitId || '',
        gxUnitId: this.userIdDetails?.unitId || '',
        financialYear: this.formObj?.financialYear || '',
      },
    };
    this.$claimBudgetApi.getAll(config).subscribe((res: any) => {
      this.dataList = Array.isArray(res?.object) ? res.object : [];
    });
  }

  loadRemainingBudget(): void {
    const config = {
      headers: {
        directorateId: this.formObj?.codeDirectorateDTO?.directorateId || '',
        financialYear: this.formObj?.financialYear || '',
        unitId: this.userIdDetails?.unitId || '',
      },
    };
    this.$claimBudgetApi.getRemaining(config).subscribe((res: any) => {
      this.budgets = Array.isArray(res?.object) ? res.object : [];
      if (this.budgets.length && !this.budgets[0]?.balancePostBudgeted) {
        this.budgets[0].balancePostBudgeted = this.budgets[0]?.cumulativeAllotment;
      }
      this.currYearBudgets = this.budgets.filter(
        (elem: any) => elem?.financialYear == this.formObj?.financialYear
      );
      this.updatePresentAllocation();
      this.ensureAllotmentTypeAllowed();
    });
  }

  onDirectorateOrYearChange(): void {
    this.loadRemainingBudget();
    this.getBudgets();
  }

  onAllotmentTypeChange(): void {
    this.updatePresentAllocation();
  }

  onAmountChange(): void {
    this.updatePresentAllocation();
  }

  private ensureAllotmentTypeAllowed(): void {
    if (this.isUpdate) {
      return;
    }
    if (!this.currYearBudgets.length) {
      this.formObj.typeOfAllotment = 'Initial';
      return;
    }
    if (this.formObj.typeOfAllotment === 'Initial') {
      this.formObj.typeOfAllotment = 'Increase';
    }
  }

  private updatePresentAllocation(): void {
    const amount = Number(this.formObj?.amountAllocated || 0);
    const hasAmount = !!this.formObj?.amountAllocated;
    const base = Number(this.budgets?.[0]?.balancePostBudgeted || 0);
    if (!hasAmount) {
      this.formObj.presentAllocation = null;
      return;
    }
    if (!this.currYearBudgets.length) {
      this.formObj.presentAllocation = amount;
      return;
    }
    if (this.formObj?.typeOfAllotment === 'Decrease') {
      this.formObj.presentAllocation = base - amount;
      return;
    }
    this.formObj.presentAllocation = base + amount;
  }

  loadDirectorates(): void {
    this.$codeDirApi.getAll().subscribe((res: any) => {
      this.directorates = Array.isArray(res?.object) ? res.object : [];
    });
  }

  saveBudget(): void {
    if (!this.formObj?.financialYear) {
      this.$common.showMessage('Financial year is required.', 'danger');
      return;
    }
    if (!this.formObj?.typeOfAllotment) {
      this.$common.showMessage('Type of allotment is required.', 'danger');
      return;
    }
    if (!this.formObj?.amountAllocated || Number(this.formObj?.amountAllocated) <= 0) {
      this.$common.showMessage('Amount allocation must be greater than zero.', 'danger');
      return;
    }
    if (!this.formObj?.videLetterNo) {
      this.$common.showMessage('Vide letter number is required.', 'danger');
      return;
    }
    if (!this.formObj?.occDate) {
      this.$common.showMessage('Letter date is required.', 'danger');
      return;
    }
    if (
      this.formObj?.typeOfAllotment === 'Decrease' &&
      Number(this.formObj?.presentAllocation || 0) < 0
    ) {
      this.$common.showMessage('Present allocation cannot be negative for decrease allotment.', 'danger');
      return;
    }

    const payload: any = {
      ...this.formObj,
      claimBudgetId: this.updateId || this.formObj?.claimBudgetId || this.formObj?.id,
      cumulativeAllotment:
        this.formObj?.typeOfAllotment === 'Initial'
          ? this.formObj?.amountAllocated
          : this.formObj?.cumulativeAllotment,
      codeUnitDTO: {
        unit: this.userIdDetails?.unitId || '',
      },
      codeDirectorateDTO: {
        directorateId: this.formObj?.codeDirectorateDTO?.directorateId || '',
      },
    };

    this.$claimBudgetApi.createOrUpdate(payload).subscribe({
      next: (res: any) => {
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Budget allocation save failed.', 'danger');
          return;
        }
        this.$common.showMessage(res?.message || 'Budget allocation saved.', 'success');
        this.resetForm(false);
        this.getBudgets();
        this.loadRemainingBudget();
      },
      error: () => {
        this.$common.showMessage('Something went wrong while saving budget allocation.', 'danger');
      },
    });
  }

  editBudget(data: any): void {
    this.isUpdate = true;
    this.updateId = data?.claimBudgetId || data?.id;
    this.formObj = {
      ...data,
      codeDirectorateDTO: {
        directorateId: data?.codeDirectorateDTO?.directorateId || '',
      },
    };
    this.updatePresentAllocation();
  }

  deleteBudget(data: any): void {
    const claimBudgetId = data?.claimBudgetId || data?.id;
    if (!claimBudgetId) {
      return;
    }
    const config = {
      headers: {
        ids: [String(claimBudgetId)],
      },
    };
    this.$claimBudgetApi.delete(config).subscribe({
      next: (res: any) => {
        if (!res?.status) {
          this.$common.showMessage(res?.message || 'Delete failed.', 'danger');
          return;
        }
        this.$common.showMessage(res?.message || 'Budget allocation deleted.', 'success');
        this.dataList = this.dataList.filter(
          (item: any) => (item?.claimBudgetId || item?.id) != claimBudgetId
        );
        this.loadRemainingBudget();
      },
      error: () => {
        this.$common.showMessage('Something went wrong while deleting budget allocation.', 'danger');
      },
    });
  }

  resetForm(resetYear = true): void {
    this.isUpdate = false;
    this.updateId = null;
    this.formObj = {
      financialYear: resetYear ? this.userIdDetails?.financialYear || '' : this.formObj?.financialYear || '',
      typeOfAllotment: 'Initial',
      amountAllocated: null,
      presentAllocation: null,
      videLetterNo: '',
      remark: '',
      occDate: '',
      codeDirectorateDTO: { directorateId: '' },
    };
    this.loadRemainingBudget();
  }

  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }
}


