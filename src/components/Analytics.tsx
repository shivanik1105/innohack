import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';

export default function Analytics() {
  const [chartData, setChartData] = useState([
    { name: 'Mon', value: 65 },
    { name: 'Tue', value: 78 },
    { name: 'Wed', value: 90 },
    { name: 'Thu', value: 81 },
    { name: 'Fri', value: 95 },
    { name: 'Sat', value: 72 },
    { name: 'Sun', value: 88 }
  ]);

  const [pieData, setPieData] = useState([
    { name: 'Image Processing', value: 35, color: 'bg-blue-500' },
    { name: 'Data Analysis', value: 28, color: 'bg-purple-500' },
    { name: 'File Operations', value: 22, color: 'bg-green-500' },
    { name: 'Network Tasks', value: 15, color: 'bg-yellow-500' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => prev.map(item => ({
        ...item,
        value: Math.max(20, Math.min(100, item.value + (Math.random() - 0.5) * 10))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="analytics" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Analytics & Insights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get deep insights into your worker performance and optimize your applications with data-driven decisions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Weekly Performance</h3>
              </div>
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{item.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-semibold text-gray-900 text-right">{item.value}%</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Average Performance</span>
                <span className="font-semibold text-gray-900">
                  {Math.round(chartData.reduce((acc, item) => acc + item.value, 0) / chartData.length)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Task Distribution</h3>
              </div>
              <button className="text-purple-600 hover:text-purple-700 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.value / 35) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">Performance Insight</div>
              <div className="text-sm text-gray-600">
                Image processing tasks are consuming the most resources. Consider optimizing your image workers for better performance.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-blue-100">
                Join thousands of developers who are already using WorkerFlow to build faster applications.
              </p>
            </div>
            
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}