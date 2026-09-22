import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Store } from 'lucide-react';

/**
 * Real 404 page.
 *
 * Previously any unknown path silently redirected to "/", which made typos and
 * dead links look like the site had simply thrown the visitor back to the
 * homepage. Showing an actual 404 tells them what happened and offers a way on.
 */
export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found · Indian Local Store';
  }, []);

  return (
    <div className="page" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '540px' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 1.75rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,107,53,0.12)',
            border: '1px solid rgba(255,107,53,0.25)',
          }}
        >
          <Compass size={32} color="#FF6B35" />
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#FF6B35',
            marginBottom: '0.75rem',
          }}
        >
          Error 404
        </p>

        <h1 style={{ marginBottom: '1rem' }}>We couldn't find that page</h1>

        <p style={{ lineHeight: 1.75, opacity: 0.72, marginBottom: '2.25rem' }}>
          The link may be out of date, or the shop or product may no longer be
          listed. Everything else is still where you left it.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Back to homepage
          </Link>
          <Link to="/shops" className="btn btn-secondary">
            <Store size={16} /> Browse local shops
          </Link>
        </div>
      </div>
    </div>
  );
}
