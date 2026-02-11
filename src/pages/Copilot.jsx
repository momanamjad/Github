import React from 'react';
import { Sparkles, Code, MessageSquare, Zap, Check } from 'lucide-react';

const Copilot = () => {
  const features = [
    {
      icon: Code,
      title: 'Code completions',
      description: 'Get AI-powered code suggestions as you type'
    },
    {
      icon: MessageSquare,
      title: 'Chat assistance',
      description: 'Ask questions and get explanations in natural language'
    },
    {
      icon: Zap,
      title: 'Fast and efficient',
      description: 'Speed up your development workflow'
    }
  ];

  const benefits = [
    'Write code faster with AI-powered suggestions',
    'Learn new APIs and frameworks quickly',
    'Get explanations for complex code',
    'Generate tests and documentation',
    'Fix bugs and errors efficiently'
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">GitHub Copilot</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Your AI pair programmer that helps you write code faster and with less effort
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Code smarter, not harder
              </h2>
              <p className="text-gray-700 mb-6">
                GitHub Copilot uses AI to suggest code and entire functions in real-time, 
                right from your editor. Available for Visual Studio Code, Visual Studio, 
                Neovim, and JetBrains IDEs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Copilot
                </button>
                <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Learn more
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <div className="space-y-2 font-mono text-sm">
                <div className="text-gray-600">// Function to calculate fibonacci</div>
                <div className="text-purple-600">function fibonacci(n) {'{'}</div>
                <div className="text-gray-400 pl-4">  // Copilot suggestion...</div>
                <div className="text-gray-800 pl-4">  if (n {'<='} 1) return n;</div>
                <div className="text-gray-800 pl-4">  return fibonacci(n - 1) + fibonacci(n - 2);</div>
                <div className="text-purple-600">{'}'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <feature.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What you can do</h2>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="border border-gray-300 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Copilot usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 mb-2">0</p>
              <p className="text-sm text-gray-600">Suggestions accepted</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
              <p className="text-sm text-gray-600">Lines of code generated</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600 mb-2">0%</p>
              <p className="text-sm text-gray-600">Time saved</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Start using Copilot to see your stats
          </p>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
