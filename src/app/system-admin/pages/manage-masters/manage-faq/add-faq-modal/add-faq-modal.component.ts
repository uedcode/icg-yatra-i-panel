import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/service/auth/auth.service';
import { Component, Input, OnInit, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FaqService } from 'src/app/service/admin/faq.service';

declare var $: any;

@Component({
    selector: 'app-add-faq-modal',
    templateUrl: './add-faq-modal.component.html',
    styleUrls: ['./add-faq-modal.component.scss'],
    standalone: false
})
export class AddFaqModalComponent implements OnInit {

  constructor(private $common: CommonService, private $faq: FaqService, private $auth: AuthService,) { }

  @ViewChild('recordForm', { static: true }) recordForm: NgForm;
  @Input() dataList: Array<any> = [];
  @Input() editRecord: any;
  @Output() setRecordData = new EventEmitter();

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();

    this.initializeEditor();
  }

  userIdDetails;
  disableBtn = false;
  recordObj: any = {};
  saveRecord() {
    try {
      this.$common.showLoader();
      this.disableBtn = true;
      this.$faq.createOrUpdate(this.recordObj).subscribe((response: any) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        if (response.status === true) {
          let object = response.object[0];
          this.$common.showMessage(`${response.message}`);
          if (!this.recordObj.faqId) {
            this.dataList.push(object);
          } else {
            var index = this.dataList.findIndex(elem => elem.faqId == this.recordObj.faqId)
            this.dataList[index] = object;
          }
          this.dataList = [...this.dataList];
          this.setRecordData.emit(this.dataList);
          $("#manage_faq").modal('hide');
          this.resetForm();
        }
      }, err => {
        this.$common.hideLoader();
        this.disableBtn = false;
        console.log(err);
      })
    } catch (error) {
      this.$common.hideLoader();
      this.disableBtn = false;
      console.log(error);
    }
  }

  resetForm() {
    this.recordObj = {};
    this.recordForm.resetForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.editRecord && changes.editRecord.currentValue) {
      this.recordObj = changes.editRecord.currentValue;
    }
  }

  

  editorConfig: AngularEditorConfig;
  initializeEditor() {
    this.editorConfig = {
      editable: true,
      spellcheck: true,
      height: '300px',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      fonts: [
        { class: 'arial', name: 'Arial' },
        { class: 'times-new-roman', name: 'Times New Roman' },
        { class: 'calibri', name: 'Calibri' },
        { class: 'comic-sans-ms', name: 'Comic Sans MS' }
      ],
      customClasses: [
        {
          name: 'quote',
          class: 'quote',
        },
        {
          name: 'redText',
          class: 'redText'
        },
        {
          name: 'titleText',
          class: 'titleText',
          tag: 'h1',
        },
      ],
      sanitize: true,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
        [
          //   'undo',
          //   'redo',
          //   'bold',
          //   'italic',
          //   'underline',
          //   'strikeThrough',
          //   'subscript',
          //   'superscript',
          //   'justifyLeft',
          //   'justifyCenter',
          //   'justifyRight',
          //   'justifyFull',
          //   'indent',
          //   'outdent',
          //   'insertUnorderedList',
          //   'insertOrderedList',
          //   'heading',
          //   'fontName'
        ],
        [
          //   'fontSize',
          //   'textColor',
          //  'backgroundColor',
          'customClasses',
          'link',
          'unlink',
          'insertImage',
          'insertVideo',
          //  'insertHorizontalRule',
          //   'removeFormat',
          //  'toggleEditorMode'
        ]
      ]
    };
  }

}

