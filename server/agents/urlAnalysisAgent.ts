import { AgentFinding } from '../types.js';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export interface UrlAnalysisResult {
  submittedUrl: string;
  finalDestinationUrl: string;
  hostname: string;
  domain: string;
  tld: string;
  isHttps: boolean;
  isIpAddress: boolean;
  subdomainDepth: number;
  typosquattingDetected: boolean;
  typosquattingTarget?: string;
  redirectCount: number;
  redirectChain: string[];
  riskIndicators: string[];
  findings: AgentFinding[];
  isBlockedBySsrf: boolean;
  ssrfReason?: string;
}

// Known official and authority domains frequently targeted by typosquatters
const PROTECTED_TARGETS = [
  { name: 'National Scholarship Portal', domain: 'scholarships.gov.in' },
  { name: 'UGC India', domain: 'ugc.ac.in' },
  { name: 'AICTE', domain: 'aicte-india.org' },
  { name: 'National Testing Agency', domain: 'nta.ac.in' },
  { name: 'National Portal of India', domain: 'india.gov.in' },
  { name: 'Tata Trusts', domain: 'tatatrusts.org' },
  { name: 'Reliance Foundation', domain: 'reliancefoundation.org' },
  { name: 'Chevening', domain: 'chevening.org' },
  { name: 'Google Forms', domain: 'docs.google.com' }
];

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'tk', 'ml', 'ga', 'cf', 'gq', 'zip', 'mov', 'cam', 'rest', 'buzz', 'fit', 'guru'
]);

