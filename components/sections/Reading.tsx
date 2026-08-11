import { EditorialSection } from "@/components/primitives/EditorialSection";
import {
  getOneUsefulThing,
  ONE_USEFUL_THING_URL,
} from "@/lib/reading";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * "Staying current" — a home-page beat positioning Niall as someone who reads
 * the frontier, not just talks about it. Pulls the latest posts from Ethan
 * Mollick's One Useful Thing (server-fetched, cached daily) and links out.
 * Degrades to a single static link if the feed is unavailable.
 */
export async function Reading() {
  const items = await getOneUsefulThing(3);

  return (
    <EditorialSection container="wide" padding="default" eyebrow="Staying current">
      <div className="grid gap-[var(--space-8)] md:grid-cols-[auto_1fr] md:items-start">
        <h2 className="font-display text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[-0.02em] [text-wrap:balance]">
          The field moves weekly.{" "}
          <span className="text-[color:var(--accent)]">
            Here&rsquo;s where I keep my footing.
          </span>
        </h2>
      </div>

      <p className="mt-[var(--space-6)] max-w-[var(--width-reading)] text-[length:var(--text-lead)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
        The single source I recommend most to leaders trying to keep pace is
        Ethan Mollick&rsquo;s{" "}
        <a
          href={ONE_USEFUL_THING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--accent)] underline decoration-1 underline-offset-4 hover:text-[color:var(--signal)]"
        >
          One Useful Thing
        </a>
        . A few of his most recent pieces:
      </p>

      {items.length > 0 ? (
        <ul className="mt-[var(--space-12)] grid gap-[var(--space-8)] md:grid-cols-3">
          {items.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col border-t-2 border-[color:var(--border)] pt-[var(--space-6)] transition-colors hover:border-[color:var(--accent)]"
              >
                <span className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)]">
                  {formatDate(item.date)}
                </span>
                <h3 className="mt-[var(--space-3)] font-display text-[length:var(--text-h3)] leading-[1.2] text-[color:var(--text)] transition-colors group-hover:text-[color:var(--accent)] [text-wrap:balance]">
                  {item.title}
                </h3>
                {item.subtitle ? (
                  <p className="mt-[var(--space-3)] flex-1 text-[length:var(--text-small)] leading-[1.5] text-[color:var(--text-muted)]">
                    {item.subtitle}
                  </p>
                ) : null}
                <span className="mt-[var(--space-6)] font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
                  One Useful Thing · Ethan Mollick
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-[var(--space-8)]">
          <a
            href={ONE_USEFUL_THING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[var(--space-2)] font-mono text-[var(--text-small)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)] hover:text-[color:var(--signal)]"
          >
            Read One Useful Thing <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
      )}
    </EditorialSection>
  );
}
