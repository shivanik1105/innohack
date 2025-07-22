import React from 'react';
import { Cpu, Zap, Shield, Code, Database, Globe } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Multi-Threading',
    description: 'Execute heavy computations in parallel without blocking the UI thread.',
    color: 'blue'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Achieve unprecedented performance with optimized worker processes.',
    color: 'yellow'
  },
  {
    icon: Shield,
    title: 'Secure Isolation',
    description: 'Workers run in isolated contexts, ensuring security and stability.',
    color: 'green'
  },
  {
    icon: Code,
    title: 'Easy Integration',
    description: 'Simple API that integrates seamlessly with your existing codebase.',
    color: 'purple'
  },
  {
    icon: Database,
    title: 'Data Processing',
    description: 'Handle large datasets and complex calculations efficiently.',
    color: 'indigo'
  },
  {
    icon: Globe,
    title: 'Universal Support',
    description: 'Works across all modern browsers with consistent performance.',
    color: 'pink'
  }
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  pink: 'bg-pink-100 text-pink-600'
};

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Web Apps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of your web applications with our comprehensive suite of worker-powered features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-14 h-14 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}