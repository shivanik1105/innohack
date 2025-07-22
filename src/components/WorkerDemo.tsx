import React, { useState, useRef } from 'react';
import { Play, Square, Upload, Download, Cpu, Zap } from 'lucide-react';
import { useWorker } from '../hooks/useWorker';
import { imageProcessorScript } from '../workers/imageProcessor';
import { dataProcessorScript } from '../workers/dataProcessor';

export default function WorkerDemo() {
  const [activeDemo, setActiveDemo] = useState<'image' | 'data'>('image');
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [dataResult, setDataResult] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageWorker = useWorker(imageProcessorScript, {
    onMessage: (data) => {
      if (data.success && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.putImageData(data.result, 0, 0);
          setImageResult(canvasRef.current.toDataURL());
        }
      }
    }
  });

  const dataWorker = useWorker(dataProcessorScript, {
    onMessage: (data) => {
      if (data.success) {
        setDataResult(data.result);
      }
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext('2d')!;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = (operation: string, params: any = {}) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        imageWorker.postMessage({ imageData, operation, params });
      }
    }
  };

  const processData = () => {
    const sampleData = [
      { name: 'Alice', age: 30, salary: 75000, department: 'Engineering' },
      { name: 'Bob', age: 25, salary: 65000, department: 'Marketing' },
      { name: 'Charlie', age: 35, salary: 85000, department: 'Engineering' },
      { name: 'Diana', age: 28, salary: 70000, department: 'Design' },
      { name: 'Eve', age: 32, salary: 80000, department: 'Engineering' }
    ];

    dataWorker.postMessage({
      data: sampleData,
      operation: 'aggregate',
      params: {
        groupBy: 'department',
        aggregations: [
          { type: 'count', name: 'employees' },
          { type: 'avg', name: 'avgSalary', field: 'salary' },
          { type: 'avg', name: 'avgAge', field: 'age' }
        ]
      }
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Worker Demos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of Web Workers with these interactive demonstrations.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={() => setActiveDemo('image')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeDemo === 'image'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Cpu className="w-5 h-5 inline mr-2" />
              Image Processing
            </button>
            <button
              onClick={() => setActiveDemo('data')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeDemo === 'data'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Data Processing
            </button>
          </div>
        </div>

        {activeDemo === 'image' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Image Processing Worker</h3>
                
                <div className="space-y-4 mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Image
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => processImage('blur', { radius: 3 })}
                      disabled={imageWorker.isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Blur
                    </button>
                    <button
                      onClick={() => processImage('brightness', { factor: 1.3 })}
                      disabled={imageWorker.isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Brighten
                    </button>
                    <button
                      onClick={() => processImage('contrast', { factor: 1.5 })}
                      disabled={imageWorker.isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Contrast
                    </button>
                    <button
                      onClick={() => processImage('grayscale')}
                      disabled={imageWorker.isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Grayscale
                    </button>
                  </div>
                </div>
                
                {imageWorker.isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Processing image...</span>
                  </div>
                )}
              </div>
              
              <div>
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border border-gray-300 rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
                {!canvasRef.current?.width && (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    Upload an image to get started
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'data' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Data Processing Worker</h3>
                
                <div className="space-y-4 mb-6">
                  <button
                    onClick={processData}
                    disabled={dataWorker.isLoading}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {dataWorker.isLoading ? 'Processing...' : 'Process Sample Data'}
                  </button>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Sample Dataset:</h4>
                    <p className="text-sm text-gray-600">
                      Employee data with name, age, salary, and department fields. 
                      The worker will aggregate data by department.
                    </p>
                  </div>
                </div>
                
                {dataWorker.isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Processing data...</span>
                  </div>
                )}
              </div>
              
              <div>
                {dataResult ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Processing Results:</h4>
                    {Object.entries(dataResult).map(([department, stats]: [string, any]) => (
                      <div key={department} className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{department}</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Employees</div>
                            <div className="font-semibold">{stats.employees}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Avg Salary</div>
                            <div className="font-semibold">${stats.avgSalary?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Avg Age</div>
                            <div className="font-semibold">{Math.round(stats.avgAge)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    Click "Process Sample Data" to see results
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}