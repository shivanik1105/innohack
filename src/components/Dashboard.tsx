import React, { useState, useEffect } from 'react';
import { Activity, Users, Cpu, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeWorkers: 0,
    totalTasks: 0,
    cpuUsage: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        activeWorkers: Math.floor(Math.random() * 8) + 4,
        totalTasks: Math.floor(Math.random() * 1000) + 2500,
        cpuUsage: Math.floor(Math.random() * 30) + 45,
        completedTasks: Math.floor(Math.random() * 500) + 1800
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real-Time Performance Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor your worker processes and system performance with our intuitive dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.activeWorkers}</div>
            <div className="text-sm text-gray-600">Active Workers</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTasks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">-3%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.cpuUsage}%</div>
            <div className="text-sm text-gray-600">CPU Usage</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+15%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.completedTasks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Performance Metrics</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                  <span className="text-sm text-gray-600">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-[68%] transition-all duration-500"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Task Queue</span>
                  <span className="text-sm text-gray-600">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[42%] transition-all duration-500"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Network I/O</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-[85%] transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="space-y-4">
              {[
                { task: 'Image processing completed', time: '2 min ago', status: 'success' },
                { task: 'Data analysis started', time: '5 min ago', status: 'processing' },
                { task: 'File compression finished', time: '8 min ago', status: 'success' },
                { task: 'Background sync initiated', time: '12 min ago', status: 'processing' },
                { task: 'Cache optimization done', time: '15 min ago', status: 'success' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.task}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}