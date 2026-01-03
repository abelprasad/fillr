// Field matching patterns for detecting form inputs
// Each field has multiple pattern variations to maximize detection accuracy

const FIELD_PATTERNS = {
  firstName: [
    'firstname', 'first-name', 'first_name', 'fname', 'given-name', 'givenname',
    'forename', 'first name', 'name-first', 'namefirst'
  ],

  lastName: [
    'lastname', 'last-name', 'last_name', 'lname', 'family-name', 'familyname',
    'surname', 'last name', 'name-last', 'namelast'
  ],

  email: [
    'email', 'e-mail', 'emailaddress', 'email-address', 'email_address',
    'mail', 'email address', 'e-mail address'
  ],

  phone: [
    'phone', 'telephone', 'mobile', 'cell', 'phonenumber', 'phone-number',
    'phone_number', 'tel', 'cellphone', 'mobilephone', 'phone number',
    'contact', 'contact-number', 'contactnumber'
  ],

  street: [
    'street', 'address', 'address1', 'address-1', 'address_1', 'streetaddress',
    'street-address', 'street_address', 'addressline1', 'address-line-1',
    'street address', 'address line 1', 'line1'
  ],

  city: [
    'city', 'town', 'locality', 'municipality'
  ],

  state: [
    'state', 'province', 'region', 'area', 'stateprovince', 'state-province'
  ],

  zip: [
    'zip', 'zipcode', 'zip-code', 'zip_code', 'postalcode', 'postal-code',
    'postal_code', 'postcode', 'postal', 'zip code', 'postal code'
  ],

  linkedin: [
    'linkedin', 'linkedin-url', 'linkedinurl', 'linkedin_url', 'linkedin-profile',
    'linkedinprofile', 'linkedin profile', 'linkedin url'
  ],

  github: [
    'github', 'github-url', 'githuburl', 'github_url', 'github-username',
    'githubusername', 'github-profile', 'github profile', 'github url'
  ],

  portfolio: [
    'portfolio', 'website', 'personal-website', 'personalwebsite', 'personal_website',
    'portfoliourl', 'portfolio-url', 'portfolio_url', 'web-site', 'personal site',
    'portfolio website', 'personal website'
  ],

  university: [
    'university', 'college', 'school', 'institution', 'university-name',
    'universityname', 'college-name', 'collegename', 'school-name', 'schoolname',
    'university name', 'college name', 'school name', 'education-institution'
  ],

  major: [
    'major', 'degree', 'field-of-study', 'fieldofstudy', 'field_of_study',
    'studyfield', 'study-field', 'program', 'concentration', 'field of study',
    'degree-program', 'degreeprogram', 'area-of-study'
  ],

  graduationDate: [
    'graduation', 'graduation-date', 'graduationdate', 'graduation_date',
    'grad-date', 'graddate', 'expected-graduation', 'expectedgraduation',
    'graduation date', 'expected graduation', 'completion-date', 'completiondate',
    'grad-year', 'gradyear', 'graduation-year'
  ],

  gpa: [
    'gpa', 'grade-point-average', 'gradepointaverage', 'grade_point_average',
    'grade-average', 'grades', 'grade point average'
  ],

  workAuthorization: [
    'workauthorization', 'work-authorization', 'work_authorization',
    'authorization', 'work-status', 'workstatus', 'employment-authorization',
    'employmentauthorization', 'work authorization', 'authorization-status',
    'visa-status', 'visastatus', 'work-eligibility', 'workeligibility'
  ],

  sponsorship: [
    'sponsorship', 'visa-sponsorship', 'visasponsorship', 'visa_sponsorship',
    'require-sponsorship', 'requiresponsorship', 'require_sponsorship',
    'sponsor', 'need-sponsorship', 'needsponsorship', 'sponsorship-required',
    'sponsorshiprequired', 'visa sponsorship', 'require sponsorship'
  ],

  // Additional common fields
  middleName: [
    'middlename', 'middle-name', 'middle_name', 'mname', 'middle name',
    'middleinitial', 'middle-initial', 'middle_initial', 'mi'
  ],

  preferredName: [
    'preferredname', 'preferred-name', 'preferred_name', 'nickname',
    'preferred name', 'goes-by', 'goesby', 'goes by'
  ],

  country: [
    'country', 'nation', 'nationality', 'country-of-residence',
    'countryofresidence', 'residence-country'
  ],

  // Extended address fields
  address2: [
    'address2', 'address-2', 'address_2', 'addressline2', 'address-line-2',
    'address line 2', 'apt', 'apartment', 'suite', 'unit', 'line2'
  ],

  // Job-specific fields
  startDate: [
    'startdate', 'start-date', 'start_date', 'availabledate', 'available-date',
    'availability', 'start date', 'available date', 'when-can-you-start',
    'earliest-start', 'earlieststart'
  ],

  salaryExpectation: [
    'salary', 'salaryexpectation', 'salary-expectation', 'salary_expectation',
    'expected-salary', 'expectedsalary', 'desired-salary', 'desiredsalary',
    'salary expectation', 'expected salary', 'compensation', 'pay-expectation',
    'salary-range', 'salaryrange'
  ],

  coverLetter: [
    'coverletter', 'cover-letter', 'cover_letter', 'cover letter',
    'letter', 'motivation', 'why-this-company', 'whythiscompany',
    'why-us', 'whyus', 'additional-info', 'additionalinfo',
    'tell-us-about-yourself', 'about-yourself'
  ],

  // Diversity fields (optional)
  gender: [
    'gender', 'sex', 'gender-identity', 'genderidentity'
  ],

  ethnicity: [
    'ethnicity', 'race', 'ethnic-background', 'ethnicbackground',
    'racial-background', 'racialbackground'
  ],

  veteranStatus: [
    'veteran', 'veteran-status', 'veteranstatus', 'military',
    'military-service', 'militaryservice', 'armed-forces'
  ],

  disabilityStatus: [
    'disability', 'disability-status', 'disabilitystatus',
    'disabled', 'accommodation', 'accommodations'
  ],

  // References
  referenceName: [
    'referencename', 'reference-name', 'reference_name', 'referee',
    'reference name', 'ref-name', 'refname'
  ],

  referenceEmail: [
    'referenceemail', 'reference-email', 'reference_email',
    'reference email', 'ref-email', 'refemail'
  ],

  referencePhone: [
    'referencephone', 'reference-phone', 'reference_phone',
    'reference phone', 'ref-phone', 'refphone'
  ],

  // Social media (additional)
  twitter: [
    'twitter', 'twitter-url', 'twitterurl', 'twitter_url',
    'twitter-handle', 'twitterhandle', 'twitter handle'
  ],

  // Education details
  degreeType: [
    'degreetype', 'degree-type', 'degree_type', 'degree type',
    'level-of-education', 'levelofeducation', 'education-level'
  ],

  // Work experience
  currentCompany: [
    'currentcompany', 'current-company', 'current_company',
    'current company', 'employer', 'current-employer', 'currentemployer'
  ],

  currentTitle: [
    'currenttitle', 'current-title', 'current_title', 'current title',
    'job-title', 'jobtitle', 'position', 'current-position', 'currentposition'
  ],

  yearsOfExperience: [
    'experience', 'years-experience', 'yearsexperience', 'years_experience',
    'years-of-experience', 'yearsofexperience', 'work-experience',
    'total-experience'
  ]
};

