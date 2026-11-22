// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
  // Own domain since 2026-11-15: GitHub Pages custom domain page2ai.net, served at the host root, so no `base`.
  // GitHub answers the old project-site URLs (igorsaevets.github.io/page2ai-docs/<path>) with a 301 to
  // https://page2ai.net/<path>; keep every page at its path so those redirects land on a page.
  site: 'https://page2ai.net',
  // Starlight 0.43 stopped forcing `:where(.astro-HASH)` scoped selectors and follows this option, whose Astro
  // default is the higher-specificity attribute selector. Kept at 'where' so every page keeps the CSS it had on 0.42.
  scopedStyleStrategy: 'where',
  integrations: [
    starlight({
      title: 'Page2AI',
      description:
        'Convert any web page to clean Markdown for AI. Chrome extension + MCP server + npm library. By Igor Saevets.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      head: [
        {
          tag: 'meta',
          attrs: { name: 'author', content: 'Igor Saevets' },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'article:author',
            content: 'https://www.linkedin.com/in/igorsaevets/',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'me',
            href: 'https://www.linkedin.com/in/igorsaevets/',
          },
        },
        {
          tag: 'link',
          attrs: { rel: 'me', href: 'https://github.com/igorsaevets' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'me',
            href: 'https://orcid.org/0009-0006-8636-1377',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'me',
            href: 'https://www.facebook.com/igorsaevets',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'me',
            href: 'https://www.npmjs.com/~igorsaevets',
          },
        },
        // Raster icons beside Starlight's favicon.svg (public/, the Page2AI icon since 2026-11-22): /favicon.ico
        // for clients that ask for that path only, a PNG above 48x48 for Google Search (its favicon guidelines list
        // no SVG), and the iOS home-screen icon. `sizes` on the ICO keeps Chrome on the SVG.
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'icon', href: '/icon-192.png', type: 'image/png', sizes: '192x192' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/igorsaevets',
        },
        {
          icon: 'linkedin',
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/igorsaevets/',
        },
        {
          icon: 'facebook',
          label: 'Facebook',
          href: 'https://www.facebook.com/igorsaevets',
        },
        {
          icon: 'email',
          label: 'Email Igor',
          href: 'mailto:support@igorsaevets.com',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/igorsaevets/page2ai-docs/edit/main/',
      },
      lastUpdated: true,
      plugins: [starlightLlmsTxt()],
      sidebar: [
        { label: 'Overview', slug: 'index' },
        { label: 'Online converter', slug: 'convert' },
        { label: 'Install', slug: 'install' },
        { label: 'MCP server', slug: 'mcp' },
        { label: 'Comparison', slug: 'comparison' },
        { label: 'Benchmark: one docs page', slug: 'case-study-docs-page' },
        { label: 'Research: what agents could not open', slug: 'research/agent-fetch-outcomes' },
        {
          label: 'Guides',
          items: [
            {
              label: 'Webpage to Markdown Chrome extension',
              slug: 'webpage-to-markdown-chrome-extension',
            },
          ],
        },
        { label: 'About the author', slug: 'about' },
        { label: 'Privacy', slug: 'privacy' },
      ],
    }),
  ],
});
