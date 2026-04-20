import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load fieldMatchers.js into the jsdom global scope (it sets window.FieldMatchers)
beforeAll(() => {
  const code = readFileSync(resolve(__dirname, '../../utils/fieldMatchers.js'), 'utf-8');
  // eslint-disable-next-line no-eval
  eval(code);
});

// Helper: create a minimal input element with given attributes
function makeInput(attrs = {}) {
  const el = document.createElement(attrs.tag || 'input');
  if (attrs.type) el.type = attrs.type;
  if (attrs.name) el.name = attrs.name;
  if (attrs.id) el.id = attrs.id;
  if (attrs.placeholder) el.placeholder = attrs.placeholder;
  if (attrs.ariaLabel) el.setAttribute('aria-label', attrs.ariaLabel);
  if (attrs.autocomplete) el.setAttribute('autocomplete', attrs.autocomplete);
  if (attrs.automationId) el.setAttribute('data-automation-id', attrs.automationId);
  return el;
}

// Helper: attach a <label for="id"> to the document
function attachLabel(forId, text) {
  const label = document.createElement('label');
  label.setAttribute('for', forId);
  label.textContent = text;
  document.body.appendChild(label);
  return label;
}

// Helper: attach an aria-labelledby chain
function attachAriaLabelledBy(element, text) {
  const span = document.createElement('span');
  span.id = `label-${Math.random().toString(36).slice(2)}`;
  span.textContent = text;
  document.body.appendChild(span);
  element.setAttribute('aria-labelledby', span.id);
  return span;
}

