import React from 'react';

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-default)] font-graphik p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-[var(--fg-text-contrast)] mb-2">
            Domlii Dashboard Theme
          </h1>
          <p className="text-[var(--fg-text)]">
            A comprehensive design system based on your Figma specifications
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-[var(--fg-text-contrast)]">Color Palette</h2>
          
          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-3">Primary (Green)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-solid)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Primary</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#39996B</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-solid-hover)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Hover</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#2E8055</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-bg)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Background</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#CCEFDC</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-bg-subtle)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Subtle</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#E6F7ED</p>
              </div>
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-3">Secondary (Yellow)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--secondary-solid)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Secondary</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#FABB17</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--secondary-solid-hover)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Hover</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#E1A325</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--secondary-bg)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Background</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#FCF4D6</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--secondary-bg-subtle)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Subtle</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#FDF9E8</p>
              </div>
            </div>
          </div>

          {/* Background Colors */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-3">Backgrounds</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--bg-default)] border border-[var(--fg-border)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Default</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#FFFDF8</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--bg-base)] border border-[var(--fg-border)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Base</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#FFFFFF</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--bg-bg-subtle)] border border-[var(--fg-border)] rounded-lg shadow-sm mb-2"></div>
                <p className="text-sm text-[var(--fg-text)]">Sidebar</p>
                <p className="text-xs font-mono text-[var(--fg-solid-hover)]">#FFF9E8</p>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-[var(--fg-text-contrast)]">Components</h2>
          
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-4">Buttons</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="theme-button-primary">
                <span className="mr-2">+</span>
                Create scholarship
              </button>
              <button className="px-4 py-2 border border-[var(--fg-border)] bg-[var(--bg-base)] text-[var(--fg-text-contrast)] rounded-lg hover:bg-[var(--bg-bg-hover)] transition-colors">
                Secondary Button
              </button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-4">Status Badges</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="theme-badge theme-badge-published">
                <div className="theme-badge-dot theme-badge-dot-published"></div>
                Published
              </div>
              <div className="theme-badge theme-badge-review">
                <div className="theme-badge-dot theme-badge-dot-review"></div>
                Review
              </div>
              <div className="theme-badge theme-badge-success">
                <div className="theme-badge-dot theme-badge-dot-success"></div>
                Active
              </div>
              <div className="theme-badge theme-badge-sponsored">
                <div className="theme-badge-dot theme-badge-dot-sponsored"></div>
                Sponsored
              </div>
              <div className="theme-badge theme-badge-warning">
                <div className="theme-badge-dot theme-badge-dot-warning"></div>
                Warning
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-4">Tabs</h3>
            <div className="border-b border-[var(--fg-border)]">
              <div className="flex gap-6">
                <button className="theme-tab-active pb-4 px-2 border-b-2 border-transparent">
                  Scholarships
                </button>
                <button className="theme-tab-inactive pb-4 px-2 border-b-2 border-transparent">
                  Applications
                </button>
                <button className="theme-tab-inactive pb-4 px-2 border-b-2 border-transparent">
                  Recipients
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-4">Search</h3>
            <div className="max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[var(--fg-solid-hover)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  className="theme-search pl-10 pr-4 py-3 w-full focus:ring-2 focus:ring-[var(--primary-solid)] focus:border-transparent outline-none" 
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>

          {/* Sample Table */}
          <div>
            <h3 className="text-lg font-medium text-[var(--fg-text-contrast)] mb-4">Table Example</h3>
            <div className="theme-table">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="theme-table-header text-left">Name</th>
                      <th className="theme-table-header text-left">Status</th>
                      <th className="theme-table-header text-left">Applications</th>
                      <th className="theme-table-header text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="theme-table-cell">
                        <div className="font-medium text-[var(--fg-text-contrast)]">Excellence Scholarship</div>
                      </td>
                      <td className="theme-table-cell">
                        <div className="theme-badge theme-badge-success">
                          <div className="theme-badge-dot theme-badge-dot-success"></div>
                          Active
                        </div>
                      </td>
                      <td className="theme-table-cell">127</td>
                      <td className="theme-table-cell">$5,000</td>
                    </tr>
                    <tr>
                      <td className="theme-table-cell">
                        <div className="font-medium text-[var(--fg-text-contrast)]">Merit Award</div>
                      </td>
                      <td className="theme-table-cell">
                        <div className="theme-badge theme-badge-review">
                          <div className="theme-badge-dot theme-badge-dot-review"></div>
                          Review
                        </div>
                      </td>
                      <td className="theme-table-cell">89</td>
                      <td className="theme-table-cell">$3,000</td>
                    </tr>
                    <tr>
                      <td className="theme-table-cell">
                        <div className="font-medium text-[var(--fg-text-contrast)]">Innovation Grant</div>
                      </td>
                      <td className="theme-table-cell">
                        <div className="theme-badge theme-badge-published">
                          <div className="theme-badge-dot theme-badge-dot-published"></div>
                          Published
                        </div>
                      </td>
                      <td className="theme-table-cell">45</td>
                      <td className="theme-table-cell">$2,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-[var(--fg-text-contrast)]">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-semibold text-[var(--fg-text-contrast)] font-graphik">
                Heading 1 - Graphik Font
              </h1>
              <p className="text-sm text-[var(--fg-solid-hover)] mt-1">Font: Graphik, Size: 36px, Weight: 600</p>
            </div>
            <div>
              <h2 className="text-3xl font-medium text-[var(--fg-text-contrast)] font-graphik">
                Heading 2 - Dashboard Title
              </h2>
              <p className="text-sm text-[var(--fg-solid-hover)] mt-1">Font: Graphik, Size: 30px, Weight: 500</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-[var(--fg-text-contrast)] font-graphik">
                Heading 3 - Section Title
              </h3>
              <p className="text-sm text-[var(--fg-solid-hover)] mt-1">Font: Graphik, Size: 20px, Weight: 500</p>
            </div>
            <div>
              <p className="text-base text-[var(--fg-text)] font-graphik">
                Body text - This is regular paragraph text using the Graphik font family with proper line height and spacing.
              </p>
              <p className="text-sm text-[var(--fg-solid-hover)] mt-1">Font: Graphik, Size: 16px, Weight: 400</p>
            </div>
            <div>
              <p className="text-sm text-[var(--fg-solid-hover)] font-graphik">
                Small text - Used for captions, metadata, and secondary information throughout the interface.
              </p>
              <p className="text-xs text-[var(--fg-solid-hover)] mt-1">Font: Graphik, Size: 14px, Weight: 400</p>
            </div>
          </div>
        </section>

        {/* CSS Variables Reference */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-[var(--fg-text-contrast)]">CSS Variables Reference</h2>
          <div className="bg-[var(--bg-base)] border border-[var(--fg-border)] rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-mono">
              <div>
                <h4 className="font-bold text-[var(--fg-text-contrast)] mb-2">Backgrounds</h4>
                <ul className="space-y-1 text-[var(--fg-text)]">
                  <li>--bg-default: #FFFDF8</li>
                  <li>--bg-base: #FFFFFF</li>
                  <li>--bg-bg-subtle: #FFF9E8</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[var(--fg-text-contrast)] mb-2">Primary</h4>
                <ul className="space-y-1 text-[var(--fg-text)]">
                  <li>--primary-solid: #39996B</li>
                  <li>--primary-solid-hover: #2E8055</li>
                  <li>--primary-bg: #CCEFDC</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[var(--fg-text-contrast)] mb-2">Secondary</h4>
                <ul className="space-y-1 text-[var(--fg-text)]">
                  <li>--secondary-solid: #FABB17</li>
                  <li>--secondary-solid-hover: #E1A325</li>
                  <li>--secondary-bg: #FCF4D6</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[var(--fg-text-contrast)] mb-2">Text Colors</h4>
                <ul className="space-y-1 text-[var(--fg-text)]">
                  <li>--fg-text-contrast: #1F2937</li>
                  <li>--fg-text: #65656A</li>
                  <li>--fg-solid-hover: #6B7280</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[var(--fg-text-contrast)] mb-2">Borders</h4>
                <ul className="space-y-1 text-[var(--fg-text)]">
                  <li>--fg-line: #F2F0EA</li>
                  <li>--fg-border: #E0DDD5</li>
                  <li>--fg-border-hover: #D0CCC3</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}