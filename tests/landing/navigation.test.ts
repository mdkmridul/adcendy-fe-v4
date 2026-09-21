import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LANDING_SECTIONS,
  LANDING_SUB_TARGETS,
} from "../../features/landing/landing-sections.ts";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const NAVIGATION_SOURCES = [
  "components/sections/marketing-footer.tsx",
  "components/nav/marketing-nav.tsx",
  "features/landing/components/IntelligenceStreamNav.tsx",
];

const LANDING_COMPOSITIONS = [
  "features/landing/components/LandingPageV1.tsx",
  "features/landing/components/LandingPageV2.tsx",
];

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

/** The section files each landing variant actually mounts. */
function mountedSectionFiles(composition: string): string[] {
  const source = read(composition);
  const files = [
    ...source.matchAll(/import\('@\/components\/sections\/([\w-]+)'\)/g),
    ...source.matchAll(/from '@\/components\/sections\/([\w-]+)'/g),
  ].map((match) => `components/sections/${match[1]}.tsx`);
  return [...new Set(files)];
}

/** Every id declared on an element in these files — literal or data-driven. */
function declaredIds(files: string[]): string[] {
  return files.flatMap((file) => {
    const source = read(file);
    return [
      ...[...source.matchAll(/\bid="([a-z0-9-]+)"/g)].map((m) => m[1]!),
      // An FAQ entry that can be linked to carries its id as data.
      ...[...source.matchAll(/\bid: '([a-z0-9-]+)'/g)].map((m) => m[1]!),
    ];
  });
}

function publicRoutes(): Set<string> {
  const routes = new Set<string>();
  const walk = (dir: string, segments: string[]) => {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const segment = /^\(.*\)$/.test(entry.name) ? null : entry.name;
        walk(join(dir, entry.name), segment ? [...segments, segment] : segments);
      } else if (entry.name === "page.tsx") {
        routes.add("/" + segments.join("/"));
      }
    }
  };
  walk("app", []);
  return routes;
}

const ALL_TARGETS = [
  ...Object.values(LANDING_SECTIONS),
  ...Object.values(LANDING_SUB_TARGETS),
];

for (const composition of LANDING_COMPOSITIONS) {
  test(`every nav and footer target lands exactly once in ${composition.split("/").pop()}`, () => {
    const ids = declaredIds(mountedSectionFiles(composition));
    const problems = ALL_TARGETS.flatMap(({ id }) => {
      const count = ids.filter((declared) => declared === id).length;
      return count === 1 ? [] : [`#${id} declared ${count} times`];
    });
    assert.deepEqual(problems, []);
  });
}

test("navs and footer link sections only through the shared list", () => {
  // A hand-written '/#pricing' can drift from the page; SectionLink with an
  // id from LANDING_SECTIONS cannot. It also scrolls on a repeat click, which
  // a plain hash link does not.
  for (const source of NAVIGATION_SOURCES) {
    const handWritten = [...read(source).matchAll(/href[:=]\s*['"{`][^'"`}]*#/g)].map(
      (match) => match[0],
    );
    assert.deepEqual(handWritten, [], `${source} hand-writes a section link`);
    assert.match(read(source), /SectionLink/, `${source} does not use SectionLink`);
  }
});

test("every page link in the footer points at a route that exists", () => {
  const routes = publicRoutes();
  const pageLinks = [
    ...read("components/sections/marketing-footer.tsx").matchAll(/href: '([^']+)'/g),
  ].map((match) => match[1]!);

  assert.ok(pageLinks.length > 0, "found no page links to check");
  assert.deepEqual(
    pageLinks.filter((href) => !routes.has(href)),
    [],
  );
});

test("each nav label is used once, so two links never claim the same place", () => {
  const labels = ALL_TARGETS.map(({ label }) => label);
  assert.deepEqual(
    labels.filter((label, i) => labels.indexOf(label) !== i),
    [],
  );
});
