import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Catches render-time errors anywhere below it and shows a recoverable screen
 * instead of a blank page.
 *
 * This has to be a class component: React exposes no hook equivalent of
 * componentDidCatch. Without a boundary, one thrown error in any page unmounts
 * the entire tree and the visitor is left staring at an empty white document
 * with no way forward except knowing to reload.
 *
 * Note what this does *not* catch: errors inside event handlers, promise
 * rejections, and failed API calls. Those are handled where they happen -- the
 * axios interceptor and per-page try/catch blocks.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Kept as console.error so the stack is still visible in the browser
    // console and in any error-reporting tool wired up later.
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // A full navigation rather than router navigation, so the broken component
    // tree is torn down completely instead of being re-rendered in place.
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0B0F14',
          color: '#F0F4FF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,107,53,0.12)',
              border: '1px solid rgba(255,107,53,0.25)',
            }}
          >
            <AlertTriangle size={28} color="#FF6B35" />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>

          <p style={{ lineHeight: 1.7, opacity: 0.75, marginBottom: '2rem' }}>
            This page hit an unexpected error. Your cart and account are safe —
            reloading usually clears it. If it keeps happening, let us know at{' '}
            <a
              href="mailto:stiratechindianlocalstore@gmail.com"
              style={{ color: '#FF6B35' }}
            >
              stiratechindianlocalstore@gmail.com
            </a>
            .
          </p>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: '#FF6B35',
                color: '#fff',
              }}
            >
              <RefreshCw size={16} /> Reload page
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: 'transparent',
                color: '#F0F4FF',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <Home size={16} /> Go to homepage
            </button>
          </div>

          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: '2rem',
                padding: '1rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                lineHeight: 1.6,
                overflowX: 'auto',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FF9F7A',
              }}
            >
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
