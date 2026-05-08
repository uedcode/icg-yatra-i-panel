import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
declare var $: any;

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    constructor(private spinner: NgxSpinnerService, private datePipe: DatePipe, private route: ActivatedRoute,
        private http: HttpClient) { }

    settimeout: any;
    fileUrl = environment.fileUrl;

    showMessage(message: string, type?: string) {
        let snackbar = document.getElementById("snackbar_module");
        let snack_msg = document.getElementById("snack_msg");
        snackbar.style.display = "block";
        snackbar.style.animation = "fadeIn 5000s linear";
        snackbar.style.background = "rgb(88 104 255)";
        snackbar.style.textTransform = "capitalize";
        if (type == "danger") {
            snackbar.style.background = "#ef4848";
        }
        snack_msg.innerText = message;
        this.removeToast(snackbar);
    }
    cleartimeout() {
        clearTimeout(this.settimeout);
    }
    removeToast(snackbar = null) {
        if (!snackbar) {
            snackbar = document.getElementById("snackbar_module");
        }
        this.settimeout = setTimeout(() => {
            snackbar.style.animation = "fadeOut 5000s linear";
            setTimeout(() => {
                snackbar.style.display = "none";
            }, 300);
        }, 3500);
    }
    parseResponse(response) {
        if (response.status === false) {
            this.showMessage(`${response.message}`, 'danger');
        }
    }
    showLoader() {
        this.spinner.show();
    }
    hideLoader() {
        this.spinner.hide();
    }
    getParam(param) {
        let value = this.route.snapshot.paramMap.get(param)
        return value;
    }
    getCurrentTimeStamp() {
        return this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss');
    }
    updateMaxDate(fromDate) {
        let toDate = new Date(fromDate)
        toDate.setDate(toDate.getDate() + 90);
        return this.datePipe.transform(toDate, "yyyy-MM-dd");
    }
    setDate(date, time = 0) {
        if (time == 1) {
            date = date + (60000 * 60 * 6);
        }
        let changeDate = new Date(date)
        return this.datePipe.transform(changeDate, "yyyy-MM-dd");
    }
    prevDate(date, days = 1) {
        date = date - (86400000 * days);
        let changeDate = new Date(date);
        return this.datePipe.transform(changeDate, "yyyy-MM-dd");
    }
    nextDate(date, days = 1) {
        date = date + (86400000 * days);
        let changeDate = new Date(date);
        return this.datePipe.transform(changeDate, "yyyy-MM-dd");
    }
    checkForValidImg(event) {
        let isValidExtension = true;
        if (!event.currentTarget.files || event.currentTarget.files.length == 0) {
            return isValidExtension;
        }
        let file = event.currentTarget.files[0];
        var filePath = file.name;
        var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        if (!allowedExtensions.exec(filePath)) {
            isValidExtension = false;
        }

        if (!isValidExtension) {
            this.showMessage("Please select valid image", "danger");
            $(event.currentTarget).val("");
        }
        return isValidExtension;
    }

    getStatusList() {
        return [
            {
                "statusId": "AC",
                "descr": "Enabled"
            },
            {
                "statusId": "DA",
                "descr": "Disabled"
            }
        ]
    }

    statusList: any[];
    getReportTypeDropdown() {
        return this.statusList =
            [
                {
                    "id": "MS",
                    "descr": "Most Selling"
                },
                {
                    "id": "LS",
                    "descr": "Least Selling"
                },
                {
                    "id": "PP",
                    "descr": "Product Profit"
                },
                {
                    "id": "PL",
                    "descr": "Product Loss"
                }
            ]
    }

    uploadImages(file) {
        let form_data = new FormData();
        form_data.append(`FormSupportGetFileUrlDTO`, "{}");
        form_data.append(`docFile`, file);

        return this.http.post("formSupportDocUrl/saveFileUrl", form_data);
    }

    deleteImages(fileUrl) {
        return this.http.get("formSupportDocUrl/deleteByUrl", fileUrl);
    }

    downloadFile(fileUrl) {
        return this.http.get(fileUrl, { responseType: 'arraybuffer' });
    }

    checkForValidFile(event, isPdf = false, isBoth = true) {
        
        let isValidExtension = true;
        if (!event.currentTarget.files || event.currentTarget.files.length == 0) {
            return isValidExtension;
        }
        let file = event.currentTarget.files[0];
        var filePath = file.name;
    
        let allowedFileSize = 20480; // Set default allowed file size to 20 MB
        let sizeLbl = "20 MB";
        var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    
        if (isPdf) {
            allowedFileSize = 20480; // 20 MB for PDFs
            sizeLbl = "20 MB";
            allowedExtensions = /(\.pdf)$/i;
        }
        if (isBoth) {
            allowedExtensions = /(\.jpg|\.jpeg|\.png|\.pdf)$/i;
            allowedFileSize = 20480; // 20 MB for combined files
            sizeLbl = "20 MB";
        }
    
        if (!allowedExtensions.exec(filePath)) {
            isValidExtension = false;
        }
    
        var fileSize = file.size / 1024; // Convert file size to KB
        if (fileSize > allowedFileSize) {
            return this.showMessage(`File cannot be greater than ${sizeLbl}`, "danger");
        }
    
        if (!isValidExtension) {
            this.showMessage("Please select valid file", "danger");
            $(event.currentTarget).val("");
        }
        return isValidExtension;
    }    

    shortingData(list) {
        return list.sort(function (a, b) {
            if (a.descr < b.descr) {
                return -1;
            }
            if (a.descr > b.descr) {
                return 1;
            }
            return 0;
        });
    }

    getRandomNumber() {
        const min = 1;
        const max = 100;
        const rand = min + Math.random() * (max - min);
        return rand;
    }

    async getClientIp() {
        await this.http.get(environment.ipChecker).toPromise();
    }


    // month year date start
    longToMonthYear(text) {
        const newDate = new Date(text);
        let year = newDate.getFullYear();
        let month = newDate.getMonth();
        let monthString = "";
        if (month === 0) monthString = "January";
        else if (month === 1) monthString = "February";
        else if (month === 2) monthString = "March";
        else if (month === 3) monthString = "April";
        else if (month === 4) monthString = "May";
        else if (month === 5) monthString = "June";
        else if (month === 6) monthString = "July";
        else if (month === 7) monthString = "August";
        else if (month === 8) monthString = "September";
        else if (month === 9) monthString = "October";
        else if (month === 10) monthString = "November";
        else if (month === 11) monthString = "December";
        return monthString + ' ' + year;
        // return monthYearMoment = moment(newDate).format('MM-YYYY');
    }
    // month year date end

    currentDate() {
        let today = new Date()
        return this.datePipe.transform(today, "yyyy-MM-dd");
    }
// download pdf start
getFileNameFromUrl(url: string): string {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    return fileName;
  }

  download(url) {
   
      
      url=`${this.fileUrl}${url}`
    fetch(url).then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;

        let fileName = this.getFileNameFromUrl(url);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      });


  }
// download pdf end

  downloadAbsolute(url: string, fileName?: string) {
    if (!url) {
      this.showMessage('Download URL is not available.', 'danger');
      return;
    }

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || this.getFileNameFromUrl(url);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      });
  }
}
