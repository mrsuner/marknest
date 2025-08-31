export default function DashboardPage() {
  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-lg border border-base-300/50 p-8 mb-8">
          <h2 className="text-3xl font-light text-base-content mb-2">
            Welcome back!
          </h2>
          <p className="text-base-content/60 text-lg">
            You&apos;re successfully logged in using passwordless authentication.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-base-100 rounded-2xl shadow-md border border-base-300/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-primary">0</span>
            </div>
            <h3 className="text-base-content font-medium">Documents</h3>
            <p className="text-sm text-base-content/60">No documents yet</p>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-md border border-base-300/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-secondary">0</span>
            </div>
            <h3 className="text-base-content font-medium">Folders</h3>
            <p className="text-sm text-base-content/60">No folders yet</p>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-md border border-base-300/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-accent">0</span>
            </div>
            <h3 className="text-base-content font-medium">Shared Links</h3>
            <p className="text-sm text-base-content/60">No shared links</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-base-100 rounded-2xl shadow-md border border-base-300/50 p-6">
          <h3 className="text-xl font-medium text-base-content mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors duration-200">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-base-content font-medium">Create New Document</span>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors duration-200">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="text-base-content font-medium">New Folder</span>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-accent/10 hover:bg-accent/20 rounded-xl transition-colors duration-200">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-base-content font-medium">Import Document</span>
            </button>
            
            <a href="/documents/demo/edit" className="flex items-center gap-3 p-4 bg-info/10 hover:bg-info/20 rounded-xl transition-colors duration-200">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-base-content font-medium">Demo Editor</span>
            </a>
          </div>
        </div>
      </div>
  );
}