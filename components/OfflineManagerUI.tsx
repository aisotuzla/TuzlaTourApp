import React, { useState, useEffect } from 'react';
import { DownloadCloud, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { downloadOfflinePack, clearOfflinePack, getOfflineStorageSizeMB, OfflineProgress } from '../utils/offlineManager';
import { Language } from '../types';

interface OfflineManagerUIProps {
  lang: Language;
}

const OfflineManagerUI: React.FC<OfflineManagerUIProps> = ({ lang }) => {
  const [progress, setProgress] = useState<OfflineProgress>({
    total: 0,
    downloaded: 0,
    status: 'idle',
  });
  const [size, setSize] = useState<string>('0.00');

  const updateSize = async () => {
    const mb = await getOfflineStorageSizeMB();
    setSize(mb);
  };

  useEffect(() => {
    updateSize();
  }, []);

  const handleDownload = async () => {
    await downloadOfflinePack((p) => {
      setProgress(p);
      if (p.status === 'success' || p.status === 'error') {
        updateSize();
      }
    });
  };

  const handleClear = async () => {
    if (window.confirm(lang === 'bs' ? 'Da li ste sigurni da želite obrisati offline podatke?' : 'Are you sure you want to clear offline data?')) {
      await clearOfflinePack();
      setProgress({ total: 0, downloaded: 0, status: 'idle' });
      updateSize();
    }
  };

  return (
    <div className="w-full mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">
          {lang === 'bs' ? 'Offline Mod' : 'Offline Mode'}
        </h4>
        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
          {size} MB
        </span>
      </div>

      {progress.status === 'downloading' ? (
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.downloaded / Math.max(progress.total, 1)) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 font-bold text-center flex items-center justify-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            {progress.message}
          </p>
        </div>
      ) : progress.status === 'success' ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'bs' ? 'Podaci su spremni za offline!' : 'Ready for offline!'}</span>
          </div>
          <button
            onClick={handleClear}
            className="w-full py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {lang === 'bs' ? 'Obriši podatke' : 'Clear Data'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleDownload}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <DownloadCloud className="w-5 h-5" />
          {lang === 'bs' ? 'Preuzmi Offline Paket' : 'Download Offline Pack'}
        </button>
      )}

      {progress.status === 'error' && (
        <p className="mt-2 text-xs text-red-500 font-bold text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {progress.message}
        </p>
      )}
    </div>
  );
};

export default OfflineManagerUI;
