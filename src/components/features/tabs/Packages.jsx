import React from 'react';
import { PackageIcon } from '@primer/octicons-react';

export default function Packages() {
  const packageTypes = [
    { name: 'Docker', desc: 'A container registry for your images.', icon: '🐳' },
    { name: 'Apache Maven', desc: 'Java dependency management registry.', icon: '☕' },
    { name: 'NuGet', desc: '.NET package registry.', icon: '📦' },
    { name: 'RubyGems', desc: 'Ruby gem registry.', icon: '💎' },
    { name: 'npm', desc: 'JavaScript package registry.', icon: '⚙️' },
    { name: 'Containers', desc: 'Generic container registry.', icon: '📦' }
  ];

  return (
    <div className="py-8">
      {/* Empty State */}
      <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-16 bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center text-center mb-8">
        <div className="w-16 h-16 mb-4 rounded-full bg-[#f6f8fa] dark:bg-[#161b22] flex items-center justify-center text-gray-400 dark:text-[#8b949e]">
          <PackageIcon size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Get started with GitHub Packages
        </h3>
        <p className="text-sm text-gray-500 dark:text-[#8b949e] max-w-lg mb-6 leading-relaxed">
          Safe, global hosting for software packages. Publish packages securely, choose who can access them, and integrate them with your repositories and CI/CD pipelines.
        </p>
        <button className="text-sm font-semibold px-4 py-2 bg-[#f6f8fa] dark:bg-[#21262d] text-[#0969da] dark:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#eaeef2] dark:hover:bg-[#30363d] cursor-pointer">
          Learn more about Packages
        </button>
      </div>

      {/* Package Registry Types */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Choose a registry to get started
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packageTypes.map((pkg) => (
            <div key={pkg.name} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-white dark:bg-[#0d1117] hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{pkg.icon}</span>
                <h5 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h5>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#8b949e] leading-snug">
                {pkg.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}