import React, { useState } from 'react';

const PullRequests = () => {
  const [selectedTab, setSelectedTab] = useState('everything');
  const [searchQuery, setSearchQuery] = useState('is:open is:pr author:@me');
  
  const tabs = [
    { id: 'everything', label: 'Everything', count: 12 },
    { id: 'assigned', label: 'Assigned to you', count: 3 },
    { id: 'review', label: 'Review requested', count: 5 },
    { id: 'mention', label: 'Your mentions', count: 1 }
  ];

  const pullRequests = [
    {
      id: 1,
      title: 'Add user authentication flow',
      repo: 'frontend-app',
      number: 234,
      status: 'open',
      author: 'johndoe',
      comments: 8,
      updated: '2 hours ago',
      labels: ['enhancement', 'auth']
    },
    {
      id: 2,
      title: 'Fix responsive layout issues on mobile',
      repo: 'website',
      number: 567,
      status: 'draft',
      author: 'janedoe',
      comments: 3,
      updated: '5 hours ago',
      labels: ['bug', 'mobile']
    },
    {
      id: 3,
      title: 'Update API documentation',
      repo: 'docs',
      number: 890,
      status: 'merged',
      author: 'bobsmith',
      comments: 12,
      updated: 'yesterday',
      labels: ['documentation']
    },
    {
      id: 4,
      title: 'Implement dark mode toggle',
      repo: 'dashboard',
      number: 123,
      status: 'closed',
      author: 'alicew',
      comments: 6,
      updated: '3 days ago',
      labels: ['feature', 'ui']
    }
  ];

  const StatusIcon = ({ status }) => {
    switch(status) {
      case 'open':
        return <span className="w-4 h-4 text-green-600"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"/></svg></span>;
      case 'draft':
        return <span className="w-4 h-4 text-gray-500"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"/><rect x="3" y="7.5" width="10" height="1"/></svg></span>;
      case 'merged':
        return <span className="w-4 h-4 text-purple-600"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 3.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M5.5 5v2.5M5.5 7.5v2"/><path d="M11.5 5v4.5a3 3 0 0 1-3 3h-3"/></svg></span>;
      case 'closed':
        return <span className="w-4 h-4 text-red-600"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"/><path d="m5.47 5.47 5.32 5.32"/><path d="m10.68 5.47-5.32 5.32"/></svg></span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
      {/* Header */}
      <header className="border-b border-[#30363d] bg-[#0d1117] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <svg height="32" width="32" viewBox="0 0 16 16" className="fill-white">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.87-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span className="text-xl font-semibold">Pull requests</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-[#238636] hover:bg-[#2ea043] rounded-md font-medium">
              New pull request
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7]"
              placeholder="Search pull requests..."
            />
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-[#848d97]" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.68 11.74a6 6 0 0 1-7.92-8.98 6 6 0 0 1 8.98 7.92l2.86 2.86a.75.75 0 1 1-1.06 1.06l-2.86-2.86zM6 10.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"></path>
            </svg>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <button className="px-3 py-1.5 border border-[#30363d] rounded-md hover:bg-[#161b22] flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.5 2.5v11l4-4 4 4v-11"></path>
              </svg>
              <span>Author</span>
            </button>
            <button className="px-3 py-1.5 border border-[#30363d] rounded-md hover:bg-[#161b22] flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"></path>
                <path d="M5.5 8.5h5v-1h-5z"></path>
              </svg>
              <span>Label</span>
            </button>
            <button className="px-3 py-1.5 border border-[#30363d] rounded-md hover:bg-[#161b22] flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 5.5v2h12v-2zM2 11.5h8v-2H2z"></path>
              </svg>
              <span>Projects</span>
            </button>
            <button className="px-3 py-1.5 border border-[#30363d] rounded-md hover:bg-[#161b22] hidden sm:block">
              Clear filter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#30363d] mb-4">
          <nav className="flex -mb-px space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${selectedTab === tab.id 
                    ? 'border-[#f78166] text-[#e6edf3]' 
                    : 'border-transparent text-[#848d97] hover:text-[#e6edf3] hover:border-[#3d444d]'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 bg-[#2d333b] rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Pull Requests List */}
        <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117]">
          <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center gap-3 text-sm">
            <svg className="w-4 h-4 text-[#848d97]" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 1.5v11h2v-11h-2z M5.5 1.5v11h2v-11h-2z M8.5 1.5v11h2v-11h-2z M11.5 1.5v11h2v-11h-2z"></path>
            </svg>
            <span className="text-[#848d97]">{pullRequests.length} Open</span>
            <span className="text-[#848d97]">{pullRequests.filter(pr => pr.status === 'closed' || pr.status === 'merged').length} Closed</span>
          </div>

          {pullRequests.map((pr) => (
            <div key={pr.id} className="px-4 py-3 border-b border-[#30363d] last:border-0 hover:bg-[#161b22] flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <StatusIcon status={pr.status} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <a href="#" className="font-semibold hover:text-[#2f81f7] text-base">
                    {pr.title}
                  </a>
                  {pr.labels.map((label, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-[#1f6feb] bg-opacity-20 text-[#8ac7ff] border border-[#1f6feb] border-opacity-40">
                      {label}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#848d97] mt-1">
                  <span>#{pr.number}</span>
                  <span>by {pr.author}</span>
                  <span>updated {pr.updated}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1.5 2.75v8.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25H2.75c-.69 0-1.25.56-1.25 1.25zM14 2.75v8.5c0 .14-.11.25-.25.25H2.75c-.14 0-.25-.11-.25-.25v-8.5c0-.14.11-.25.25-.25h10.5c.14 0 .25.11.25.25z"></path>
                      <path d="M4.5 4.5h7v1h-7zM4.5 6.5h7v1h-7zM4.5 8.5h4v1h-4z"></path>
                    </svg>
                    {pr.comments}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-xs text-[#848d97] hidden sm:block">
                {pr.repo}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <button className="px-3 py-1 border border-[#30363d] rounded-md text-sm hover:bg-[#161b22] disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-[#238636] border border-[#238636] rounded-md text-sm hover:bg-[#2ea043]">
              1
            </button>
            <button className="px-3 py-1 border border-[#30363d] rounded-md text-sm hover:bg-[#161b22]">
              2
            </button>
            <button className="px-3 py-1 border border-[#30363d] rounded-md text-sm hover:bg-[#161b22]">
              3
            </button>
            <button className="px-3 py-1 border border-[#30363d] rounded-md text-sm hover:bg-[#161b22]">
              Next
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
};

export default PullRequests;