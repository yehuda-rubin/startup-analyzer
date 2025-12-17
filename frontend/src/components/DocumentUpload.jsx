import React, { useState } from 'react';
import { uploadDocuments } from '../services/api';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function DocumentUpload({ onUploadSuccess }) {
  const [startupName, setStartupName] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startupName || files.length === 0) {
      setMessage({ type: 'error', text: 'Please provide startup name and select files' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const result = await uploadDocuments(startupName, files);
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${result.total_documents} documents for ${result.startup_name}`
      });
      setStartupName('');
      setFiles([]);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8 relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00FF41]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00FF41]/10 transition-colors duration-500" />

      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <UploadCloud className="text-[#00FF41]" />
        Upload Data
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[#E0E0E0] text-xs font-semibold mb-2 uppercase tracking-wider pl-1">
            Startup Name
          </label>
          <input
            type="text"
            value={startupName}
            onChange={(e) => setStartupName(e.target.value)}
            placeholder="e.g. Neural Link Systems"
            className="w-full bg-black/50 border border-zinc-800 text-white rounded-lg px-4 py-3 
              focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)]
              transition-all duration-300 placeholder:text-zinc-700 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-[#E0E0E0] text-xs font-semibold mb-2 uppercase tracking-wider pl-1">
            Documentation Sources
          </label>
          <div className="relative group/drop">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.xlsx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              required
            />
            <div className="w-full border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center
                group-hover/drop:border-[#00E5FF] group-hover/drop:bg-[#00E5FF]/5 transition-all duration-300 bg-black/30">
              <UploadCloud className="w-10 h-10 text-zinc-600 mb-4 group-hover/drop:text-[#00E5FF] transition-colors duration-300" />
              <p className="text-zinc-400 text-sm mb-1 font-medium group-hover/drop:text-white transition-colors">
                Click to upload or drag and drop
              </p>
              <p className="text-zinc-600 text-xs">
                PDF, DOCX, PPTX, XLSX (Max 10MB)
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <label className="block text-[#E0E0E0] text-xs font-semibold mb-3 uppercase tracking-wider flex justify-between">
              <span>Selected Files</span>
              <span className="text-[#00FF41]">{files.length} ready</span>
            </label>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-zinc-300 bg-black/30 p-2 rounded border border-white/5">
                  <File size={14} className="text-[#00E5FF]" />
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-zinc-600 text-xs font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={`w-full font-bold py-4 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide text-sm
            ${uploading
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#00FF41] to-[#00E5FF] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)]'
            }`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" /> Processing Data Stream...
            </>
          ) : (
            <>
              Initialize Upload Sequence <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2
          ${message.type === 'success'
            ? 'bg-[#00FF41]/10 border border-[#00FF41]/20 text-[#00FF41]'
            : 'bg-red-500/10 border border-red-500/20 text-red-500'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="shrink-0 h-5 w-5" /> : <AlertCircle className="shrink-0 h-5 w-5" />}
          <div>
            <p className="font-bold mb-1">{message.type === 'success' ? 'Upload Complete' : 'Upload Error'}</p>
            <p className="opacity-90">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;