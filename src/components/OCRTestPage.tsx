import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText, User, Eye, TestTube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OCRTestPageProps {
  userId?: string;
}

interface VerificationResult {
  status: string;
  message: string;
  certificate: any;
  verification_details: {
    ocr_confidence: number;
    verification_status: string;
    name_verification: {
      match: boolean;
      confidence: number;
      extracted_name: string;
      user_name: string;
      reason: string;
      similarity_scores: {
        exact_match: number;
        fuzzy_ratio: number;
        fuzzy_partial: number;
        fuzzy_token_sort: number;
        fuzzy_token_set: number;
        sequence_matcher: number;
      };
    };
    is_verified: boolean;
  };
}

const OCRTestPage: React.FC<OCRTestPageProps> = ({ userId = 'test-user-123' }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [testUserName, setTestUserName] = useState('SHIVANI KINAGI');
  const [certificateName, setCertificateName] = useState('SHIVANI KINAGI');
  const [certificateTitle, setCertificateTitle] = useState('Test Certificate');
  const [apiStatus, setApiStatus] = useState<string>('Unknown');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleTest = async () => {
    if (!selectedFile) {
      alert('Please select a certificate image first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // First, test if the API is reachable
      console.log('Testing API connection...');

      const formData = new FormData();
      formData.append('certificate_image', selectedFile);
      formData.append('title', certificateTitle);
      formData.append('type', 'government');
      formData.append('expected_name', testUserName);  // Pass the expected name for testing
      formData.append('certificate_name', certificateName);  // Pass the name on certificate

      // For testing, we'll use a mock user endpoint
      const apiUrl = `http://localhost:8000/api/users/${userId}/upload-certificate/`;
      console.log('Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // No custom headers needed - the backend will use the user's name from the database
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data: VerificationResult;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      setResult(data);

    } catch (error) {
      console.error('Test failed:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck the browser console for more details.`);
    } finally {
      setUploading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test-ocr/', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ Connected - OCR Available: ${data.ocr_available}`);
      } else {
        const errorText = await response.text();
        setApiStatus(`❌ HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      setApiStatus(`❌ Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'name_mismatch':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'needs_review':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'name_mismatch':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'needs_review':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <TestTube className="w-8 h-8 text-blue-500" />
          OCR Certificate Verification Test
        </h1>
        <p className="text-gray-600 mb-4">
          Test the OCR-based certificate verification system with name matching
        </p>

        {/* API Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Backend API Status</h3>
              <p className="text-sm text-gray-600">{apiStatus}</p>
            </div>
            <Button onClick={testApiConnection} variant="outline" size="sm">
              Test Connection
            </Button>
          </div>
        </div>

        {/* Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              User Profile Name
            </label>
            <input
              type="text"
              value={testUserName}
              onChange={(e) => setTestUserName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Name in user profile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Certificate Name
            </label>
            <input
              type="text"
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Name on certificate"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Certificate Title
            </label>
            <input
              type="text"
              value={certificateTitle}
              onChange={(e) => setCertificateTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter certificate title"
            />
          </div>
        </div>

        {/* Quick Test Scenarios */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-3">Quick Test Scenarios</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setTestUserName('SHIVANI KINAGI');
                setCertificateName('SHIVANI KINAGI');
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              ✅ Names Match
            </button>
            <button
              onClick={() => {
                setTestUserName('SHIVANI KINAGI');
                setCertificateName('John Doe');
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              ❌ Names Don't Match
            </button>
            <button
              onClick={() => {
                setTestUserName('SHIVANI KINAGI');
                setCertificateName('shivani kinagi');
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              🔤 Case Difference
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Certificate Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="test-certificate-upload"
            />
            <label htmlFor="test-certificate-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {selectedFile ? selectedFile.name : 'Click to select certificate image'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Upload a certificate image to test OCR name verification
              </p>
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview
            </h3>
            <img
              src={previewUrl}
              alt="Certificate preview"
              className="max-w-full h-auto rounded-lg border"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}

        {/* Test Button */}
        <Button
          onClick={handleTest}
          disabled={!selectedFile || uploading}
          className="w-full mb-6"
          size="lg"
        >
          {uploading ? 'Processing with OCR...' : 'Test OCR Verification'}
        </Button>

        {/* Test Results */}
        {result && (
          <Card className={`p-6 border-2 ${getStatusColor(result.verification_details.verification_status)}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              {getStatusIcon(result.verification_details.verification_status)}
              Verification Results
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Results */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span>{result.verification_details.verification_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">OCR Confidence:</span>
                    <span>{(result.verification_details.ocr_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Is Verified:</span>
                    <span>{result.verification_details.is_verified ? '✅ Yes' : '❌ No'}</span>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium">Message:</span>
                    <p className="mt-1 text-gray-700">{result.message}</p>
                  </div>
                </div>
              </div>

              {/* Name Verification Details */}
              {result.verification_details.name_verification && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Name Verification
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Match:</span>
                      <span>{result.verification_details.name_verification.match ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Confidence:</span>
                      <span>{(result.verification_details.name_verification.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="font-medium">Extracted Name:</span>
                      <p className="mt-1 font-mono text-blue-600">
                        "{result.verification_details.name_verification.extracted_name}"
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Profile Name:</span>
                      <p className="mt-1 font-mono text-green-600">
                        "{result.verification_details.name_verification.user_name}"
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="mt-1 text-gray-700">{result.verification_details.name_verification.reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Similarity Scores */}
            {result.verification_details.name_verification?.similarity_scores && (
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Similarity Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {Object.entries(result.verification_details.name_verification.similarity_scores).map(([method, score]) => (
                    <div key={method} className="bg-white p-3 rounded border">
                      <div className="font-medium capitalize">{method.replace(/_/g, ' ')}</div>
                      <div className="text-lg font-bold text-blue-600">{(score * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">🧪 How to Test</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Enter the name that should appear on the certificate in "Test User Name"</li>
          <li>Upload a certificate image (can be any image with text)</li>
          <li>Click "Test OCR Verification" to process</li>
          <li>Review the results to see how well the OCR extracted and matched the name</li>
          <li>Try different names and images to test various scenarios</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> The system uses fuzzy string matching to handle variations in names, 
            nicknames, and OCR errors. A similarity threshold of 80% is required for verification.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default OCRTestPage;
