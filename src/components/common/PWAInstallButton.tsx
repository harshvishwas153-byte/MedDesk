import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, suppress install buttons
  if (isInstalled) {
    return null;
  }

  // Header compact button
  if (variant === 'header') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          title="Install MediCare+ App on your device"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs hover:shadow transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            title="Install MediCare+ on iPhone / iPad"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Install on iOS</span>
            <span className="sm:hidden">Install</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-rose-600" />
                    Install on iPhone / iPad
                  </h3>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <p className="pt-0.5">
                      Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" />{' '}
                      <strong>Share</strong> icon in your Safari bottom bar.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <p className="pt-0.5">
                      Scroll down and tap{' '}
                      <strong className="text-slate-900 inline-flex items-center gap-1">
                        <PlusSquare className="w-3.5 h-3.5 text-slate-700" /> Add to Home Screen
                      </strong>
                      .
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <p className="pt-0.5">
                      Launch <strong>MediCare+</strong> directly from your home screen for a
                      native full-screen mobile app experience.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
  }

  // Floating or banner variant
  return null;
};
