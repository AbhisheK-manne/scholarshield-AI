import fs from 'fs';
import path from 'path';
import { RiskReport, ScholarshipRecord, TrustedSource, FeedbackReport, BenchmarkItem } from './types.js';

interface DatabaseSchema {
  scan_reports: RiskReport[];
  scholarship_records: ScholarshipRecord[];
  trusted_sources: TrustedSource[];
  feedback_reports: FeedbackReport[];
  test_dataset: BenchmarkItem[];
  admin_sessions: { token: string; username: string; expiresAt: number }[];
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'scholarshield_db.json');

// Initial seed data
const INITIAL_TRUSTED_SOURCES: TrustedSource[] = [
  {
    id: 'ts-1',
    domain: 'scholarships.gov.in',
    organizationName: 'National Scholarship Portal (Govt of India)',
    sourceType: 'government_portal',
    country: 'India',
    officialUrl: 'https://scholarships.gov.in',
    notes: 'Primary national portal for all central, state, and UGC schemes in India.'
  },
  {
    id: 'ts-2',
    domain: 'ugc.ac.in',
    organizationName: 'University Grants Commission (UGC)',
    sourceType: 'government_portal',
    country: 'India',
    officialUrl: 'https://www.ugc.ac.in',
    notes: 'Apex regulatory body for higher education in India.'
  },
  {
    id: 'ts-3',
    domain: 'aicte-india.org',
    organizationName: 'All India Council for Technical Education (AICTE)',
    sourceType: 'government_portal',
    country: 'India',
    officialUrl: 'https://www.aicte-india.org',
    notes: 'AICTE Pragati, Saksham, and Swanath scholarship administrator.'
  },
  {
    id: 'ts-4',
    domain: 'tatatrusts.org',
    organizationName: 'Tata Trusts',
    sourceType: 'registered_charity',
    country: 'India',
    officialUrl: 'https://www.tatatrusts.org',
    notes: 'Philanthropic educational grants and JN Tata Endowment.'
  },
  {
    id: 'ts-5',
    domain: 'reliancefoundation.org',
    organizationName: 'Reliance Foundation Scholarships',
    sourceType: 'verified_corporate',
    country: 'India',
    officialUrl: 'https://www.reliancefoundation.org',
    notes: 'UG and PG scholarship programs for STEM, engineering, and commerce.'
  },
  {
    id: 'ts-6',
    domain: 'chevening.org',
    organizationName: 'Chevening Scholarships (UK FCDO)',
    sourceType: 'government_portal',
    country: 'United Kingdom',
    officialUrl: 'https://www.chevening.org',
    notes: 'Official UK government international scholarships program.'
  },
  {
    id: 'ts-7',
    domain: 'usief.org.in',
    organizationName: 'Fulbright-Nehru Fellowships (USIEF)',
    sourceType: 'government_portal',
    country: 'USA / India',
    officialUrl: 'https://www.usief.org.in',
    notes: 'Official US-India educational foundation.'
  },
  {
    id: 'ts-8',
    domain: 'daad.de',
    organizationName: 'German Academic Exchange Service (DAAD)',
    sourceType: 'government_portal',
    country: 'Germany',
    officialUrl: 'https://www.daad.de',
    notes: 'Official German academic funding organization.'
  }
];