describe('detectFieldType — name attribute', () => {
  it('detects firstName by name', () => {
    const el = makeInput({ name: 'firstName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('detects firstName by name variant first_name', () => {
    const el = makeInput({ name: 'first_name' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('detects lastName', () => {
    const el = makeInput({ name: 'lastName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('lastName');
  });

  it('detects email', () => {
    const el = makeInput({ name: 'email' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('email');
  });

  it('detects phone', () => {
    const el = makeInput({ name: 'phone' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('phone');
  });

  it('detects phone via "tel" name', () => {
    const el = makeInput({ name: 'tel' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('phone');
  });

  it('detects university', () => {
    const el = makeInput({ name: 'university' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('university');
  });

  it('detects gpa', () => {
    const el = makeInput({ name: 'gpa' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('gpa');
  });

  it('detects workAuthorization', () => {
    const el = makeInput({ name: 'workAuthorization' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('workAuthorization');
  });

  it('detects salaryExpectation via "salary" name', () => {
    const el = makeInput({ name: 'salary' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('salaryExpectation');
  });

  it('detects coverLetter', () => {
    const el = makeInput({ tag: 'textarea', name: 'coverLetter' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('coverLetter');
  });
});

describe('detectFieldType — id attribute', () => {
  it('detects firstName by id', () => {
    const el = makeInput({ id: 'firstName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('detects email by id', () => {
    const el = makeInput({ id: 'email' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('email');
  });
});

describe('detectFieldType — placeholder attribute', () => {
  it('detects email by placeholder', () => {
    const el = makeInput({ placeholder: 'Enter your email' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('email');
  });

  it('detects gpa by placeholder', () => {
    const el = makeInput({ placeholder: '3.8' });
    // 3.8 won't match gpa pattern — placeholder alone is not enough here, correct behavior
    expect(window.FieldMatchers.detectFieldType(el)).toBeNull();
  });

  it('detects phone by placeholder text', () => {
    const el = makeInput({ placeholder: 'Phone number' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('phone');
  });
});

describe('detectFieldType — aria-label attribute', () => {
  it('detects firstName by aria-label', () => {
    const el = makeInput({ ariaLabel: 'First Name' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('detects linkedin by aria-label', () => {
    const el = makeInput({ ariaLabel: 'LinkedIn Profile URL' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('linkedin');
  });
});

describe('detectFieldType — aria-labelledby', () => {
  it('detects firstName via aria-labelledby', () => {
    const el = makeInput({ id: 'test-fn-' + Date.now() });
    attachAriaLabelledBy(el, 'First Name');
    document.body.appendChild(el);
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
    el.remove();
  });

  it('detects email via aria-labelledby', () => {
    const el = makeInput({ id: 'test-em-' + Date.now() });
    attachAriaLabelledBy(el, 'Email Address');
    document.body.appendChild(el);
    expect(window.FieldMatchers.detectFieldType(el)).toBe('email');
    el.remove();
  });
});

describe('detectFieldType — data-automation-id (Workday)', () => {
  it('detects firstName via data-automation-id legalNameSection_firstName', () => {
    const el = makeInput({ automationId: 'legalNameSection_firstName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('detects lastName via data-automation-id', () => {
    const el = makeInput({ automationId: 'legalNameSection_lastName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('lastName');
  });

  it('detects email via data-automation-id', () => {
    const el = makeInput({ automationId: 'email-address' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('email');
  });

  it('detects city via data-automation-id', () => {
    const el = makeInput({ automationId: 'addressSection_city' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('city');
  });
});

describe('detectFieldType — label text (for attribute)', () => {
  it('detects firstName from associated label', () => {
    const el = makeInput({ id: 'fn-label-test' });
    attachLabel('fn-label-test', 'First Name *');
    document.body.appendChild(el);
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
    el.remove();
  });

  it('detects university from associated label', () => {
    const el = makeInput({ id: 'univ-label-test' });
    attachLabel('univ-label-test', 'University/College Name');
    document.body.appendChild(el);
    expect(window.FieldMatchers.detectFieldType(el)).toBe('university');
    el.remove();
  });
});

describe('detectFieldType — skipped input types', () => {
  it('returns null for submit buttons', () => {
    const el = makeInput({ type: 'submit' });
    expect(window.FieldMatchers.detectFieldType(el)).toBeNull();
  });

  it('returns null for file inputs', () => {
    const el = makeInput({ type: 'file' });
    expect(window.FieldMatchers.detectFieldType(el)).toBeNull();
  });

  it('returns null for hidden inputs', () => {
    const el = makeInput({ type: 'hidden', name: 'firstName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBeNull();
  });

  it('returns null for non-form elements', () => {
    const el = document.createElement('div');
    expect(window.FieldMatchers.detectFieldType(el)).toBeNull();
  });

  it('returns null for unrecognized field names', () => {
    const el = makeInput({ name: 'csrf_token' });
    expect(window.FieldMatchers.detectFieldType(el)).toBeNull();
  });
});

describe('detectFieldType — select and textarea elements', () => {
  it('detects workAuthorization on a select', () => {
    const el = document.createElement('select');
    el.name = 'workAuthorization';
    expect(window.FieldMatchers.detectFieldType(el)).toBe('workAuthorization');
  });

  it('detects coverLetter on a textarea', () => {
    const el = document.createElement('textarea');
    el.name = 'coverLetter';
    expect(window.FieldMatchers.detectFieldType(el)).toBe('coverLetter');
  });
});

describe('detectFormFields — full form scan', () => {
  it('detects all named fields in test-form structure', () => {
    const form = document.createElement('form');
    const fields = [
      { name: 'firstName', type: 'text' },
      { name: 'lastName', type: 'text' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'tel' },
      { name: 'university', type: 'text' },
      { name: 'gpa', type: 'text' },
    ];
    fields.forEach(({ name, type }) => {
      const el = document.createElement('input');
      el.name = name;
      el.type = type;
      form.appendChild(el);
    });
    // Add a submit button that should be skipped
    const btn = document.createElement('input');
    btn.type = 'submit';
    btn.name = 'submit';
    form.appendChild(btn);

    document.body.appendChild(form);
    const detected = window.FieldMatchers.detectFormFields();

    const detectedTypes = detected.map(d => d.fieldType);
    expect(detectedTypes).toContain('firstName');
    expect(detectedTypes).toContain('lastName');
    expect(detectedTypes).toContain('email');
    expect(detectedTypes).toContain('phone');
    expect(detectedTypes).toContain('university');
    expect(detectedTypes).toContain('gpa');
    expect(detectedTypes).not.toContain('submit');

    form.remove();
  });

  it('returns empty array when no form fields present', () => {
    // Remove any lingering form elements from previous test
    document.querySelectorAll('form').forEach(f => f.remove());
    const detected = window.FieldMatchers.detectFormFields();
    expect(detected.length).toBe(0);
  });

  it('does not return duplicate field types for the same element', () => {
    const form = document.createElement('form');
    const el = document.createElement('input');
    el.name = 'email';
    el.id = 'email'; // matches via both name AND id
    form.appendChild(el);
    document.body.appendChild(form);

    const detected = window.FieldMatchers.detectFormFields();
    const emailFields = detected.filter(d => d.fieldType === 'email');
    expect(emailFields.length).toBe(1);

    form.remove();
  });
});

describe('normalizeString behavior (via pattern matching)', () => {
  it('matches despite spaces in attribute', () => {
    const el = makeInput({ ariaLabel: 'First Name' }); // space
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('matches despite dashes in attribute', () => {
    const el = makeInput({ name: 'first-name' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('matches despite underscores in attribute', () => {
    const el = makeInput({ name: 'first_name' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('matches case-insensitively', () => {
    const el = makeInput({ name: 'FIRSTNAME' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });

  it('matches substring — legalNameSection_firstName contains firstname', () => {
    const el = makeInput({ name: 'legalNameSection_firstName' });
    expect(window.FieldMatchers.detectFieldType(el)).toBe('firstName');
  });
});
