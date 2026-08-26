import type { Metadata } from "next";
import Link from "next/link";
import ProjectForm from "./project-form";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Scope an immersive website, 3D product world or motion-led digital experience with QUANTUMNOVA Studio.",
};

export default function StartProjectPage() {
  return (
    <main className="brief-page">
      <div className="brief-aurora" aria-hidden="true" />
      <header className="brief-header">
        <Link className="wordmark" href="/" aria-label="Return to QUANTUMNOVA"><span className="wordmark-mark">Q</span><span>QUANTUMNOVA</span></Link>
        <Link href="/">Return to the experience</Link>
      </header>
      <section className="brief-hero">
        <p className="kicker"><span /> Project intake / QUANTUMNOVA Studio</p>
        <h1>Define the world<br />you want to build.</h1>
        <p>A useful quote starts with a useful brief. Tell us what the project must achieve, what it needs to contain and where the ambition sits.</p>
        <div className="brief-signal" aria-hidden="true"><span>Q</span><i /><i /><i /></div>
      </section>
      <section className="brief-layout">
        <aside className="brief-aside">
          <small>WHAT HAPPENS NEXT</small>
          <ol><li><span>01</span><div><b>We review the brief</b><p>Commercial goal, technical scope and creative opportunity.</p></div></li><li><span>02</span><div><b>We shape the right response</b><p>Written clarification, scoped response or focused concept preview.</p></div></li><li><span>03</span><div><b>We quote the real project</b><p>Clear deliverables, production path, timing and investment.</p></div></li></ol>
          <p className="brief-direct">Prefer direct contact?<br /><a href="mailto:admin@quantumnova.com.au">admin@quantumnova.com.au</a></p>
        </aside>
        <ProjectForm />
      </section>
      <footer className="site-footer"><span>© 2026 QUANTUMNOVA PTY LTD</span><span>ABN 43686016526</span><Link href="/">quantumnova.com.au</Link></footer>
    </main>
  );
}
