'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Folder, Image as ImageIcon, ChevronRight, HardDrive } from 'lucide-react';
import Image from 'next/image';
import { getDriveFolders, getDriveFiles } from '@/actions/drive';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { toast } from 'sonner';
import { ErrorToast, SuccessToast } from '@/lib/utils';

type Breadcrumb = { id: string | undefined; name: string };
type DriveFolder = { id: string; name: string };
type DriveFile = { id: string; name: string; thumbnailLink?: string; size?: string };

export function DriveMapBrowser({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: undefined, name: 'Google Drive' }]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  
  const { setImage, setImageName } = useMapStore();
  
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const [foldersRes, filesRes] = await Promise.all([
          getDriveFolders(currentFolderId),
          getDriveFiles(currentFolderId || process.env.NEXT_PUBLIC_DRIVE_ROOT_FOLDER_ID || '') 
        ]);

        if (foldersRes.success) setFolders((foldersRes.folders as DriveFolder[]) || []);
        else toast.error(foldersRes.error);

        if (filesRes.success) setFiles((filesRes.files as DriveFile[]) || []);
        else toast.error(filesRes.error);
      } catch {
        toast.error('Failed to load drive contents');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchContents();
    }
  }, [open, currentFolderId]);

  const navigateToFolder = (folderId: string, name: string) => {
    setBreadcrumbs(prev => [...prev, { id: folderId, name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const handleSelectFile = async (file: DriveFile) => {
    setLoadingFileId(file.id);
    try {
      const response = await fetch(`/api/drive/proxy?id=${file.id}`);
      if (!response.ok) throw new Error('Failed to download image');
      
      const blob = await response.blob();
      const fileObj = new File([blob], file.name, { type: blob.type || 'image/jpeg' });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          setImageName(fileObj.name);
          setLoadingFileId(null);
          onOpenChange(false);
          SuccessToast('ম্যাপ ইমপোর্ট করা হয়েছে!');
        };
        img.onerror = () => {
          ErrorToast('ম্যাপ লোড করতে সমস্যা হয়েছে');
          setLoadingFileId(null);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(fileObj);
    } catch {
      ErrorToast('ম্যাপ ডাউনলোড করতে ব্যর্থ হয়েছে');
      setLoadingFileId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            ড্রাইভ থেকে ম্যাপ আনুন
          </DialogTitle>
        </DialogHeader>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-muted/30 overflow-x-auto whitespace-nowrap border-b">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id || 'root'} className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 h-7 ${idx === breadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                onClick={() => navigateToBreadcrumb(idx)}
              >
                {crumb.name}
              </Button>
              {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <Folder className="h-12 w-12 opacity-20" />
              <p>এই ফোল্ডারটি খালি</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => navigateToFolder(folder.id, folder.name)}
                  className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted cursor-pointer transition-colors text-center gap-3 group"
                >
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-sm font-medium line-clamp-2">{folder.name}</span>
                </div>
              ))}
              
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className="relative flex flex-col p-2 border rounded-xl hover:border-primary cursor-pointer transition-all group overflow-hidden"
                >
                  <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                    {file.thumbnailLink ? (
                      <Image 
                        src={file.thumbnailLink} 
                        alt={file.name} 
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-medium line-clamp-2 px-1 pb-1">{file.name}</span>
                  
                  {loadingFileId === file.id && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
