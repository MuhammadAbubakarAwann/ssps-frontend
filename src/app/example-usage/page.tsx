// Example of using the Domlii Dashboard theme colors with Tailwind CSS

export default function ExampleUsage() {
  return (
    <div className="min-h-screen bg-bg-default">
      {/* Header */}
      <header className="theme-navbar px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-fg-text-contrast">
          Dashboard
        </h1>
        
        {/* Search */}
        <div className="max-w-md flex-1 mx-8">
          <input 
            type="text"
            className="theme-search w-full"
            placeholder="Search scholarships..."
          />
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-warning-solid rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">KW</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-fg-text-contrast mb-1">
              Good morning, Kena Wilson
            </h1>
            <p className="text-fg-text">Manage your scholarships and applications</p>
          </div>
          
          <button className="theme-button-primary">
            <span className="mr-2">+</span>
            Create scholarship
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-fg-border mb-6">
          <div className="flex space-x-8">
            <button className="theme-tab-active pb-4">
              Scholarships
            </button>
            <button className="theme-tab-inactive pb-4">
              Applications  
            </button>
            <button className="theme-tab-inactive pb-4">
              Recipients
            </button>
          </div>
        </div>

        {/* Example Table */}
        <div className="theme-table">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="theme-table-header text-left">Scholarship Name</th>
                <th className="theme-table-header text-left">Status</th>
                <th className="theme-table-header text-left">Applications</th>
                <th className="theme-table-header text-left">Award Amount</th>
                <th className="theme-table-header text-left">Deadline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="theme-table-cell">
                  <div className="font-medium text-fg-text-contrast">Excellence Scholarship</div>
                </td>
                <td className="theme-table-cell">
                  <div className="theme-badge theme-badge-success">
                    <div className="theme-badge-dot theme-badge-dot-success"></div>
                    Active
                  </div>
                </td>
                <td className="theme-table-cell">127</td>
                <td className="theme-table-cell">$5,000</td>
                <td className="theme-table-cell">Dec 15, 2024</td>
              </tr>
              <tr>
                <td className="theme-table-cell">
                  <div className="font-medium text-fg-text-contrast">Merit Award Program</div>
                </td>
                <td className="theme-table-cell">
                  <div className="theme-badge theme-badge-review">
                    <div className="theme-badge-dot theme-badge-dot-review"></div>
                    Review
                  </div>
                </td>
                <td className="theme-table-cell">89</td>
                <td className="theme-table-cell">$3,000</td>
                <td className="theme-table-cell">Jan 30, 2025</td>
              </tr>
              <tr>
                <td className="theme-table-cell">
                  <div className="font-medium text-fg-text-contrast">Innovation Grant</div>
                </td>
                <td className="theme-table-cell">
                  <div className="theme-badge theme-badge-published">
                    <div className="theme-badge-dot theme-badge-dot-published"></div>
                    Published
                  </div>
                </td>
                <td className="theme-table-cell">45</td>
                <td className="theme-table-cell">$2,500</td>
                <td className="theme-table-cell">Feb 28, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* Usage Examples:

// Background Colors
className="bg-bg-default"     // Main cream background: #FFFDF8
className="bg-bg-base"        // White cards/tables: #FFFFFF  
className="bg-bg-subtle"      // Sidebar background: #FFF9E8

// Text Colors
className="text-fg-text-contrast"  // Dark text: #1F2937
className="text-fg-text"           // Body text: #65656A
className="text-fg-solid-hover"    // Light gray: #6B7280

// Primary Colors (Green)
className="bg-primary-solid"        // Green button: #39996B
className="text-primary-solid"      // Green text: #39996B
className="bg-primary-bg"           // Light green bg: #CCEFDC

// Secondary Colors (Yellow)
className="bg-secondary-solid"      // Yellow accent: #FABB17
className="text-secondary-solid"    // Yellow text: #FABB17
className="border-secondary-solid"  // Yellow border: #FABB17

// Border Colors
className="border-fg-line"         // Table borders: #F2F0EA
className="border-fg-border"       // General borders: #E0DDD5

// Badge Classes
className="theme-badge theme-badge-success"
className="theme-badge theme-badge-warning" 
className="theme-badge theme-badge-published"
className="theme-badge theme-badge-review"
className="theme-badge theme-badge-sponsored"

// Component Classes
className="theme-button-primary"   // Green button with hover
className="theme-tab-active"       // Yellow active tab
className="theme-tab-inactive"     // Gray inactive tab
className="theme-table"            // White table with borders
className="theme-search"           // Search input styling

*/