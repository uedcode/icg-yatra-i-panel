import { NgModule } from '@angular/core';
import { DecimalNumberDirective } from './directive/decimal-number.directive';
import { FourDecimalDirective } from './directive/four-decimal.directive';
import { MaxValueDirective } from './directive/max-value.directive';
import { MinValueDirective } from './directive/min-value.directive';
import { NotSpecialCharecterDirective } from './directive/not-special-charecter.directive';
import { NumberOnlyDirective } from './directive/number-only.directive';
import { ScrollToTopDirective } from './directive/scroll-to-top.directive';
import { ShowHidePasswordDirective } from './directive/show-hide-password.directive';
import { NegativeDecimalDirective } from './directive/two-decimal-negative.directive';
import { TwoDecimalDirective } from './directive/two-decimal.directive';
import { UsernameDirective } from './directive/username.directive';
import { PersonalNumberValidationDirective } from './directive/personal-number-validation.directive';
import { NoEmojiDirective } from './directive/NoEmojiDirective.directive';

@NgModule({
    imports: [],
    declarations: [
        NumberOnlyDirective,
        NotSpecialCharecterDirective,
        UsernameDirective,
        TwoDecimalDirective,
        FourDecimalDirective,
        NegativeDecimalDirective,
        ScrollToTopDirective,
        MaxValueDirective,
        MinValueDirective,
        DecimalNumberDirective,
        ShowHidePasswordDirective,
        PersonalNumberValidationDirective,
        NoEmojiDirective
    ],
    exports: [
        NumberOnlyDirective,
        NotSpecialCharecterDirective,
        UsernameDirective,
        TwoDecimalDirective,
        FourDecimalDirective,
        NegativeDecimalDirective,
        ScrollToTopDirective,
        MaxValueDirective,
        MinValueDirective,
        DecimalNumberDirective,
        ShowHidePasswordDirective,
        PersonalNumberValidationDirective,
        NoEmojiDirective
    ]
})
export class DirectiveModule { }