function isPrivateOrLocalIp(hostname: string): boolean {
  // Check loopback / localhost
  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1') {
    return true;
  }

  // Check IPv4 matches
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1).map(Number);
    if (octets.some(o => o < 0 || o > 255)) return true;

    // 127.0.0.0/8 (Loopback)
    if (octets[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (octets[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (octets[0] === 192 && octets[1] === 168) return true;
    // 169.254.0.0/16 (Link-local & AWS/GCP Metadata 169.254.169.254)
    if (octets[0] === 169 && octets[1] === 254) return true;
    // 0.0.0.0/8
    if (octets[0] === 0) return true;
  }

  return false;
}

function calculateLevenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

export async function runUrlAnalysisAgent(submittedUrl: string): Promise<UrlAnalysisResult> {
  const timestamp = new Date().toISOString();
  const riskIndicators: string[] = [];
  const findings: AgentFinding[] = [];
  const redirectChain: string[] = [submittedUrl];

  // 1. Validation & SSRF Check
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(submittedUrl);
  } catch {
    return {
      submittedUrl,
      finalDestinationUrl: submittedUrl,
      hostname: '',
      domain: '',
      tld: '',
      isHttps: false,
      isIpAddress: false,
      subdomainDepth: 0,
      typosquattingDetected: false,
      redirectCount: 0,
      redirectChain: [submittedUrl],
      riskIndicators: ['Malformed URL syntax'],
      findings: [{
        agentName: 'URL Analysis Agent',
        status: 'error',
        title: 'Malformed URL',
        description: 'The provided URL could not be parsed by standard URL standards.',
        riskPoints: 20,
        confidence: 'high',
        evidence: [`URL string: ${submittedUrl}`],
        timestamp
      }],
      isBlockedBySsrf: false
    };
  }

  // Scheme validation
  const protocol = parsedUrl.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return {
      submittedUrl,
      finalDestinationUrl: submittedUrl,
      hostname: parsedUrl.hostname,
      domain: parsedUrl.hostname,
      tld: '',
      isHttps: false,
      isIpAddress: false,
      subdomainDepth: 0,
      typosquattingDetected: false,
      redirectCount: 0,
      redirectChain: [submittedUrl],
      riskIndicators: [`Dangerous or unsupported protocol: ${protocol}`],
      findings: [{
        agentName: 'URL Analysis Agent',
        status: 'malicious',
        title: 'Unsupported/Unsafe Scheme Blocked',
        description: `Protocol "${protocol}" is prohibited to prevent client-side execution attacks (e.g. javascript:, file:).`,
        riskPoints: 50,
        confidence: 'high',
        evidence: [`Protocol rejected: ${protocol}`],
        timestamp
      }],
      isBlockedBySsrf: true,
      ssrfReason: `Unsupported protocol ${protocol}`
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // SSRF Protection: Private & loopback IP addresses
  if (isPrivateOrLocalIp(hostname)) {
    return {
      submittedUrl,
      finalDestinationUrl: submittedUrl,
      hostname,
      domain: hostname,
      tld: '',
      isHttps: protocol === 'https:',
      isIpAddress: true,
      subdomainDepth: 0,
      typosquattingDetected: false,
      redirectCount: 0,
      redirectChain: [submittedUrl],
      riskIndicators: ['Private/Localhost address attempt (SSRF Protection Triggered)'],
      findings: [{
        agentName: 'URL Analysis Agent',
        status: 'malicious',
        title: 'SSRF Violation Blocked',
        description: `Target resolved to private, link-local, or cloud internal metadata address (${hostname}). Access denied.`,
        riskPoints: 50,
        confidence: 'high',
        evidence: [`Destination IP/Host: ${hostname}`],
        timestamp
      }],
      isBlockedBySsrf: true,
      ssrfReason: `Private address space blocked: ${hostname}`
    };
  }

  const isHttps = protocol === 'https:';
  if (!isHttps) {
    riskIndicators.push('Plain HTTP unencrypted connection');
    findings.push({
      agentName: 'URL Analysis Agent',
      status: 'warning',
      title: 'Unencrypted Connection (HTTP)',
      description: 'The website does not enforce HTTPS. Data entered can be intercepted or tampered with on the network.',
      riskPoints: 15,
      confidence: 'high',
      evidence: ['Scheme is http://'],
      timestamp
    });
  }

  // Domain structure & TLD analysis
  const hostParts = hostname.split('.');
  const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';
  const domain = hostParts.length > 2 ? hostParts.slice(-2).join('.') : hostname;
  const subdomainDepth = Math.max(0, hostParts.length - 2);

  if (SUSPICIOUS_TLDS.has(tld)) {
    riskIndicators.push(`Suspicious/High-abuse Top Level Domain (.${tld})`);
    findings.push({
      agentName: 'URL Analysis Agent',
      status: 'suspicious',
      title: 'High-Abuse Top-Level Domain',
      description: `The .${tld} TLD has a statistically high correlation with phishing and disposable scam portals.`,
      riskPoints: 15,
      confidence: 'medium',
      evidence: [`Top-level domain: .${tld}`],
      timestamp
    });
  }

  if (subdomainDepth >= 3) {
    riskIndicators.push(`Excessive subdomain nesting (${subdomainDepth} levels)`);
    findings.push({
      agentName: 'URL Analysis Agent',
      status: 'warning',
      title: 'Excessive Subdomain Nesting',
      description: 'Deep subdomain layering is often used in phishing lures to mimic authentic brand names in prefixes.',
      riskPoints: 10,
      confidence: 'medium',
      evidence: [`Subdomain depth: ${subdomainDepth}`],
      timestamp
    });
  }

  // Typosquatting / Impersonation Detection
  let typosquattingDetected = false;
  let typosquattingTarget: string | undefined;

  const normalizedHost = hostname
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/3/g, 'e')
    .replace(/@/g, 'a');

  for (const target of PROTECTED_TARGETS) {
    if (hostname === target.domain || hostname.endsWith('.' + target.domain)) {
      continue;
    }

    const targetBase = target.domain.replace(/\.[a-z.]+$/, '');
    const currentBase = domain.replace(/\.[a-z.]+$/, '');
    const hyphenatedTarget = target.domain.replace(/\./g, '-');

    const segments = hostname.split(/[.-]/);
    const hasMimicSegment = segments.some(seg => {
      const normSeg = seg.replace(/1/g, 'i').replace(/0/g, 'o').replace(/5/g, 's');
      return normSeg === targetBase || (normSeg.length >= 5 && calculateLevenshtein(normSeg, targetBase) <= 2);
    });

    if (
      hasMimicSegment ||
      normalizedHost.includes(hyphenatedTarget) ||
      normalizedHost.includes(targetBase) ||
      (calculateLevenshtein(currentBase, targetBase) <= 2 && currentBase.length >= 4)
    ) {
      typosquattingDetected = true;
      typosquattingTarget = `${target.name} (${target.domain})`;
      riskIndicators.push(`Typosquatting or brand mimicry targeting ${target.name}`);
      findings.push({
        agentName: 'URL Analysis Agent',
        status: 'malicious',
        title: 'Potential Domain Typosquatting Detected',
        description: `Hostname "${hostname}" contains deceptive mimicry targeting official domain "${target.domain}".`,
        riskPoints: 35,
        confidence: 'high',
        evidence: [
          `Current host: ${hostname}`,
          `Legitimate authority: ${target.domain}`,
          `Target authority: ${target.name}`
        ],
        timestamp
      });
      break;
    }
  }

  // 2. Safe Redirect Inspection (Max 4 hops, restricted environment)
  let currentDestination = submittedUrl;
  let redirectCount = 0;

  try {
    let hops = 0;
    let nextUrl = submittedUrl;

    while (hops < 4) {
      const hopUrl = new URL(nextUrl);
      if (isPrivateOrLocalIp(hopUrl.hostname)) {
        riskIndicators.push('Redirect chain targeted internal private address');
        findings.push({
          agentName: 'URL Analysis Agent',
          status: 'malicious',
          title: 'Redirect SSRF Blocked',
          description: `Redirect step ${hops + 1} attempted to pivot to private IP address ${hopUrl.hostname}.`,
          riskPoints: 40,
          confidence: 'high',
          evidence: [`Blocked redirect target: ${nextUrl}`],
          timestamp
        });
        break;
      }

      const redirectRes = await inspectRedirectHead(nextUrl);
      if (redirectRes.location && redirectRes.location !== nextUrl) {
        hops++;
        redirectCount++;
        nextUrl = redirectRes.location;
        redirectChain.push(nextUrl);
        currentDestination = nextUrl;
      } else {
        break;
      }
    }
  } catch (err: any) {
    // If redirection probing fails or times out, report as limitation
    findings.push({
      agentName: 'URL Analysis Agent',
      status: 'inconclusive',
      title: 'Redirect Probe Inconclusive',
      description: 'Redirect chain could not be fully resolved due to network timeout or restriction.',
      riskPoints: 0,
      confidence: 'low',
      evidence: [err?.message || 'Network lookup timeout'],
      limitations: 'Probing was constrained to 4 seconds to prevent denial of service.',
      timestamp
    });
  }

  if (redirectCount >= 3) {
    riskIndicators.push(`Multiple redirects observed (${redirectCount} hops)`);
    findings.push({
      agentName: 'URL Analysis Agent',
      status: 'warning',
      title: 'Extended Redirect Chain',
      description: 'Multiple redirect steps can be used to bypass domain reputation filters or obfuscate destination.',
      riskPoints: 10,
      confidence: 'medium',
      evidence: [`Hops: ${redirectCount}`, `Chain: ${redirectChain.join(' -> ')}`],
      timestamp
    });
  }

  // Check if everything looks clean
  if (findings.length === 0) {
    findings.push({
      agentName: 'URL Analysis Agent',
      status: 'passed',
      title: 'Standard Domain Structure & Secure Protocol',
      description: 'The URL uses valid HTTPS protocol, standard TLD structure, and no domain mimicry indicators.',
      riskPoints: 0,
      confidence: 'high',
      evidence: [`Verified host: ${hostname}`, `Protocol: ${protocol}`],
      timestamp
    });
  }

  return {
    submittedUrl,
    finalDestinationUrl: currentDestination,
    hostname,
    domain,
    tld,
    isHttps,
    isIpAddress: /^[\d.]+$/.test(hostname),
    subdomainDepth,
    typosquattingDetected,
    typosquattingTarget,
    redirectCount,
    redirectChain,
    riskIndicators,
    findings,
    isBlockedBySsrf: false
  };
}

// Inspect HTTP headers for redirects with strict timeout and no body download
function inspectRedirectHead(targetUrl: string): Promise<{ location?: string; statusCode?: number }> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const isSecure = parsed.protocol === 'https:';
      const client = isSecure ? https : http;

      const req = client.request(
        targetUrl,
        {
          method: 'HEAD',
          headers: {
            'User-Agent': 'ScholarShield-SecurityScanner/1.0 (+https://scholarshield.ai)'
          },
          timeout: 3000
        },
        (res) => {
          const status = res.statusCode || 200;
          if (status >= 300 && status < 400 && res.headers.location) {
            try {
              const resolved = new URL(res.headers.location, targetUrl).toString();
              resolve({ location: resolved, statusCode: status });
            } catch {
              resolve({ statusCode: status });
            }
          } else {
            resolve({ statusCode: status });
          }
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({});
      });

      req.on('error', () => {
        resolve({});
      });

      req.end();
    } catch {
      resolve({});
    }
  });
}
