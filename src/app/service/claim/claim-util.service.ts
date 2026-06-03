import { Injectable } from '@angular/core';
import { UtilService } from 'src/app/service/core/util.service';

@Injectable({
  providedIn: 'root',
})
export class ClaimUtilService {
  constructor(private util: UtilService) {}

  // =========================================================
  // TY DUTY AMOUNT CALCULATION (shared logic for TY-ADV screens)
  // =========================================================

  /**
   * Calculate full TY-Duty advance amount, DTS split, total budgeted amount.
   *
   * @param claims  complete claims object (must have yatTempDutyAdvDTOs[0] and yatDtsDetailDTOs)
   * @param options.type        claim type code, e.g. 'TYA'
   * @param options.tyAdvCode   TY-ADV code (usually 'TYA')
   * @param options.isTotalAccHToDutyChanged flag used when totalAccHToDuty edited manually
   */
  calculateTyDutyAmount(
    claims: any,
    options: {
      type: string;
      tyAdvCode: string;
      isTotalAccHToDutyChanged?: boolean;
    }
  ): { isGSTAvailed: boolean } {
    const { type, tyAdvCode, isTotalAccHToDutyChanged } = options;

    if (type !== tyAdvCode) {
      return { isGSTAvailed: false };
    }

    if (!claims || !Array.isArray(claims.yatTempDutyAdvDTOs)) {
      return { isGSTAvailed: false };
    }

    const adv = claims.yatTempDutyAdvDTOs[0];
    if (!adv) {
      return { isGSTAvailed: false };
    }

    let calTyAmt = 0;

    // ARR fare
    if (!this.util.isNullOrEmpty(adv.arrFare)) {
      calTyAmt += this.util.toNumber(adv.arrFare);
    }

    // ========= FOOD CHARGE =========
    if (adv.isAvailFoodCharge === true) {
      if (
        !this.util.isNullOrEmpty(adv.foodChargeDays) &&
        !this.util.isNullOrEmpty(adv.foodChargeRatePerDay)
      ) {
        adv.totalFoodCharge =
          this.util.toNumber(adv.foodChargeDays) *
          this.util.toNumber(adv.foodChargeRatePerDay);

        if (!this.util.isNullOrEmpty(adv.foodChargePerc)) {
          const percentageAmount =
            (this.util.toNumber(adv.totalFoodCharge) *
              this.util.toNumber(adv.foodChargePerc)) /
            100;
          adv.totalFoodCharge =
            this.util.toNumber(adv.totalFoodCharge) + percentageAmount;
          adv.totalFoodCharge = Math.round(adv.totalFoodCharge);
        }

        calTyAmt += this.util.toNumber(adv.totalFoodCharge);
      } else {
        adv.totalFoodCharge = 0;
      }
    } else {
      adv.totalFoodCharge = 0;
    }

    // ========= HOTEL ACCOMMODATION =========
    if (adv.isAvailHotelAcc === true) {
      if (
        !this.util.isNullOrEmpty(adv.hotelAccDays) &&
        !this.util.isNullOrEmpty(adv.hotelAccRatePerDay)
      ) {
        adv.totalHotelAcc =
          this.util.toNumber(adv.hotelAccDays) *
          this.util.toNumber(adv.hotelAccRatePerDay);

        if (!this.util.isNullOrEmpty(adv.hotelChargePerc)) {
          const percentageAmount =
            (this.util.toNumber(adv.totalHotelAcc) *
              this.util.toNumber(adv.hotelChargePerc)) /
            100;
          adv.totalHotelAcc =
            this.util.toNumber(adv.totalHotelAcc) + percentageAmount;
          adv.totalHotelAcc = Math.round(adv.totalHotelAcc);
        }

        calTyAmt += this.util.toNumber(adv.totalHotelAcc);
      } else {
        adv.totalHotelAcc = 0;
      }
    } else {
      adv.totalHotelAcc = 0;
    }

    // ========= ARR TO DUTY =========
    if (adv.isAvailArr === true) {
      if (
        !this.util.isNullOrEmpty(adv.arrToDutyRate) &&
        !this.util.isNullOrEmpty(adv.arrToDutyKm)
      ) {
        adv.arrToDutyRs =
          this.util.toNumber(adv.arrToDutyRate) *
          this.util.toNumber(adv.arrToDutyKm);

        calTyAmt += this.util.toNumber(adv.arrToDutyRs);
      } else {
        adv.arrToDutyRs = 0;
      }
    } else {
      adv.arrToDutyRs = 0;
    }

    // ========= HOME ↔ DUTY (within city) =========
    if (adv.isAvailAcc === true) {
      if (
        !this.util.isNullOrEmpty(adv.accHToDutyPerDay) &&
        !this.util.isNullOrEmpty(adv.accHToDutyDays)
      ) {
        if (adv.availedCategory === 1 || adv.availedCategory === 2) {
          if (!this.util.isNullOrEmpty(adv.accHToDutyKms)) {
            adv.totalAccHToDuty =
              this.util.toNumber(adv.accHToDutyPerDay) *
              this.util.toNumber(adv.accHToDutyDays) *
              this.util.toNumber(adv.accHToDutyKms);
          }
        } else {
          adv.totalAccHToDuty =
            this.util.toNumber(adv.accHToDutyPerDay) *
            this.util.toNumber(adv.accHToDutyDays);
        }

        calTyAmt += this.util.toNumber(adv.totalAccHToDuty);
      } else {
        if (isTotalAccHToDutyChanged) {
          adv.accHToDutyPerDay = null;
          adv.accHToDutyDays = null;
          if (!this.util.isNullOrEmpty(adv.totalAccHToDuty)) {
            calTyAmt += this.util.toNumber(adv.totalAccHToDuty);
          } else {
            adv.totalAccHToDuty = 0;
          }
        } else {
          adv.totalAccHToDuty = 0;
        }
      }
    } else {
      adv.totalAccHToDuty = 0;
    }

    // ========= FINAL TOTAL =========
    adv.totalAmt = this.util.isNullOrEmpty(calTyAmt) ? 0 : calTyAmt;

    // ========= DTS / NON-DTS SPLIT =========
    const rows = Array.isArray(claims.yatDtsDetailDTOs)
      ? claims.yatDtsDetailDTOs
      : [];

    const dtsAmountObj = rows.filter(
      (e: any) => e.isDts !== 'NA' && e.isDts !== 'No'
    );
    let dtsAmount = this.util.sumOfColumn(dtsAmountObj, 'tempAmount');
    if (dtsAmount === 0) {
      dtsAmount = this.util.sumOfColumn(dtsAmountObj, 'amount');
    }

    const nonDtsAmountObj = rows.filter(
      (e: any) => e.isDts === 'NA' || e.isDts === 'No'
    );
    let nonDtsAmount = this.util.sumOfColumn(nonDtsAmountObj, 'tempAmount');
    if (nonDtsAmount === 0) {
      nonDtsAmount = this.util.sumOfColumn(nonDtsAmountObj, 'amount');
    }

    adv.dtsAmount = dtsAmount;
    adv.totalAmt = this.util.toNumber(adv.totalAmt) + nonDtsAmount;

    // ========= ADVANCE (100% for TY) =========
    this.calculateTyDutyAdvance(adv);

    if (!this.util.isNullOrEmpty(adv.advAmt)) {
      adv.totalBudgetedAmt = this.util.toNumber(adv.advAmt) + dtsAmount;
    } else {
      adv.advAmt = 0;
      adv.totalBudgetedAmt = this.util.toNumber(adv.advAmt) + dtsAmount;
    }

    // ========= GST AVAILED FLAG =========
    const isGSTAvailed =
      this.util.toNumber(adv.foodChargePerc) > 0 ||
      this.util.toNumber(adv.hotelChargePerc) > 0;

    return { isGSTAvailed };
  }

