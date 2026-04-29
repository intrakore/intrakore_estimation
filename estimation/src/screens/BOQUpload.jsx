import React, { useState, useCallback } from 'react';
import { useFrappePostCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Alert, Progress } from '@rtcamp/frappe-ui-react';
import { Upload, FileText, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function BOQUpload({ bid }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const { call: uploadBOQ } = useFrappePostCall('intrakore_estimation.api.upload_boq');

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload an Excel or CSV file');
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bid_id', bid.name);
      
      const result = await uploadBOQ(formData);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadResult(result.message);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>
            {bid?.project_name || 'Upload BOQ'}
          </h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            <code className="px-1.5 py-0.5 rounded text-xs mr-2" style={{ backgroundColor: 'var(--surface-gray-2)', color: 'var(--ink-gray-6)' }}>
              {bid?.bid_code || 'INT-26-XXX'}
            </code>
            {bid?.client_name && ` · ${bid.client_name}`}
            {bid?.submission_date && ` · Due ${bid.submission_date}`}
          </div>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/bids'}>
          Save & Exit
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 p-4 rounded-xl flex-wrap" style={{ backgroundColor: 'var(--surface-gray-2)', border: '1px solid var(--outline-gray-1)' }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
              idx === currentStep ? 'bg-blue-600 text-white font-medium' : 
              idx < currentStep ? 'text-green-600' : 'text-gray-500'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                idx === currentStep ? 'bg-white text-blue-600' : 
                idx < currentStep ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {idx < currentStep ? '✓' : idx + 1}
              </div>
              {step}
            </div>
            {idx < steps.length - 1 && <div className="w-4 h-px bg-gray-300"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* AI Callout */}
      <Alert theme="purple">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
          <div>
            <strong>Ready to upload your BOQ?</strong> Intrakore supports Excel (.xlsx, .xls) and CSV files. 
            We'll automatically detect bills, sections, and line items.
          </div>
        </div>
      </Alert>

      {/* Upload Area */}
      {!uploadResult ? (
        <Card>
          <div className="p-8 text-center">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all hover:border-blue-400"
              style={{ borderColor: 'var(--outline-gray-2)' }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div className="font-medium mb-2" style={{ color: 'var(--ink-gray-8)' }}>
                Drop the client's BOQ file here
              </div>
              <div className="text-sm mb-4" style={{ color: 'var(--ink-gray-5)' }}>
                or click to browse
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-gray-4)' }}>
                Supported: .xlsx, .xls, .csv · Max 50 MB
              </div>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-4 p-3 rounded-lg flex justify-between items-center" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm" style={{ color: 'var(--ink-gray-8)' }}>{file.name}</span>
                  <span className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                {!uploading && (
                  <Button size="sm" onClick={handleUpload}>
                    Upload
                  </Button>
                )}
              </div>
            )}

            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} size="md" />
                <div className="text-center text-sm mt-2" style={{ color: 'var(--ink-gray-5)' }}>
                  {uploadProgress < 100 ? 'Uploading and parsing BOQ...' : 'Processing complete!'}
                </div>
              </div>
            )}

            {error && (
              <Alert theme="error" className="mt-4">
                {error}
              </Alert>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Upload Result */}
          <div className="p-4 rounded-lg flex justify-between items-center" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
            <div>
              <div className="font-medium" style={{ color: 'var(--ink-gray-8)' }}>
                {uploadResult.filename}
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
                {uploadResult.bills} bills · {uploadResult.lines} line items detected · {uploadResult.size} MB
              </div>
            </div>
            <Badge theme="success"><CheckCircle className="w-3 h-3 mr-1" /> Uploaded</Badge>
          </div>

          {/* AI Analysis Result */}
          <Alert theme="purple">
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <strong>Structure detected.</strong> Kore identified {uploadResult.bills} bills and {uploadResult.sections} section headers.
                Column headers recognised with {uploadResult.confidence || 94}% confidence. Confirm the parsing on the next step.
              </div>
            </div>
          </Alert>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setUploadResult(null)}>
              Replace file
            </Button>
            <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/review'}>
              Review imported BOQ →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
