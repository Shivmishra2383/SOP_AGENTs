export interface SOPDocument {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  content: string;
  category: string;
}

export const MOCK_SOPS: SOPDocument[] = [
  {
    id: "sop-1",
    title: "Employee Onboarding Procedure",
    description: "Detailed steps for integrating new hires into the company ecosystem.",
    uploadDate: "2024-03-15",
    category: "HR",
    content: "Standard Operating Procedure: Employee Onboarding. 1. Pre-boarding: Send welcome email and equipment requests. 2. Day One: HR induction, office tour, and setup. 3. Week One: Training sessions, team introductions. All employees must complete the security awareness training within 5 days of joining."
  },
  {
    id: "sop-2",
    title: "Remote Work Security Policy",
    description: "Guidelines and protocols for ensuring data security while working remotely.",
    uploadDate: "2024-03-10",
    category: "Security",
    content: "Standard Operating Procedure: Remote Work Security. Users must use VPN for all internal resource access. Multi-factor authentication is mandatory. No public Wi-Fi usage for sensitive operations. Report lost devices immediately to IT security."
  },
  {
    id: "sop-3",
    title: "Incident Response Protocol",
    description: "Emergency procedures for handling IT infrastructure failures.",
    uploadDate: "2024-03-01",
    category: "Operations",
    content: "Standard Operating Procedure: Incident Response. Phase 1: Identification. Phase 2: Containment. Phase 3: Eradication. Phase 4: Recovery. Critical incidents require communication to stakeholders within 30 minutes of detection."
  }
];
