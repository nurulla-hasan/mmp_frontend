
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';

export const SidebarImagePanel = () => {
  const { selectedFile, handleImageUpload, confirmClearMap, isProcessingFile, isGeneratingTiles, tileProgress, pdfDpiInfo } = useMapStore(useShallow((s) => ({
    selectedFile: s.selectedFile,
    handleImageUpload: s.handleImageUpload,
    confirmClearMap: s.confirmClearMap,
    isProcessingFile: s.isProcessingFile,
    isGeneratingTiles: s.isGeneratingTiles,
    tileProgress: s.tileProgress,
    pdfDpiInfo: s.pdfDpiInfo,
  })));
  
  return (
    <div id="step-image-upload">
      <label className="block text-sm font-medium text-foreground mb-1">1. ম্যাপ আপলোড করুন</label>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        {!selectedFile ? (
          <div className="flex items-center justify-center w-full">
            <label htmlFor="map-upload" className={`flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed rounded-lg bg-background transition-colors p-4 ${isProcessingFile ? 'cursor-wait opacity-75' : 'cursor-pointer hover:bg-accent/50'}`}>
              <div className="flex flex-col items-center justify-center text-center">
                <svg className="w-8 h-8 mb-2 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-muted-foreground px-2">
                  <span className="font-semibold">আপলোড করতে ক্লিক করুন</span> অথবা ফাইলটি টেনে আনুন
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, JPG
                </p>
              </div>
              <input 
                id="map-upload" 
                type="file" 
                onChange={handleImageUpload} 
                accept=".pdf,.png,.jpg,.jpeg"
                disabled={isProcessingFile}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <div className="flex items-center justify-between w-full p-3 border rounded-md bg-background overflow-hidden gap-2">
              <div className="flex items-center space-x-2 overflow-hidden flex-1">
                <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => confirmClearMap()}
                className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="ফাইলটি সরান"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Tile generation progress bar */}
            {isGeneratingTiles && (
              <div className="w-full">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>টাইল তৈরি হচ্ছে...</span>
                  <span>{tileProgress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${tileProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* PDF DPI info — shows for all PDFs after processing */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 min-h-7">
              {pdfDpiInfo ? (
                <>
                  <span className="font-semibold text-foreground">DPI:</span>
                  <span>{pdfDpiInfo.dpi} DPI</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{pdfDpiInfo.imageWidthPx}×{pdfDpiInfo.imageHeightPx}px</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{pdfDpiInfo.pageWidthInches.toFixed(1)}&quot;×{pdfDpiInfo.pageHeightInches.toFixed(1)}&quot;</span>
                </>
              ) : isProcessingFile ? (
                <span className="italic">DPI detecting...</span>
              ) : selectedFile?.type === 'application/pdf' ? (
                <span className="italic text-amber-600 dark:text-amber-400">DPI সনাক্ত করা যায়নি</span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

