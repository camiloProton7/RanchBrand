import {Link} from 'react-router';
import {POSTS} from '~/lib/blog';
import blogStyles from '~/styles/blog.css?url';

export const links = () => [{rel: 'stylesheet', href: blogStyles}];

export const meta = () => [
  {title: 'Blog — The Ranch'},
  {
    name: 'description',
    content:
      'Guías de estilo, cuidado y novedades de The Ranch. Gorras trucker, chaquetas y camisetas premium en Colombia.',
  },
  {property: 'og:title', content: 'Blog — The Ranch'},
  {property: 'og:type', content: 'website'},
  {property: 'og:url', content: 'https://ranch.com.co/blog'},
  {tagName: 'link', rel: 'canonical', href: 'https://ranch.com.co/blog'},
];

export default function BlogIndex() {
  return (
    <div className="blog">
      <header className="blog-hero">
        <h1 className="blog-title">El Blog del Ranch</h1>
        <p className="blog-subtitle">
          Guías, estilo y cuidado de tus piezas favoritas.
        </p>
      </header>

      <div className="blog-grid">
        {POSTS.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
            <span className="blog-card-cat">{post.category}</span>
            <h2 className="blog-card-title">{post.title}</h2>
            <p className="blog-card-excerpt">{post.excerpt}</p>
            <span className="blog-card-date">{post.date}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
