export interface LegacyValidationResult {
  isValid: boolean;
  firstInvalidSectionId: string | null;
}

const INVALID_CLASS = 'legacy-invalid-field';

export function validateLegacyRequiredSections(sectionIds: string[]): LegacyValidationResult {
  let firstInvalidSectionId: string | null = null;
  let isValid = true;

  sectionIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const sectionValid = validateLegacyRequiredSection(section);
    if (!sectionValid) {
      isValid = false;
      if (!firstInvalidSectionId) {
        firstInvalidSectionId = sectionId;
      }
    }
  });

  return { isValid, firstInvalidSectionId };
}

export function validateLegacyRequiredSection(section: HTMLElement): boolean {
  clearLegacyInvalidFields(section);

  let isValid = true;
  const handledRadioGroups = new Set<string>();

  getRequiredControls(section).forEach((control) => {
    if (shouldSkipControl(control)) return;

    if (isRadio(control)) {
      const name = control.name;
      if (!name || handledRadioGroups.has(name)) return;
      handledRadioGroups.add(name);

      const group = Array.from(
        section.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${cssEscape(name)}"]`)
      );
      const checked = group.some((radio) => radio.checked);
      if (!checked) {
        isValid = false;
        markInvalid(getRadioWrapper(section, name) || control);
      }
      return;
    }

    if (!hasValue(control)) {
      isValid = false;
      markInvalid(control);
    }
  });

  return isValid;
}

export function clearLegacyInvalidFromEvent(event: Event): void {
  const target = event.target as HTMLElement | null;
  const invalidTarget = target?.closest?.(`.${INVALID_CLASS}`) as HTMLElement | null;
  if (invalidTarget) {
    unmarkInvalid(invalidTarget);
  }

  const host = target?.closest?.('ngx-select, ngx-select-ex') as HTMLElement | null;
  if (host) {
    unmarkInvalid(host);
  }
}

function getRequiredControls(section: HTMLElement): HTMLElement[] {
  const selector = [
    'input[required]',
    'select[required]',
    'textarea[required]',
    'ngx-select[required]',
    'ngx-select-ex[required]',
    '[data-required-field="true"]',
    '[data-required="true"]',
  ].join(',');

  return Array.from(section.querySelectorAll<HTMLElement>(selector));
}

function shouldSkipControl(control: HTMLElement): boolean {
  if (control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') {
    return true;
  }

  if (control instanceof HTMLInputElement) {
    if (control instanceof HTMLInputElement && control.type === 'hidden') {
      return true;
    }
    return control.disabled || control.readOnly;
  }

  if (control instanceof HTMLTextAreaElement) {
    return control.disabled || control.readOnly;
  }

  if (control instanceof HTMLSelectElement) {
    return control.disabled;
  }

  return control.classList.contains('disabled');
}

function hasValue(control: HTMLElement): boolean {
  if (control.classList.contains('ng-valid')) {
    return true;
  }
  if (control.classList.contains('ng-invalid')) {
    return false;
  }

  if (control instanceof HTMLInputElement) {
    if (control.type === 'checkbox') return control.checked;
    if (control.type === 'file') return !!control.files?.length || !!control.value;
    return control.value.trim() !== '';
  }

  if (control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
    return control.value.trim() !== '';
  }

  const innerInvalid = control.querySelector('.ng-invalid');
  if (innerInvalid) return false;

  const innerValid = control.querySelector('.ng-valid');
  if (innerValid) return true;

  const selectedText =
    control.querySelector('.ngx-select__selected')?.textContent ||
    control.querySelector('.ngx-select__selected-single')?.textContent ||
    control.querySelector('.ui-select-match-text')?.textContent ||
    '';

  return selectedText.trim() !== '';
}

function isRadio(control: HTMLElement): control is HTMLInputElement {
  return control instanceof HTMLInputElement && control.type === 'radio';
}

function getRadioWrapper(section: HTMLElement, radioName: string): HTMLElement | null {
  return section.querySelector<HTMLElement>(`[data-radio-wrapper="${cssEscape(radioName)}"]`);
}

function markInvalid(control: HTMLElement): void {
  control.classList.add(INVALID_CLASS);
  control.style.borderColor = 'red';
  if (isRadio(control)) {
    control.style.outline = '2px solid red';
  }
}

function unmarkInvalid(control: HTMLElement): void {
  control.classList.remove(INVALID_CLASS);
  control.style.borderColor = '';
  control.style.border = '';
  control.style.outline = '';
}

function clearLegacyInvalidFields(section: HTMLElement): void {
  section.querySelectorAll<HTMLElement>(`.${INVALID_CLASS}`).forEach(unmarkInvalid);
  section
    .querySelectorAll<HTMLElement>('input, select, textarea, ngx-select, ngx-select-ex, [data-radio-wrapper]')
    .forEach((el) => {
      el.style.borderColor = '';
      el.style.border = '';
      el.style.outline = '';
    });
}

function cssEscape(value: string): string {
  const cssApi = typeof window !== 'undefined' ? (window as any).CSS : undefined;
  if (cssApi?.escape) {
    return cssApi.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
