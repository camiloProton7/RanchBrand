import {Link, useLoaderData} from 'react-router';
import {getPost} from '~/lib/blog';
import blogStyles from '~/styles/blog.css?url';

export const links = () => [{rel: 'stylesheet', href: blogStyles}];

export function loader({params}) {
  const post = getPost(params.slug);
  if (!post) {
    throw new Response('Not Found', {status: 404});
  }
  return {post};
}

export const meta = ({data}) => {
  const post = data?.post;
  if (!post) return [{title: 'Artículo no encontrado — The Ranch'}];
  return [
    {title: `${post.title} — The Ranch`},
    {name: 'description', content: post.excerpt},
    {property: 'og:title', content: post.title},
    {property: 'og:description', content: post.excerpt},
    {property: 'og:type', content: 'article'},
    {property: 'og:url', content: `https://ranch.com.co/blog/${post.slug}`},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://ranch.com.co/blog/${post.slug}`,
    },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: {'@type': 'Organization', name: 'The Ranch'},
        publisher: {'@type': 'Organization', name: 'The Ranch'},
      },
    },
  ];
};

export default function BlogPost() {
  const {post} = useLoaderData();
  return (
    <article className="blog-post">
      <Link to="/blog" className="blog-back">
        ← Volver al blog
      </Link>
      <header className="blog-post-head">
        <span className="blog-card-cat">{post.category}</span>
        <h1 className="blog-post-title">{post.title}</h1>
        <time className="blog-post-date">{post.date}</time>
      </header>
      <div className="blog-post-body">
        {post.blocks.map((block, i) => {
          if (block.type === 'h2') {
            return (
              <h2 key={i} className="blog-h2">
                {block.text}
              </h2>
            );
          }
          if (block.type === 'ul') {
            return (
              <ul key={i} className="blog-ul">
                {block.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="blog-p">
              {block.text}
            </p>
          );
        })}
      </div>
      <Link to="/blog" className="blog-back">
        ← Volver al blog
      </Link>
    </article>
  );
}
