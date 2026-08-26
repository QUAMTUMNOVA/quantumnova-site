import { sendProjectInquiryEmail } from "./email";

type InquiryPayload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  website?: unknown;
  projectTypes?: unknown;
  features?: unknown;
  goals?: unknown;
  audience?: unknown;
  budget?: unknown;
  timeline?: unknown;
  brief?: unknown;
  references?: unknown;
  consent?: unknown;
  contactTime?: unknown;
};

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanList(value: unknown, maximumItems: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, maximumItems);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidOptionalUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as InquiryPayload;
    if (cleanText(payload.contactTime, 200)) {
      return Response.json({ received: true }, { status: 201 });
    }

    const name = cleanText(payload.name, 120);
    const email = cleanText(payload.email, 180).toLowerCase();
    const company = cleanText(payload.company, 180);
    const website = cleanText(payload.website, 400);
    const projectTypes = cleanList(payload.projectTypes, 8);
    const features = cleanList(payload.features, 12);
    const goals = cleanText(payload.goals, 3000);
    const audience = cleanText(payload.audience, 1800);
    const budget = cleanText(payload.budget, 80);
    const timeline = cleanText(payload.timeline, 160);
    const brief = cleanText(payload.brief, 6000);
    const references = cleanText(payload.references, 2400);
    const consent = payload.consent === true;

    if (name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!isValidOptionalUrl(website)) {
      return Response.json({ error: "Please enter a complete website URL, including https://." }, { status: 400 });
    }
    if (!projectTypes.length) {
      return Response.json({ error: "Please select at least one project type." }, { status: 400 });
    }
    if (goals.length < 20 || brief.length < 30) {
      return Response.json({ error: "Please add a little more detail about your goals and project." }, { status: 400 });
    }
    if (!budget || !timeline) {
      return Response.json({ error: "Please select a budget range and target timeline." }, { status: 400 });
    }
    if (!consent) {
      return Response.json({ error: "Please confirm that we can contact you about this project." }, { status: 400 });
    }

    const dateCode = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const inquiryId = `${dateCode}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const notification = await sendProjectInquiryEmail({
      id: inquiryId,
      name,
      email,
      company,
      website,
      projectTypes,
      features,
      goals,
      audience,
      budget,
      timeline,
      brief,
      references,
    });

    if (!notification.sent) {
      return Response.json(
        { error: "Your brief could not be delivered just now. Please try again." },
        { status: 503 },
      );
    }

    return Response.json(
      {
        received: true,
        inquiryId,
        notificationSent: true,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "We could not deliver your brief just now. Please try again." },
      { status: 500 },
    );
  }
}