const INITIAL_SCHOLARSHIPS: ScholarshipRecord[] = [
  {
    id: 'sch-1',
    name: 'National Scholarship Portal - Central Sector Scheme for College and University Students',
    provider: 'Department of Higher Education, Ministry of Education, Govt of India',
    providerType: 'government',
    officialPortalUrl: 'https://scholarships.gov.in',
    applicationUrl: 'https://scholarships.gov.in/fresh/newstdRegfrmInstruction',
    amount: '₹12,000 per annum for Graduation; ₹20,000 for Post Graduation',
    deadline: 'October 31 annually (or extended by Ministry)',
    eligibility: 'Above 80th percentile in Class 12 board, parental income < ₹4.5 LPA, regular degree enrolled.',
    applicationFee: '100% Free - Never charges any fee',
    paymentMethodWarning: 'Direct Benefit Transfer (DBT) directly into student Aadhaar-linked bank account. No UPI or cash ever.',
    lastVerifiedDate: '2026-03-01',
    officialSourceCitation: 'https://scholarships.gov.in/public/schemeGuidelines/CSSS_Guideline.pdf'
  },
  {
    id: 'sch-2',
    name: 'AICTE Pragati Scholarship for Girls',
    provider: 'All India Council for Technical Education (AICTE)',
    providerType: 'government',
    officialPortalUrl: 'https://www.aicte-india.org',
    applicationUrl: 'https://scholarships.gov.in',
    amount: '₹50,000 per annum for tuition & contingency',
    deadline: 'December 31 annually',
    eligibility: 'Female student admitted to 1st year degree/diploma technical course in AICTE approved college. Family income < ₹8 LPA.',
    applicationFee: '100% Free - No charges',
    paymentMethodWarning: 'Direct Bank Transfer via PFMS/DBT. Never asks for UPI PIN or debit card OTP.',
    lastVerifiedDate: '2026-02-15',
    officialSourceCitation: 'https://www.aicte-india.org/schemes/students-development-schemes/pragati'
  },
  {
    id: 'sch-3',
    name: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    providerType: 'corporate',
    officialPortalUrl: 'https://www.reliancefoundation.org',
    applicationUrl: 'https://www.reliancefoundation.org/scholarships',
    amount: 'Up to ₹2,00,000 over course duration',
    deadline: 'October 15 annually',
    eligibility: 'Resident Indian citizen, passed standard 12th with min 60%, enrolled in 1st year full-time UG degree, family income < ₹15 LPA (preference < ₹2.5 LPA).',
    applicationFee: 'Free application - zero registration fee',
    paymentMethodWarning: 'Direct transfer to student bank account. Will never ask to pay money to receive scholarship.',
    lastVerifiedDate: '2026-01-20',
    officialSourceCitation: 'https://www.reliancefoundation.org/scholarships-faq'
  },
  {
    id: 'sch-4',
    name: 'Chevening International Scholarships',
    provider: 'Foreign, Commonwealth & Development Office (UK Government)',
    providerType: 'government',
    officialPortalUrl: 'https://www.chevening.org',
    applicationUrl: 'https://www.chevening.org/apply',
    amount: 'Fully-funded: UK university tuition fees, monthly living allowance, economy return flights, arrival allowance',
    deadline: 'November early weeks annually',
    eligibility: 'Undergraduate degree with 2:1 or higher, at least two years work experience, return to home country for min 2 years after study.',
    applicationFee: 'Free. No agent or middleman authorized to charge fees.',
    paymentMethodWarning: 'All payments managed through British Council and official UK Embassy channels.',
    lastVerifiedDate: '2026-02-10',
    officialSourceCitation: 'https://www.chevening.org/scholarships/guidance'
  },
  {
    id: 'sch-5',
    name: 'Post Matric Scholarship Schemes for Minorities (NSP)',
    provider: 'Ministry of Minority Affairs, Govt of India',
    providerType: 'government',
    officialPortalUrl: 'https://scholarships.gov.in',
    applicationUrl: 'https://scholarships.gov.in',
    amount: 'Admission fee + tuition fee + maintenance allowance up to ₹10,000/year',
    deadline: 'November 30 annually',
    eligibility: 'Class 11 to Ph.D. students belonging to notified minority communities with min 50% marks in previous final exam, family income < ₹2 LPA.',
    applicationFee: 'Free of charge',
    paymentMethodWarning: 'DBT linked via Aadhaar. No third-party wallet or processing charge.',
    lastVerifiedDate: '2026-03-05',
    officialSourceCitation: 'https://scholarships.gov.in'
  }
];

