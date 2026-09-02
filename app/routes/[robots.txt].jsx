export function loader() {
  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://ranch.com.co/sitemap.xml',
  ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=3600',
    },
  });
}
