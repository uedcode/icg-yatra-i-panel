import {
  clearLegacyInvalidFromEvent,
  validateLegacyRequiredSection,
} from './legacy-form-validation.helper';

describe('legacy form validation helper', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('marks empty required native controls invalid', () => {
    document.body.innerHTML = `
      <section id="ship">
        <input required value="" />
        <select required><option value=""></option></select>
      </section>
    `;

    const section = document.getElementById('ship') as HTMLElement;

    expect(validateLegacyRequiredSection(section)).toBeFalse();
    expect(section.querySelectorAll('.legacy-invalid-field').length).toBe(2);
  });

  it('skips disabled and readonly required controls', () => {
    document.body.innerHTML = `
      <section id="ship">
        <input required disabled value="" />
        <input required readonly value="" />
      </section>
    `;

    const section = document.getElementById('ship') as HTMLElement;

    expect(validateLegacyRequiredSection(section)).toBeTrue();
    expect(section.querySelectorAll('.legacy-invalid-field').length).toBe(0);
  });

  it('marks invalid ngx-select hosts', () => {
    document.body.innerHTML = `
      <section id="ship">
        <ngx-select required class="ng-invalid"></ngx-select>
      </section>
    `;

    const section = document.getElementById('ship') as HTMLElement;
    const select = section.querySelector('ngx-select') as HTMLElement;

    expect(validateLegacyRequiredSection(section)).toBeFalse();
    expect(select.classList.contains('legacy-invalid-field')).toBeTrue();
  });

  it('clears invalid state on input or change events', () => {
    document.body.innerHTML = `
      <section id="ship">
        <input required value="" />
      </section>
    `;

    const section = document.getElementById('ship') as HTMLElement;
    const input = section.querySelector('input') as HTMLInputElement;
    validateLegacyRequiredSection(section);

    clearLegacyInvalidFromEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    clearLegacyInvalidFromEvent({ target: input } as any);

    expect(input.classList.contains('legacy-invalid-field')).toBeFalse();
  });
});
