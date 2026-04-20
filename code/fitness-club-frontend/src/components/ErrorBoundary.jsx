import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FitnessClub UI error boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] text-[#1A1A1A] flex items-center justify-center px-6">
          <div className="max-w-2xl w-full border border-[#E5E5E5] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-[#C9A96E] mb-4">
              Application Error
            </p>
            <h1 className="text-3xl font-bold tracking-[-0.02em] mb-4">
              A screen failed to render.
            </h1>
            <p className="text-[15px] leading-[1.7] text-[#6B6B6B] mb-6">
              The exact error has been logged to the browser console so it will not disappear.
            </p>
            <div className="bg-[#111] text-white p-4 rounded-md font-mono text-sm break-words mb-6">
              {this.state.error?.message || 'Unknown rendering error'}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="bg-[#111] text-white text-[0.85rem] font-medium px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
