/**
 * Structured-data helpers (schema.org). Inlined as <script type="application/ld+json">
 * tags on detail pages so search and social engines can extract talks /
 * essays without relying on heuristics.
 */

const SITE = "https://niallhighland.com";
const PERSON = {
  "@type": "Person" as const,
  name: "Niall Highland",
  jobTitle: "Associate Principal",
  worksFor: {
    "@type": "EducationalOrganization",
    name: "International School of Krakow",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Krakow",
      addressCountry: "Poland",
    },
  },
  url: SITE,
};

interface BlogPostingProps {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  tags?: ReadonlyArray<string>;
  imageUrl?: string;
}

export function BlogPostingJsonLd({
  url,
  title,
  description,
  datePublished,
  tags,
  imageUrl,
}: BlogPostingProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    author: PERSON,
    publisher: PERSON,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: tags?.join(", "),
    image: imageUrl,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface TalkJsonLdProps {
  url: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  audience?: string;
  recordingUrl?: string;
  imageUrl?: string;
}

/**
 * Talks are modelled as Article (the canonical write-up of the talk)
 * with a recordedAt PresentationDigitalDocument when a recording is
 * available, plus an Event for the original delivery. This is the
 * shape Google understands best for "talk by author at venue".
 */
export function TalkJsonLd({
  url,
  title,
  description,
  date,
  venue,
  audience,
  recordingUrl,
  imageUrl,
}: TalkJsonLdProps) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    author: PERSON,
    publisher: PERSON,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: imageUrl,
    isBasedOn: recordingUrl,
  };
  const event = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description,
    startDate: date,
    endDate: date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: venue,
    },
    audience: audience
      ? { "@type": "Audience", audienceType: audience }
      : undefined,
    performer: PERSON,
    organizer: PERSON,
    url,
  };
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
      />
    </>
  );
}

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    ...PERSON,
    sameAs: [
      "https://www.linkedin.com/in/niall-highland",
    ],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
