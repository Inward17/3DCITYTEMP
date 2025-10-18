import React, { useState } from 'react';
import { Download, FileImage, FileText, Share2, Camera, Map } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportControlsProps {
  projectName: string;
  projectId: string;
}

export function ExportControls({ projectName, projectId }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) throw new Error('No canvas found');

      // Create a higher resolution capture
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${projectName.replace(/\s+/g, '_')}_city_view.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) throw new Error('No canvas found');

      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = 210; // A4 landscape height
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(projectName, 20, 20);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add image
      pdf.addImage(dataURL, 'PNG', 10, 40, imgWidth - 20, imgHeight - 50);
      
      // Save PDF
      pdf.save(`${projectName.replace(/\s+/g, '_')}_city_plan.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/project/${projectId}`;
    
    if (navigator.share) {
      navigator.share({
        title: projectName,
        text: `Check out my city planning project: ${projectName}`,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
  };

  const captureScreenshot = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('city-viewer-container') || document.body;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      link.download = `${projectName.replace(/\s+/g, '_')}_screenshot.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Screenshot failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={exportAsImage}
            disabled={isExporting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            title="Export as PNG"
          >
            <FileImage className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </button>
          
          <button
            onClick={exportAsPDF}
            disabled={isExporting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            title="Export as PDF"
          >
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
          </button>
          
          <button
            onClick={captureScreenshot}
            disabled={isExporting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            title="Take Screenshot"
          >
            <Camera className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
          </button>
          
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            title="Share Project"
          >
            <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          </button>
        </div>
        
        {isExporting && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Exporting...
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Project</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/project/${projectId}`}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/project/${projectId}`);
                        alert('Link copied!');
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={generateShareLink}
                  className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share via System
                </button>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}