/**
 * Normalize a string for pattern matching
 * Converts to lowercase and removes special characters
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[\s\-_\.]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a pattern matches a value
 */
function matchesPattern(value, patterns) {
  if (!value) return false;
  const normalized = normalizeString(value);
  return patterns.some(pattern => {
    const normalizedPattern = normalizeString(pattern);
    return normalized.includes(normalizedPattern) || normalizedPattern.includes(normalized);
  });
}

/**
 * Get field label text from associated label element
 */
function getFieldLabel(element) {
  // Try to find label by 'for' attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent;
  }

  // Try to find parent label
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent;

  return '';
}

/**
 * Detect which profile field an input element corresponds to
 * Returns the field name or null if no match
 */
function detectFieldType(element) {
  // Skip non-input elements
  if (!element.tagName || !['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
    return null;
  }

  // Skip certain input types
  const type = element.type?.toLowerCase();
  if (type && ['submit', 'button', 'reset', 'image', 'file', 'hidden'].includes(type)) {
    return null;
  }

  // Collect attributes to check
  const attributes = [
    element.name,
    element.id,
    element.placeholder,
    element.getAttribute('aria-label'),
    element.getAttribute('autocomplete'),
    getFieldLabel(element)
  ];

  // Check each profile field pattern
  for (const [fieldName, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const attr of attributes) {
      if (matchesPattern(attr, patterns)) {
        return fieldName;
      }
    }
  }

  return null;
}

/**
 * Get all form fields on the page with their detected types
 * Returns array of { element, fieldType }
 */
function detectFormFields() {
  const inputs = document.querySelectorAll('input, select, textarea');
  const detectedFields = [];

  inputs.forEach(input => {
    const fieldType = detectFieldType(input);
    if (fieldType) {
      detectedFields.push({
        element: input,
        fieldType: fieldType
      });
    }
  });

  return detectedFields;
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.FieldMatchers = {
    detectFieldType,
    detectFormFields,
    FIELD_PATTERNS
  };
}
