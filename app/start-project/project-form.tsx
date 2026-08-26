"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const projectTypes = [
  "Immersive brand website",
  "3D product world",
  "Ecommerce experience",
  "Campaign or launch",
  "Website redesign",
  "Something new",
];

const featureOptions = [
  "3D models",
  "Motion and animation",
  "Ecommerce",
  "Content management",
  "Audio integration",
  "Interactive storytelling",
  "Accessibility planning",
  "Multilingual content",
];

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id?: number | string; notificationSent: boolean }
  | { status: "error"; message: string };

export default function ProjectForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ status: "submitting" });
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      website: formData.get("website"),
      projectTypes: formData.getAll("projectTypes"),
      features: formData.getAll("features"),
      goals: formData.get("goals"),
      audience: formData.get("audience"),
      budget: formData.get("budget"),
      timeline: formData.get("timeline"),
      brief: formData.get("brief"),
      references: formData.get("references"),
      consent: formData.get("consent") === "yes",
      contactTime: formData.get("contactTime"),
    };

    try {
      const response = await fetch("/api/project-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        inquiryId?: number | string;
        notificationSent?: boolean;
      };
      if (!response.ok) throw new Error(result.error || "Your brief could not be submitted.");
      form.reset();
      setSubmitState({
        status: "success",
        id: result.inquiryId,
        notificationSent: result.notificationSent === true,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "Your brief could not be submitted.",
      });
    }
  };

  if (submitState.status === "success") {
    return (
      <div className="brief-success" role="status">
        <span>BRIEF RECEIVED</span>
        <h2>Your project is now on our radar.</h2>
        <p>
          {submitState.notificationSent
            ? "A complete copy has been delivered to our studio inbox. We will review the scope and respond with the next useful step."
            : "Your brief is securely recorded for review. We will assess the scope and respond with the next useful step."}
        </p>
        {submitState.id ? <small>REFERENCE / QN-{typeof submitState.id === "number" ? String(submitState.id).padStart(5, "0") : submitState.id}</small> : null}
        <div>
          <Link className="primary-action" href="/">Return to the experience <span>↗</span></Link>
          <button type="button" className="text-button" onClick={() => setSubmitState({ status: "idle" })}>Send another brief</button>
        </div>
      </div>
    );
  }

  return (
    <form className="project-form" onSubmit={submit}>
      <div className="form-section-heading"><span>01</span><div><small>THE BASICS</small><h2>Who are we building for?</h2></div></div>
      <div className="form-grid two-columns">
        <label><span>Name *</span><input name="name" autoComplete="name" required maxLength={120} placeholder="Your name" /></label>
        <label><span>Email *</span><input name="email" type="email" autoComplete="email" required maxLength={180} placeholder="you@company.com" /></label>
        <label><span>Company or brand</span><input name="company" autoComplete="organization" maxLength={180} placeholder="Brand name" /></label>
        <label><span>Current website</span><input name="website" type="url" inputMode="url" maxLength={400} placeholder="https://" /></label>
      </div>

      <fieldset>
        <legend><span>02</span><div><small>THE SHAPE</small><h2>What are we creating?</h2></div></legend>
        <div className="choice-grid project-type-grid">
          {projectTypes.map((option) => <label className="choice-card" key={option}><input type="checkbox" name="projectTypes" value={option} /><span><i aria-hidden="true" />{option}</span></label>)}
        </div>
      </fieldset>

      <div className="form-section-heading"><span>03</span><div><small>THE OUTCOME</small><h2>What must the experience achieve?</h2></div></div>
      <div className="form-grid">
        <label><span>Goals *</span><textarea name="goals" required minLength={20} maxLength={3000} rows={5} placeholder="What should change for the business or audience when this launches?" /></label>
        <label><span>Audience</span><textarea name="audience" maxLength={1800} rows={4} placeholder="Who needs to notice, understand, feel or act?" /></label>
      </div>

      <fieldset>
        <legend><span>04</span><div><small>THE SYSTEM</small><h2>Which capabilities matter?</h2></div></legend>
        <div className="choice-grid feature-grid">
          {featureOptions.map((option) => <label className="choice-card compact" key={option}><input type="checkbox" name="features" value={option} /><span><i aria-hidden="true" />{option}</span></label>)}
        </div>
      </fieldset>

      <div className="form-section-heading"><span>05</span><div><small>THE PARAMETERS</small><h2>Budget, timing and detail.</h2></div></div>
      <div className="form-grid two-columns">
        <label><span>Indicative budget *</span><select name="budget" required defaultValue=""><option value="" disabled>Select a range</option><option>Under $10,000 AUD</option><option>$10,000 to $25,000 AUD</option><option>$25,000 to $50,000 AUD</option><option>$50,000 to $100,000 AUD</option><option>$100,000+ AUD</option><option>Need guidance</option></select></label>
        <label><span>Target timing *</span><select name="timeline" required defaultValue=""><option value="" disabled>Select timing</option><option>As soon as practical</option><option>Within 1 to 2 months</option><option>Within 3 to 4 months</option><option>Within 5 to 6 months</option><option>More than 6 months</option><option>Not fixed yet</option></select></label>
      </div>
      <div className="form-grid">
        <label><span>Project brief *</span><textarea name="brief" required minLength={30} maxLength={6000} rows={8} placeholder="Tell us what exists today, what is not working, what must be included and anything that would make this project exceptional." /></label>
        <label><span>References</span><textarea name="references" maxLength={2400} rows={4} placeholder="Links to sites, products, campaigns or visual references you want us to understand." /></label>
      </div>

      <label className="honeypot" aria-hidden="true"><span>Contact time</span><input name="contactTime" tabIndex={-1} autoComplete="off" /></label>
      <label className="consent-row"><input type="checkbox" name="consent" value="yes" required /><span>I agree that QUANTUMNOVA may contact me about this project and use the information above to prepare a response.</span></label>

      {submitState.status === "error" ? <p className="form-error" role="alert">{submitState.message}</p> : null}
      <button className="submit-brief" type="submit" disabled={submitState.status === "submitting"}><span>{submitState.status === "submitting" ? "TRANSMITTING BRIEF" : "SUBMIT PROJECT BRIEF"}</span><b>{submitState.status === "submitting" ? "···" : "↗"}</b></button>
      <p className="form-privacy">Your brief is sent securely to our project inbox. It is not added to a marketing list.</p>
    </form>
  );
}