  /**
   * 100% of totalAmt for TY Advance.
   */
  private calculateTyDutyAdvance(adv: any): void {
    if (this.util.isNullOrEmpty(adv.totalAmt)) {
      adv.advAmt = 0;
      return;
    }
    adv.advAmt = this.util.toNumber(adv.totalAmt);
    adv.advAmt = this.util.toNumber(adv.advAmt);
    adv.advAmt = Math.round(adv.advAmt);
  }

  // =========================================================
  // TRAVEL GRID HELPERS (reusable for TY/PMT/FTE/LTC)
  // =========================================================

  /**
   * Handle travel row modeOfTravel / isDts toggles.
   * Returns updated flags for the component to apply.
   */
  validateTravelRow(
    detail: any,
    fieldName: 'modeOfTravel' | 'isDts'
  ): { otherMode: boolean; boolIsDts: boolean } {
    let otherMode = false;
    let boolIsDts = false;

    if (fieldName === 'modeOfTravel') {
      if (detail.modeOfTravel === 'Others') {
        otherMode = true;
      } else {
        otherMode = false;
        detail.otherModeOfTravel = undefined;
      }
    }

    if (fieldName === 'isDts') {
      if (detail.isDts === 'Yes') {
        boolIsDts = true;
      } else {
        boolIsDts = false;
      }
    }

    return { otherMode, boolIsDts };
  }

  /**
   * Add or update a travel detail row in claims.yatDtsDetailDTOs.
   */
  upsertTravelRow(params: {
    rows: any[];
    detail: any;
    selectedIndex: number | null;
  }): { newRows: any[]; selectedIndex: number | null; btnName: string } {
    const { rows, detail, selectedIndex } = params;

    const clonedRows = Array.isArray(rows) ? [...rows] : [];
    const rowDetail = { ...detail };

    if (this.util.isNullOrEmpty(rowDetail.tempAmount)) {
      rowDetail.tempAmount = this.util.toNumber(rowDetail.amount);
    }

    if (
      selectedIndex !== null &&
      selectedIndex >= 0 &&
      selectedIndex < clonedRows.length
    ) {
      clonedRows[selectedIndex] = rowDetail;
    } else {
      clonedRows.push(rowDetail);
    }

    return {
      newRows: clonedRows,
      selectedIndex: null,
      btnName: 'Add',
    };
  }

  /**
   * Prepare row for editing.
   */
  prepareTravelEdit(
    rows: any[],
    index: number
  ): {
    detail: any | {};
    selectedIndex: number | null;
    btnName: string;
  } {
    if (!Array.isArray(rows) || index < 0 || index >= rows.length) {
      return { detail: {}, selectedIndex: null, btnName: 'Add' };
    }

    const row = rows[index];
    return {
      detail: { ...row },
      selectedIndex: index,
      btnName: 'Update',
    };
  }

  /**
   * Delete a row at index. Returns new rows array.
   */
  deleteTravelRow(rows: any[], index: number): any[] {
    if (!Array.isArray(rows) || index < 0 || index >= rows.length) {
      return rows;
    }
    const copy = [...rows];
    copy.splice(index, 1);
    return copy;
  }
}

