import React from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';
import { Info, FileText, Database, Server, Activity, ArrowRight } from 'lucide-react';

function Upload() {
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    // Navigate to analysis page after 2 seconds
    setTimeout(() => {
      navigate(`/analysis/${result.startup_id}`);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Upload Startup Documents</h1>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
          Upload pitch decks, financial reports, business plans, and other documents
          to begin AI-powered analysis. Our system will extract insights, generate scores,
          and provide comprehensive market analysis.
        </p>
      </div>

      <DocumentUpload onUploadSuccess={handleUploadSuccess} />

      <div className="mt-12 bg-white/5 backdrop-blur-sm border-l-4 border-[#00FF41] rounded-r-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-[#00FF41]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Info className="text-[#00FF41]" size={24} />
          <h3 className="text-xl font-bold text-white">System Protocol: Analysis Sequence</h3>
        </div>

        <ul className="grid gap-4 relative z-10">
          {[
            { icon: FileText, title: "Document Processing", text: "We extract text from PDFs, Word docs, presentations, and spreadsheets" },
            { icon: Database, title: "RAG Indexing", text: "Content is chunked and indexed in our vector database for semantic search" },
            { icon: Server, title: "AI Analysis", text: "Generate comprehensive analysis covering team, product, market, and more" },
            { icon: Activity, title: "Scoring Matrix", text: "Calculate scores across 6 dimensions (team, product, market, traction, financials, innovation)" },
            { icon: ArrowRight, title: "Market Analysis", text: "Estimate TAM/SAM/SOM and identify competitive landscape" }
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <item.icon className="w-5 h-5 text-[#00E5FF] mt-1 shrink-0" />
              <div>
                <span className="block font-bold text-white text-sm mb-1">{item.title}</span>
                <span className="text-zinc-400 text-sm">{item.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Upload;