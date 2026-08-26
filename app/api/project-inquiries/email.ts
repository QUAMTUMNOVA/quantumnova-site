export type ProjectInquiryEmail = {
  id: number | string;
  name: string;
  email: string;
  company: string;
  website: string;
  projectTypes: string[];
  features: string[];
  goals: string;
  audience: string;
  budget: string;
  timeline: string;
  brief: string;
  references: string;
};

type NotificationEnvironment = {
  RESEND_API_KEY?: string;
  PROJECT_INQUIRY_TO?: string;
  PROJECT_INQUIRY_FROM?: string;
};

type NotificationResult =
  | { sent: true }
  | { sent: false; reason: "not-configured" | "provider-error" };

const defaultRecipient = "admin@quantumnova.com.au";
const defaultSender =
  "QUANTUMNOVA Website <projects@notifications.quantumnova.com.au>";

function runtimeEnvironment() {
  return process.env as NotificationEnvironment;
}

function supplied(value: string) {
  return value || "Not supplied";
}

function listed(values: string[]) {
  return values.length ? values.join(", ") : "None selected";
}

function referenceFor(id: number | string) {
  return typeof id === "number" ? String(id).padStart(5, "0") : id;
}

export function projectInquiryEmailText(inquiry: ProjectInquiryEmail) {
  return [
    "NEW QUANTUMNOVA PROJECT INQUIRY",
    `Reference: QN-${referenceFor(inquiry.id)}`,
    "",
    "CONTACT",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company or brand: ${supplied(inquiry.company)}`,
    `Current website: ${supplied(inquiry.website)}`,
    "",
    "PROJECT",
    `Project types: ${listed(inquiry.projectTypes)}`,
    `Capabilities: ${listed(inquiry.features)}`,
    `Budget: ${inquiry.budget}`,
    `Timing: ${inquiry.timeline}`,
    "",
    "GOALS",
    inquiry.goals,
    "",
    "AUDIENCE",
    supplied(inquiry.audience),
    "",
    "BRIEF",
    inquiry.brief,
    "",
    "REFERENCES",
    supplied(inquiry.references),
    "",
    "Reply directly to this email to contact the prospective client.",
  ].join("\n");
}

export async function sendProjectInquiryEmail(
  inquiry: ProjectInquiryEmail,
): Promise<NotificationResult> {
  const environment = runtimeEnvironment();
  const apiKey = environment.RESEND_API_KEY?.trim();
  if (!apiKey) return { sent: false, reason: "not-configured" };

  const recipient =
    environment.PROJECT_INQUIRY_TO?.trim() || defaultRecipient;
  const sender = environment.PROJECT_INQUIRY_FROM?.trim() || defaultSender;
  const subjectName = (inquiry.company || inquiry.name)
    .replace(/[\r\n]+/g, " ")
    .slice(0, 120);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `qnova-project-inquiry-${referenceFor(inquiry.id)}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: inquiry.email,
        subject: `[QN-${referenceFor(inquiry.id)}] Project inquiry from ${subjectName}`,
        text: projectInquiryEmailText(inquiry),
      }),
    });

    if (!response.ok) return { sent: false, reason: "provider-error" };
    return { sent: true };
  } catch {
    return { sent: false, reason: "provider-error" };
  }
}
