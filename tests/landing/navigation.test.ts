import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const NAVIGATION_SOURCES = [
  "components/sections/marketing-footer.tsx",
  "components/nav/marketing-nav.tsx",
  "features/landing/components/IntelligenceStreamNav.tsx",
];

const SECTION_SOURCE_DIRS = [
  "components/sections",
  "features/landing/components",
];

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

/** Every `id` an anchor could land on, taken from the components themselves. */
function landingSectionIds(): Set<string> {
  const ids = new Set<string>();
  for (const dir of SECTION_SOURCE_DIRS) {
    for (const file of readdirSync(join(ROOT, dir))) {
      if (!file.endsWith(".tsx")) continue;
      const source = read(join(dir, file));
      for (const match of source.matchAll(
        /<(?:section|div)[^>]*\bid="([a-z0-9-]+)"/g,
      )) {
        ids.add(match[1]!);
      }
    }
  }
  return ids;
}

/** Routes that actually exist, so a `/contact` link cannot rot unnoticed. */
function publicRoutes(): Set<string> {
  const routes = new Set<string>();
  const walk = (dir: string, segments: string[]) => {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      if (entry.isDirectory()) {
        // Route groups like (public) do not appear in the URL.
        const segment = /^\(.*\)$/.test(entry.name) ? null : entry.name;
        walk(
          join(dir, entry.name),
          segment ? [...segments, segment] : segments,
        );
      } else if (entry.name === "page.tsx") {
        routes.add("/" + segments.join("/"));
      }
    }
  };
  walk("app", []);
  return routes;
}

function navigationTargets(): { source: string; href: string }[] {
  return NAVIGATION_SOURCES.flatMap((source) =>
    [...read(source).matchAll(/href: '([^']+)'/g)].map((match) => ({
      source,
      href: match[1]!,
    })),
  );
}

test("every nav and footer link points at a section or route that exists", () => {
  const ids = landingSectionIds();
  const routes = publicRoutes();
  const targets = navigationTargets();

  assert.ok(targets.length > 0, "found no navigation links to check");

  const broken = targets.filter(({ href }) => {
    if (href.startsWith("/#")) return !ids.has(href.slice(2));
    if (href.startsWith("/")) return !routes.has(href);
    // A bare '#anchor' is what breaks on /auth/*, where this nav also renders.
    return true;
  });

  assert.deepEqual(
    broken.map(({ source, href }) => `${href} (${source})`),
    [],
  );
});

test("landing anchors are root-relative so they survive off the landing page", () => {
  for (const source of NAVIGATION_SOURCES) {
    const bareHashes = [...read(source).matchAll(/href: '(#[^']+)'/g)].map(
      (match) => match[1]!,
    );
    assert.deepEqual(
      bareHashes,
      [],
      `${source} has bare hash links, which go nowhere off '/'`,
    );
  }
});

test("each landing section id is declared exactly once", () => {
  const seen = new Map<string, string[]>();
  for (const dir of SECTION_SOURCE_DIRS) {
    for (const file of readdirSync(join(ROOT, dir))) {
      if (!file.endsWith(".tsx")) continue;
      for (const match of read(join(dir, file)).matchAll(
        /<(?:section|div)[^>]*\bid="([a-z0-9-]+)"/g,
      )) {
        const id = match[1]!;
        seen.set(id, [...(seen.get(id) ?? []), file]);
      }
    }
  }

  const duplicated = [...seen.entries()].filter(
    ([, files]) => files.length > 1,
  );
  assert.deepEqual(duplicated, []);
});