// Labelled test dataset for precision, recall, and detection performance benchmarks
const INITIAL_TEST_DATASET: BenchmarkItem[] = [
  {
    id: 'bench-1',
    url: 'https://scholarships.gov.in',
    groundTruthLabel: 'legitimate',
    type: 'official_gov',
    description: 'Authentic Indian National Scholarship Portal root domain'
  },
  {
    id: 'bench-2',
    url: 'http://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php',
    groundTruthLabel: 'malicious',
    type: 'phishing_form',
    description: 'Typosquatted domain impersonating National Scholarship Portal using unsecure HTTP on suspicious TLD'
  },
  {
    id: 'bench-3',
    url: 'https://forms.gle/xK99fakeScholarshipWinUPI',
    groundTruthLabel: 'malicious',
    type: 'credential_harvest',
    description: 'Google Form claiming guaranteed 5 lakh scholarship requesting student UPI PIN and Aadhaar OTP for verification fee'
  },
  {
    id: 'bench-4',
    url: 'https://www.aicte-india.org',
    groundTruthLabel: 'legitimate',
    type: 'official_gov',
    description: 'Authentic All India Council for Technical Education website'
  },
  {
    id: 'bench-5',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdFakeTataTrustForm/viewform',
    groundTruthLabel: 'malicious',
    type: 'fake_fee_scam',
    description: 'Google Form impersonating Tata Trusts requiring 500 Rs processing fee via QR code'
  },
  {
    id: 'bench-6',
    url: 'https://www.reliancefoundation.org/scholarships',
    groundTruthLabel: 'legitimate',
    type: 'official_university',
    description: 'Authentic Reliance Foundation Scholarships portal'
  },
  {
    id: 'bench-7',
    url: 'http://192.168.1.100/scholarship-form',
    groundTruthLabel: 'malicious',
    type: 'phishing_form',
    description: 'Private IP address SSRF attack vector attempt'
  },
  {
    id: 'bench-8',
    url: 'https://www.chevening.org',
    groundTruthLabel: 'legitimate',
    type: 'official_gov',
    description: 'Authentic UK Chevening Scholarship official domain'
  },
  {
    id: 'bench-9',
    url: 'https://local-community-scholarship-blog.example.org/apply-2026',
    groundTruthLabel: 'suspicious',
    type: 'inconclusive_source',
    description: 'Unverified personal blog claiming private scholarship with missing accreditation'
  },
  {
    id: 'bench-10',
    url: 'http://ugc-scholarship-direct-approval.site/pay-processing.html',
    groundTruthLabel: 'malicious',
    type: 'fake_fee_scam',
    description: 'Fake UGC approval letter asking 1,200 Rs instant approval fee on non-https free domain'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      scan_reports: [],
      scholarship_records: INITIAL_SCHOLARSHIPS,
      trusted_sources: INITIAL_TRUSTED_SOURCES,
      feedback_reports: [],
      test_dataset: INITIAL_TEST_DATASET,
      admin_sessions: []
    };
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          scan_reports: parsed.scan_reports || [],
          scholarship_records: parsed.scholarship_records?.length ? parsed.scholarship_records : INITIAL_SCHOLARSHIPS,
          trusted_sources: parsed.trusted_sources?.length ? parsed.trusted_sources : INITIAL_TRUSTED_SOURCES,
          feedback_reports: parsed.feedback_reports || [],
          test_dataset: parsed.test_dataset?.length ? parsed.test_dataset : INITIAL_TEST_DATASET,
          admin_sessions: parsed.admin_sessions || []
        };
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('Error reading database file, using in-memory state:', err);
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  // Scan Reports
  public saveScanReport(report: RiskReport): void {
    const existingIndex = this.data.scan_reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      this.data.scan_reports[existingIndex] = report;
    } else {
      this.data.scan_reports.unshift(report);
    }
    // Keep last 200 reports
    if (this.data.scan_reports.length > 200) {
      this.data.scan_reports = this.data.scan_reports.slice(0, 200);
    }
    this.saveToDisk();
  }

  public getScanReportById(id: string): RiskReport | undefined {
    return this.data.scan_reports.find(r => r.id === id);
  }

  public getRecentScanReports(limit: number = 50): RiskReport[] {
    return this.data.scan_reports.slice(0, limit);
  }

  // Scholarships
  public getScholarships(): ScholarshipRecord[] {
    return this.data.scholarship_records;
  }

  public searchScholarships(query: string): ScholarshipRecord[] {
    if (!query || !query.trim()) return this.data.scholarship_records;
    const q = query.toLowerCase();
    return this.data.scholarship_records.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.officialPortalUrl.toLowerCase().includes(q) ||
      s.eligibility.toLowerCase().includes(q)
    );
  }

  public addScholarship(scholarship: ScholarshipRecord): void {
    this.data.scholarship_records.unshift(scholarship);
    this.saveToDisk();
  }

  // Trusted Sources
  public getTrustedSources(): TrustedSource[] {
    return this.data.trusted_sources;
  }

  public isTrustedDomain(hostname: string): { trusted: boolean; source?: TrustedSource } {
    const cleanHost = hostname.toLowerCase().replace(/^www\./, '');
    for (const source of this.data.trusted_sources) {
      const sourceDomain = source.domain.toLowerCase().replace(/^www\./, '');
      if (cleanHost === sourceDomain || cleanHost.endsWith('.' + sourceDomain)) {
        return { trusted: true, source };
      }
    }
    return { trusted: false };
  }

  public addTrustedSource(source: TrustedSource): void {
    this.data.trusted_sources.unshift(source);
    this.saveToDisk();
  }

  // Feedback
  public addFeedback(report: FeedbackReport): void {
    this.data.feedback_reports.unshift(report);
    this.saveToDisk();
  }

  public getFeedbackReports(): FeedbackReport[] {
    return this.data.feedback_reports;
  }

  // Test Dataset
  public getTestDataset(): BenchmarkItem[] {
    return this.data.test_dataset;
  }

  // Admin Auth
  public createAdminSession(username: string): string {
    const token = 'admin_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    this.data.admin_sessions.push({ token, username, expiresAt });
    this.saveToDisk();
    return token;
  }

  public validateAdminSession(token: string): boolean {
    if (!token) return false;
    const session = this.data.admin_sessions.find(s => s.token === token && s.expiresAt > Date.now());
    return !!session;
  }
}

export const db = new Database();
