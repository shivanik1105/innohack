import React, { useState, useRef, useCallback } from 'react';
import { Play, Square, Upload, Download, Cpu, Zap } from 'lucide-react';
import { useWorker } from '../hooks/useWorker';
import { imageProcessorScript } from '../workers/imageProcessor';
import { dataProcessorScript } from '../workers/dataProcessor';

type ImageOperation = 
  | 'grayscale' 
  | 'blur' 
  | 'brightness' 
  | 'contrast' 
  | 'invert' 
  | 'sepia' 
  | 'sharpen' 
  | 'edgeDetect';

interface ImageFilter {
  name: string;
  operation: ImageOperation;
  params?: Record<string, any>;
}

interface DepartmentStats {
  employees: number;
  avgSalary?: number;
  avgAge?: number;
  totalSalary?: number;
}

interface DataResult {
  [department: string]: DepartmentStats;
}

export default function WorkerDemo() {
  const [activeDemo, setActiveDemo] = useState<'image' | 'data'>('image');
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [dataResult, setDataResult] = useState<DataResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageWorker = useWorker(imageProcessorScript, {
    onMessage: (data: { success: boolean; result: ImageData }) => {
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
    onMessage: (data: { success: boolean; result: DataResult }) => {
      if (data.success) {
        setDataResult(data.result);
      }
    }
  });

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setSelectedImage(e.target?.result as string);
        setImageResult(null);
      };
      img.onerror = () => console.error('Failed to load image');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => console.error('Failed to read file');
    reader.readAsDataURL(file);
  }, []);

  const processImage = useCallback((operation: ImageOperation, params: Record<string, any> = {}) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(
        0, 
        0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
      imageWorker.postMessage({ imageData, operation, params });
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }, [imageWorker]);

  const processData = useCallback(() => {
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
          { type: 'avg', name: 'avgAge', field: 'age' },
          { type: 'sum', name: 'totalSalary', field: 'salary' }
        ]
      }
    });
  }, [dataWorker]);

  const resetImage = useCallback(() => {
    if (!selectedImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      setImageResult(null);
    };
    img.onerror = () => console.error('Failed to reset image');
    img.src = selectedImage;
  }, [selectedImage]);

  const downloadImage = useCallback(() => {
    if (!imageResult) return;

    const link = document.createElement('a');
    link.download = 'processed-image.png';
    link.href = imageResult;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageResult]);

  const imageFilters: ImageFilter[] = [
    { name: 'Grayscale', operation: 'grayscale' },
    { name: 'Blur', operation: 'blur', params: { radius: 3 } },
    { name: 'Brighten', operation: 'brightness', params: { factor: 1.3 } },
    { name: 'Contrast', operation: 'contrast', params: { factor: 1.5 } },
    { name: 'Invert', operation: 'invert' },
    { name: 'Sepia', operation: 'sepia' },
    { name: 'Sharpen', operation: 'sharpen' },
    { name: 'Edge Detect', operation: 'edgeDetect' }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Web Worker Performance Demo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience non-blocking UI with intensive operations running in Web Workers
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-full p-1 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveDemo('image')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
                activeDemo === 'image'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Cpu className="w-5 h-5 mr-2" />
              Image Processing
            </button>
            <button
              onClick={() => setActiveDemo('data')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
                activeDemo === 'data'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-5 h-5 mr-2" />
              Data Processing
            </button>
          </div>
        </div>

        {activeDemo === 'image' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Image Processing in Web Worker
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Image
                    </button>
                    {selectedImage && (
                      <button
                        onClick={resetImage}
                        disabled={imageWorker.isLoading}
                        className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Reset Image
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imageFilters.map((filter) => (
                      <button
                        key={filter.name}
                        onClick={() => processImage(filter.operation, filter.params)}
                        disabled={imageWorker.isLoading || !selectedImage}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {imageWorker.isLoading && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Processing in worker thread...</span>
                    <span className="text-sm text-gray-500">UI remains responsive</span>
                  </div>
                )}
                
                {imageResult && (
                  <button
                    onClick={downloadImage}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center mt-4"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Processed Image
                  </button>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative w-full h-64 sm:h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {!selectedImage && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Upload an image to begin processing
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  {selectedImage && !imageResult && "Original image"}
                  {imageResult && "Processed result"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'data' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Data Processing in Web Worker
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={processData}
                    disabled={dataWorker.isLoading}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {dataWorker.isLoading ? 'Processing...' : 'Process Employee Data'}
                  </button>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Sample Dataset:</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      5 employee records with:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Name, Age, Salary</li>
                      <li>Department (Engineering, Marketing, Design)</li>
                    </ul>
                  </div>
                </div>
                
                {dataWorker.isLoading && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                    <span className="text-gray-600">Processing large dataset in worker...</span>
                    <span className="text-sm text-gray-500">UI remains responsive</span>
                  </div>
                )}
              </div>
              
              <div>
                {dataResult ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Department Analytics
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(dataResult).map(([department, stats]) => (
                        <div 
                          key={department} 
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <h5 className="font-medium text-gray-900 mb-3 capitalize">
                            {department} Department
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white p-2 rounded">
                              <div className="text-gray-600 text-xs">Employees</div>
                              <div className="font-semibold text-lg">{stats.employees}</div>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="text-gray-600 text-xs">Avg Salary</div>
                              <div className="font-semibold text-lg">
                                ${stats.avgSalary?.toFixed(0)}
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="text-gray-600 text-xs">Avg Age</div>
                              <div className="font-semibold text-lg">
                                {stats.avgAge ? Math.round(stats.avgAge) : 'N/A'}
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <div className="text-gray-600 text-xs">Total Salary</div>
                              <div className="font-semibold text-lg">
                                ${stats.totalSalary?.toFixed(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500 p-4">
                    <Zap className="w-8 h-8 mb-2 text-gray-400" />
                    <p>Click "Process Employee Data" to see</p>
                    <p>department analytics computed in a worker</p>
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