import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="section-title">Contact</h1>
        <p className="mt-4 text-ink-600">
          Multi-branch deployments, more than 5 counties, or enterprise
          licensing — drop us a note.
        </p>
        <form
          action="/api/contact"
          method="POST"
          className="mt-8 space-y-5 card"
        >
          <div>
            <label className="label" htmlFor="name">Your name</label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="branch">Branch / organization</label>
            <input id="branch" name="branch" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="message">What are you trying to do?</label>
            <textarea id="message" name="message" rows={5} className="input" />
          </div>
          <button type="submit" className="btn-primary">Send</button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
