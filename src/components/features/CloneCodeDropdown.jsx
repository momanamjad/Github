import React, { useState } from 'react';
import { CopyIcon, CheckIcon, TerminalIcon, MarkGithubIcon, DesktopDownloadIcon, FileZipIcon, QuestionIcon } from '@primer/octicons-react';

const CloneCodeDropdown = ({ repoData }) => {
  const [activeTab, setActiveTab] = useState('local');
  const [activeProtocol, setActiveProtocol] = useState('https');
  const [copied, setCopied] = useState(false);

  const ownerLogin = repoData?.owner?.login || '';
  const repoName = repoData?.name || '';
  const domain = window.location.host;

  // URLs based on protocol
  const cloneUrls = {
    https: `${window.location.protocol}//${domain}/${ownerLogin}/${repoName}.git`,
    ssh: `git@${domain}:${ownerLogin}/${repoName}.git`,
    cli: `gh repo clone ${ownerLogin}/${repoName}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneUrls[activeProtocol]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSubtext = () => {
    if (activeProtocol === 'https') return 'Clone using the web URL.';
    if (activeProtocol === 'ssh') return 'Use a password-protected SSH key.';
    return 'Work fast with our official CLI.';
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const zipUrl = `${apiUrl}/repos/${repoData?._id || repoData?.id}/zip`;

  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-xl z-50 text-left overflow-hidden font-sans">
      
      {/* Top Tabs (Local / Codespaces) */}
      <div className="flex border-b border-[#d0d7de] dark:border-[#30363d] px-2 pt-2 bg-[#f6f8fa] dark:bg-[#161b22]">
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 pb-2 text-xs font-semibold border-b-2 bg-transparent cursor-pointer transition-colors outline-none ${
            activeTab === 'local' 
              ? 'border-[#f78166] text-[#24292f] dark:text-white' 
              : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setActiveTab('codespaces')}
          className={`px-4 pb-2 text-xs font-semibold border-b-2 bg-transparent cursor-pointer transition-colors outline-none ${
            activeTab === 'codespaces' 
              ? 'border-[#f78166] text-[#24292f] dark:text-white' 
              : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white'
          }`}
        >
          Codespaces
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'local' ? (
          <div className="space-y-4">
            {/* Clone Header */}
            <div className="flex items-center justify-between text-[#24292f] dark:text-[#c9d1d9]">
              <span className="flex items-center gap-2 font-semibold text-sm">
                <TerminalIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                Clone
              </span>
              <QuestionIcon size={14} className="text-[#57606a] dark:text-[#8b949e] cursor-pointer hover:text-[#0969da]" />
            </div>

            {/* Protocol Tabs */}
            <div className="flex bg-[#f6f8fa] dark:bg-[#21262d] rounded-md border border-[#d0d7de] dark:border-[#30363d] p-0.5">
              {['https', 'ssh', 'cli'].map(protocol => (
                <button
                  key={protocol}
                  onClick={() => setActiveProtocol(protocol)}
                  className={`flex-1 px-3 py-1 text-xs font-semibold rounded-sm bg-transparent cursor-pointer outline-none transition-all border-0 ${
                    activeProtocol === protocol 
                      ? 'bg-white dark:bg-[#30363d] text-[#24292f] dark:text-white shadow-sm border border-[#d0d7de] dark:border-[#161b22]' 
                      : 'text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white hover:bg-[#ebedf0] dark:hover:bg-[#30363d]'
                  }`}
                >
                  {protocol === 'https' ? 'HTTPS' : protocol === 'ssh' ? 'SSH' : 'GitHub CLI'}
                </button>
              ))}
            </div>

            {/* Input & Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#f6f8fa] dark:bg-[#0d1117] focus-within:ring-2 focus-within:ring-[#0969da] focus-within:border-transparent transition-all">
                <input 
                  type="text" 
                  readOnly 
                  value={cloneUrls[activeProtocol]} 
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#24292f] dark:text-[#c9d1d9] border-0 outline-none font-mono"
                  onClick={(e) => e.target.select()}
                />
                <button 
                  onClick={handleCopy}
                  className="p-2 border-0 border-l border-[#d0d7de] dark:border-[#30363d] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer bg-[#f6f8fa] dark:bg-[#21262d] transition-colors flex items-center justify-center"
                  aria-label="Copy to clipboard"
                >
                  {copied ? <CheckIcon size={14} className="text-[#3fb950]" /> : <CopyIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />}
                </button>
              </div>
              <p className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-1 m-0">
                {getSubtext()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <h4 className="font-semibold text-sm mb-2 text-[#24292f] dark:text-white m-0">GitHub Codespaces</h4>
            <p className="text-xs text-[#57606a] dark:text-[#8b949e] m-0">A complete dev environment in your browser.</p>
          </div>
        )}
      </div>

      {activeTab === 'local' && (
        <div className="border-t border-[#d0d7de] dark:border-[#30363d] p-2 space-y-1">
          <a href={`vscode://vscode.git/clone?url=${encodeURIComponent(cloneUrls.https)}`} className="w-full flex items-center gap-3 px-2 py-1.5 text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#0969da] hover:text-white dark:hover:bg-[#0969da] rounded-md cursor-pointer transition-colors no-underline">
            <MarkGithubIcon size={16} className="text-inherit opacity-75" />
            Open in GitHub Copilot app
          </a>
          <a href={`x-github-client://openRepo/${cloneUrls.https}`} className="w-full flex items-center gap-3 px-2 py-1.5 text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#0969da] hover:text-white dark:hover:bg-[#0969da] rounded-md cursor-pointer transition-colors no-underline">
            <DesktopDownloadIcon size={16} className="text-inherit opacity-75" />
            Open with GitHub Desktop
          </a>
          <a href={`vscode://vscode.git/clone?url=${encodeURIComponent(cloneUrls.https)}`} className="w-full flex items-center gap-3 px-2 py-1.5 text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#0969da] hover:text-white dark:hover:bg-[#0969da] rounded-md cursor-pointer transition-colors no-underline">
            <TerminalIcon size={16} className="text-inherit opacity-75" />
            Open with Visual Studio
          </a>
          <a href={zipUrl} target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-2 py-1.5 text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#0969da] hover:text-white dark:hover:bg-[#0969da] rounded-md cursor-pointer transition-colors no-underline">
            <FileZipIcon size={16} className="text-inherit opacity-75" />
            Download ZIP
          </a>
        </div>
      )}
    </div>
  );
};

export default CloneCodeDropdown;
