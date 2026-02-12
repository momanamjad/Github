import React, { useState } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';

export default function GitHubIssues() {
  const [activeTab, setActiveTab] = useState('assigned');
  const [searchQuery, setSearchQuery] = useState('is:issue state:open archived:false assignee:@me sort:updated-desc');

  const tabs = [
    { id: 'assigned', label: 'Assigned to me', icon: 'user' },
    { id: 'created', label: 'Created by me', icon: 'circle' },
    { id: 'mentioned', label: 'Mentioned', icon: 'at' },
    { id: 'recent', label: 'Recent activity', icon: 'clock' }
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      {/* Header */}
      <header className="bg-[#24292f] border-b border-[#d0d7de]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Menu button */}
              <button className="text-white hover:bg-[#32383f] p-2 rounded-md lg:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* GitHub Logo */}
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 fill-white" viewBox="0 0 16 16">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <span className="text-white font-semibold hidden sm:block">Issues</span>
              </div>

              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type / to search"
                    className="bg-[#32383f] border border-[#444c56] text-white placeholder-[#768390] rounded-md px-3 py-1.5 text-sm w-72 focus:outline-none focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb]"
                  />
                </div>
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-3">
              <button className="text-white hover:bg-[#32383f] p-2 rounded-md hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Zm5-3.5A3.5 3.5 0 0 0 4.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.017.017 0 0 0-.003.01l.001.006c0 .002.002.004.004.006l.006.004.007.001h10.964l.007-.001.006-.004.004-.006.001-.007a.017.017 0 0 0-.003-.01l-1.703-2.554a1.745 1.745 0 0 1-.294-.97V5A3.5 3.5 0 0 0 8 1.5Z"></path>
                </svg>
              </button>

              <button className="text-white hover:bg-[#32383f] p-2 rounded-md hidden sm:flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>

              <button className="text-white hover:bg-[#32383f] p-2 rounded-md hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z"></path>
                </svg>
              </button>

              <button className="text-white hover:bg-[#32383f] p-2 rounded-md hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm.25-11.25a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Z"></path>
                  <path d="M8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path>
                </svg>
              </button>

              <button className="text-white hover:bg-[#32383f] p-2 rounded-md hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
                </svg>
              </button>

              <button className="text-white hover:bg-[#32383f] p-2 rounded-md hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                </svg>
              </button>

              <button className="text-white hover:bg-[#32383f] p-2 rounded-md relative">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.5-11.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5ZM8 7a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 7Zm-3.5-.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1Z"></path>
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-[#d0d7de] min-h-screen hidden lg:block">
          <div className="p-4">
            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#f6f8fa] text-[#24292f] font-medium'
                      : 'text-[#57606a] hover:bg-[#f6f8fa]'
                  }`}
                >
                  {tab.icon === 'user' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0a5 5 0 0 1 5 5v1.5a5 5 0 0 1-10 0V5a5 5 0 0 1 5-5Zm3.5 5a3.5 3.5 0 1 0-7 0v1.5a3.5 3.5 0 1 0 7 0V5ZM1.5 14.25c0-2.67 2.08-4.75 4.75-4.75h3.5c2.67 0 4.75 2.08 4.75 4.75v1a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75v-1Z"></path>
                    </svg>
                  )}
                  {tab.icon === 'circle' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                    </svg>
                  )}
                  {tab.icon === 'at' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25a3.25 3.25 0 0 0-1.5 6.133V13.5a.75.75 0 0 0 1.5 0v-2.617A3.25 3.25 0 0 0 8.5 4.75Zm0 5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z"></path>
                    </svg>
                  )}
                  {tab.icon === 'clock' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1 0-1.5h2.25v-2.75a.75.75 0 0 1 1.5 0Z"></path>
                    </svg>
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Views Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#57606a] uppercase">Views</h3>
                <button className="text-[#57606a] hover:text-[#24292f]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#57606a] hover:bg-[#f6f8fa]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                  </svg>
                  <span>Untitled view</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Title and New Issue Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-normal text-[#24292f]">Assigned to me</h1>
              <button className="bg-[#2da44e] hover:bg-[#2c974b] text-white px-4 py-2 rounded-md text-sm font-medium">
                New issue
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="flex items-center bg-white border border-[#d0d7de] rounded-md focus-within:border-[#0969da] focus-within:ring-1 focus-within:ring-[#0969da]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                />
                <button className="px-3 py-2 hover:bg-[#f6f8fa] rounded-r-md">
                  <Search className="w-5 h-5 text-[#57606a]" />
                </button>
              </div>
            </div>

            {/* Results Header */}
            <div className="bg-white border border-[#d0d7de] rounded-t-md">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0d7de]">
                <div className="text-sm text-[#57606a]">
                  <span className="font-semibold">0 results</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-[#f6f8fa] rounded-md">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.25Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8.25Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"></path>
                    </svg>
                    <span>Updated</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Empty State */}
              <div className="py-20 text-center">
                <h3 className="text-2xl font-normal text-[#24292f] mb-2">No results</h3>
                <p className="text-base text-[#57606a]">Try adjusting your search filters.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#d0d7de] bg-white mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#57606a]">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 fill-[#57606a]" viewBox="0 0 16 16">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-[#0969da] hover:underline">Terms</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Privacy</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Security</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Status</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Community</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Docs</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Contact</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Manage cookies</a>
              <a href="#" className="hover:text-[#0969da] hover:underline">Do not share my personal information</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}