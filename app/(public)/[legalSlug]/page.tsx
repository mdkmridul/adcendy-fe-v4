'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { legalRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { LegalMarkdown } from '@/shared/legal/LegalMarkdown';

const LEGAL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A published policy. The Backend decides which policies exist and where
 * each is published (e.g. /terms); this page shows whatever is active at the
 * requested path, and 404s for any path the Backend does not publish.
 */
export default function LegalDocumentPage() {
  const { legalSlug } = useParams<{ legalSlug: string }>();
  const validSlug = typeof legalSlug === 'string' && LEGAL_SLUG_PATTERN.test(legalSlug);
  const path = `/${legalSlug}`;

  const documentQuery = useQuery({
    queryKey: queryKeys.legal.documentByPath(path),
    queryFn: () => legalRepository.getPublicDocumentByPath(path),
    enabled: validSlug,
    refetchOnWindowFocus: false,
  });

  if (!validSlug || documentQuery.data === null) notFound();

  const document = documentQuery.data;

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-16 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Legal</p>
        {documentQuery.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : documentQuery.isError || !document ? (
          <p className="mt-6 text-sm text-muted-foreground">
            This policy could not be loaded. Please refresh the page.
          </p>
        ) : (
          <>
            <title>{`${document.title} | AdCendy`}</title>
            <h1 className="mt-3 font-space-grotesk text-4xl font-bold sm:text-5xl">{document.title}</h1>
            <LegalMarkdown markdown={document.content} className="legal-prose mt-10" />
          </>
        )}
        <Link href="/" className="mt-12 inline-block text-sm text-primary hover:underline">
          Back to home
        </Link>
      </article>
    </main>
  );
}
