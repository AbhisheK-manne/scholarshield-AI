# ScholarShield AI 🛡️

**AI-Powered Fake Scholarship, Google Forms and Phishing Link Detector**

ScholarShield AI is a cybersecurity dashboard and multi-agent risk assessment framework engineered to protect students, applicants, and researchers from fake scholarship scams, advance-fee fraud, typosquatted portals, and credential-harvesting Google Forms.

---

## 🌟 Key Features

1. **Multi-Agent Orchestrator**:
   - **Agent 1: URL Analysis Agent** (SSRF isolation, protocol verification, domain parsing, brand mimicry & typosquatting detection).
   - **Agent 2: Google Form Analysis Agent** (Google Form shortlink resolution, public content inspection, detection of requests for UPI PINs, passwords, ATM PINs, bank OTPs, and advance registration fees).
   - **Agent 3: Scholarship Verification Agent** (Cross-referencing claims against official government portals like India's National Scholarship Portal `https://scholarships.gov.in`, UGC, AICTE, and verified philanthropic trusts like Tata Trusts, Reliance Foundation, Chevening, and DAAD).
   - **Agent 4: Phishing Detection Agent** (Academic phishing threat feeds, known malicious signatures, and optional Google Safe Browsing v4 API integration).
   - **Agent 5: Risk Assessment Agent** (Explainable deterministic scoring weights clamped from 0 to 100, plus executive briefing synthesized with Gemini).

2. **Deterministic Risk Scoring Engine**:
   - Verified malicious reputation: **+50 pts**
   - Credential or OTP harvesting (PIN/OTP/Password): **+40 pts** *(Triggers immediate critical warning banner)*
   - Confirmed brand mimicry / typosquatting: **+35 pts**
   - Suspicious application fee or UPI/wallet payment solicitation: **+20 pts**
   - Significant conflict with official scholarship records: **+20 pts**
   - Unverified provider identity in central index: **+10 pts**
   - Independent authoritative confirmation on official `.gov.in` or university domain: **−20 pts**
   - Unencrypted plain HTTP: **+15 pts**

3. **Risk Categories**:
   - **0–19**: Few risk indicators detected
   - **20–49**: Caution required
   - **50–74**: High risk
   - **75–100**: Very high risk

4. **Transparent Honesty & Integrity**:
   - Never claims 100% detection accuracy.
   - When evidence is insufficient or forms require private authentication, marks checks as *"Unable to verify"* rather than falsely certifying a link as safe.
   - Provides student-friendly option to paste question text for private/login-protected Google Forms.

5. **Admin Operations & Benchmarks**:
   - Protected by admin session authentication (`admin` / `scholarshield2026`).
   - Automated benchmark evaluation on a labelled test dataset measuring: **Precision, Recall, False-Positive Rate, False-Negative Rate, Verification Coverage, and API Failure Rate**.
   - Trusted-source domain registry management.
   - Official scholarship scheme manager.
   - User feedback & false positive dispute viewer.

---

## 🏗️ System Architecture

```
[Student / User]
       │
       ▼
[React 19 + Tailwind CSS Frontend]
       │
       ▼ REST API (/api/*)
[Express 4 + Vite Full-Stack Server (server.ts)]
       │
       ├── Agent Orchestrator (orchestrator.ts)
       │      ├── Agent 1: URL Analysis (SSRF defense, redirects, typosquats)
       │      ├── Agent 2: Google Form Analyzer (Credential & fee audit)
       │      ├── Agent 3: Scholarship Registry Cross-Check (NSP / UGC / AICTE)
       │      ├── Agent 4: Phishing & Threat Feeds (Signatures + Safe Browsing)
       │      └── Agent 5: Risk Scoring Engine & Gemini Briefing
       │
       └── Persistent Database Engine (data/scholarshield_db.json)
              ├── scan_reports
              ├── scholarship_records
              ├── trusted_sources
              ├── feedback_reports
              └── test_dataset (labelled ground truth)
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# GEMINI_API_KEY: Optional - enables AI executive briefings
GEMINI_API_KEY="your-gemini-api-key"

# GOOGLE_SAFE_BROWSING_KEY: Optional - queries live Google Safe Browsing v4
GOOGLE_SAFE_BROWSING_KEY=""

PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Running Automated Tests

Run the multi-agent security test suite:
```bash
npx tsx tests/security_and_agents.test.ts
```
Tests cover:
- SSRF defense (localhost, loopback, AWS/GCP metadata, private RFC1918 subnets)
- Unsafe protocol rejection (`javascript:`, `data:`, `file:`)
- Domain typosquatting against `scholarships.gov.in`
- Credential harvesting detection (UPI PIN / OTP)
- Application fee solicitation
- Authoritative negative risk scoring
- Critical warning triggering on credential theft
- Admin session authentication

---

## 📡 REST API Documentation

### 1. POST `/api/scan`
Analyze a scholarship link or Google Form.
- **Request Body**:
  ```json
  {
    "url": "https://scholarships.gov.in",
    "scholarshipName": "Central Sector Scheme",
    "claimedOrganization": "Ministry of Education",
    "contextDescription": "Received notification for application",
    "userProvidedFormText": ""
  }
  ```
- **Response**:
  ```json
  {
    "scanId": "scan_...",
    "status": "completed",
    "report": { ...full 16-point RiskReport... }
  }
  ```

### 2. GET `/api/scan/:id`
Fetch a stored risk report by ID.

### 3. GET `/api/scan/history`
Fetch recent scan history for quick audit.

### 4. POST `/api/scholarships/verify`
Cross-reference a scholarship claim against the official registry.
- **Request Body**:
  ```json
  {
    "name": "Pragati Scholarship",
    "provider": "AICTE",
    "portalUrl": "https://www.aicte-india.org"
  }
  ```

### 5. GET `/api/scholarships/search?q=Central`
Search indexed official schemes and guidelines.

### 6. POST `/api/feedback`
Submit a false-positive or false-negative dispute report.

### 7. GET `/api/health`
Check service health, agent status, and active database counts.

### 8. POST `/api/admin/login`
Authenticate as administrator. Demo credentials:
- Username: `admin`
- Password: `scholarshield2026`

### 9. GET `/api/admin/benchmark` *(Requires Bearer Token)*
Runs the automated evaluation suite across the labelled test dataset and returns Precision, Recall, False-Positive Rate, False-Negative Rate, and Verification Coverage.

---

## 🛡️ Responsible Disclosure & Security Disclaimer

No automated scanner can guarantee 100% security. Always verify critical educational grant deadlines, bank account details, and eligibility criteria directly with your university administration, nodal scholarship officer, or official state/national education portals.
