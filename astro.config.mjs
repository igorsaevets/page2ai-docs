// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
  site: 'https://igorsaevets.github.io',
  base: '/page2ai-docs',
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
        { label: 'Install', slug: 'install' },
        { label: 'MCP server', slug: 'mcp' },
        { label: 'Comparison', slug: 'comparison' },
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
