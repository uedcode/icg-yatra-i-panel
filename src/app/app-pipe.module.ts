import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { CodeStatusPipe } from './pipe/code-status.pipe';
import { FilterPipe } from './pipe/filter.pipe';
import { FilterComplexPipe } from './pipe/filterComplex.pipe';
import { ShowHypenPipe } from './pipe/show-hypen.pipe';
import { ShowNamePipe } from './pipe/show-name.pipe';
import { ShowZeroPipe } from './pipe/show-zero.pipe';
import { SingleStringPipe } from './pipe/single-string.pipe';
import { TransTypePipe } from './pipe/trans-type.pipe';
import { ValidateEmailDirective } from './pipe/validate-email.directive';
import { YesNoPipe } from './pipe/yes-no.pipe';
import { DateHypenPipe } from './pipe/date-hypen';
import { ShowDatePipe } from './pipe/show-date.pipe';
import { CodeCadrePipe } from './pipe/codeCadre.pipe';
import { CodeMappingTypePipe } from './pipe/codeMappingType.pipe';
import { NumToWordPipe } from './pipe/num-to-word.pipe.pipe';
import { LegacyDatePipe } from './pipe/legacy-date.pipe';
import { LegacyHyphenPipe } from './pipe/legacy-hyphen.pipe';
import { LegacyNilPipe } from './pipe/legacy-nil.pipe';
import { LegacyValuePipe } from './pipe/legacy-value.pipe';
import { LegacyZeroPipe } from './pipe/legacy-zero.pipe';

@NgModule({
    imports: [],
    declarations: [
        FilterPipe,
        FilterComplexPipe,
        ShowNamePipe,
        ShowHypenPipe,
        ShowZeroPipe,
        CodeStatusPipe,
        TransTypePipe,
        SingleStringPipe,
        ValidateEmailDirective,
        YesNoPipe,
        DateHypenPipe,
        ShowDatePipe,
        CodeCadrePipe,
        CodeMappingTypePipe,
        NumToWordPipe,
        LegacyValuePipe,
        LegacyDatePipe,
        LegacyNilPipe,
        LegacyHyphenPipe,
        LegacyZeroPipe,
    ],
    exports: [
        FilterPipe,
        FilterComplexPipe,
        ShowNamePipe,
        ShowHypenPipe,
        ShowZeroPipe,
        CodeStatusPipe,
        CodeCadrePipe,
        CodeMappingTypePipe,
        TransTypePipe,
        SingleStringPipe,
        ValidateEmailDirective,
        YesNoPipe,
        DateHypenPipe,
        ShowDatePipe,
        NumToWordPipe,
        LegacyValuePipe,
        LegacyDatePipe,
        LegacyNilPipe,
        LegacyHyphenPipe,
        LegacyZeroPipe,
    ]
})
export class PipeModule { }
