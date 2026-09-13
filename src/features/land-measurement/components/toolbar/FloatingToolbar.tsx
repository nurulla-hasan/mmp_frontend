'use client';

import { useRef, useMemo, useCallback, memo } from 'react';
import {
    Upload, Ruler, PenTool, Scissors, Eye, EyeOff, Search, HelpCircle,
    Moon, Sun, MoreHorizontal, HardDrive, RotateCcw, FolderOpen, BookmarkCheck,
    Undo2, Redo2, Trash2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';

const ToolTip = memo(function ToolTip({ label, children, side = "left" }: { label: React.ReactNode; children: React.ReactNode; side?: "left" | "top" | "right" | "bottom" }) {
    return (
        <Tooltip>
            <TooltipTrigger render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} sideOffset={8}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
});

const ToolBtn = memo(function ToolBtn({
    icon: Icon,
    label,
    onClick,
    active,
    disabled,
    variant = 'default',
    size = 'md',
    id,
    href,
}: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'danger';
    size?: 'md' | 'sm';
    id?: string;
    href?: string;
}) {
    const actualVariant = active ? "default" : (variant === 'danger' ? 'destructive' : 'ghost');
    const sizeClass = size === 'md' ? "icon-lg" : "icon";

    const btn = (
        <Button
            id={id}
            variant={actualVariant}
            size={sizeClass}
            onClick={href ? undefined : onClick}
            disabled={disabled}
            className={active ? "" : (variant === 'danger' ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground")}
            nativeButton={!href}
            render={href ? <a href={href} target="_blank" rel="noopener noreferrer" /> : undefined}
        >
            <Icon className={size === 'md' ? "size-5" : "size-4"} />
        </Button>
    );

    return (
        <ToolTip label={label}>
            {disabled ? (
                <span className="cursor-not-allowed inline-flex">
                    {btn}
                </span>
            ) : btn}
        </ToolTip>
    );
});

function VDivider() {
    return <div className="my-1 h-px w-7 self-center bg-border" />;
}

function HDivider() {
    return <div className="mx-0.5 h-6 w-px shrink-0 bg-border/60" />;
}

interface FloatingToolbarProps {
    onOpenLoad?: () => void;
    onOpenSave?: () => void;
}

export function FloatingToolbar({ onOpenLoad, onOpenSave }: FloatingToolbarProps = {}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme, setTheme } = useTheme();

    const {
        selectedFile,
        handleImageUpload,
        confirmClearMap,
        isProcessingFile,
        mode,
        image,
        scale,
        plots,
        plotPoints,
        plotPointsFuture,
        plotsHistory,
        plotsFuture,
        undoPlotAction,
        redoPlotAction,
        setMode,
        setIsDrawing,
        setCalibrationLine,
        confirmClearPlot,
        startPlotDrawing,
        startManualDivide,
        isShowDiagonals,
        diagonalPlotId,
        isSelectingDiagonalPlot,
        setDiagonalPlotId,
        setIsSelectingDiagonalPlot,
        isMagnifierEnabled,
        setIsMagnifierEnabled,
    } = useMapStore(useShallow((s) => ({
        selectedFile: s.selectedFile,
        handleImageUpload: s.handleImageUpload,
        confirmClearMap: s.confirmClearMap,
        isProcessingFile: s.isProcessingFile,
        mode: s.mode,
        image: s.image,
        scale: s.scale,
        plots: s.plots,
        plotPoints: s.plotPoints,
        plotPointsFuture: s.plotPointsFuture,
        plotsHistory: s.plotsHistory,
        plotsFuture: s.plotsFuture,
        undoPlotAction: s.undoPlotAction,
        redoPlotAction: s.redoPlotAction,
        setMode: s.setMode,
        setIsDrawing: s.setIsDrawing,
        setCalibrationLine: s.setCalibrationLine,
        confirmClearPlot: s.confirmClearPlot,
        startPlotDrawing: s.startPlotDrawing,
        startManualDivide: s.startManualDivide,
        isShowDiagonals: s.isShowDiagonals,
        diagonalPlotId: s.diagonalPlotId,
        isSelectingDiagonalPlot: s.isSelectingDiagonalPlot,
        setDiagonalPlotId: s.setDiagonalPlotId,
        setIsSelectingDiagonalPlot: s.setIsSelectingDiagonalPlot,
        isMagnifierEnabled: s.isMagnifierEnabled,
        setIsMagnifierEnabled: s.setIsMagnifierEnabled,
    })));

    const isDrawing = mode === 'drawing_plot' || mode === 'calibrating' || mode === 'manual_divide_plot';
    const hasAnyPlotWork = plots.length > 0 || plotPoints.length > 0 || plotsFuture.length > 0;

    const handleUploadClick = useCallback(() => {
        if (selectedFile || image) {
            confirmClearMap(() => {
                fileInputRef.current?.click();
            });
        } else {
            fileInputRef.current?.click();
        }
    }, [selectedFile, image, confirmClearMap]);

    const handleCalibrateClick = useCallback(() => {
        if (!image) return;
        confirmClearPlot(() => {
            setMode('calibrating');
            setIsDrawing(false);
            setCalibrationLine([]);
        });
    }, [image, confirmClearPlot, setMode, setIsDrawing, setCalibrationLine]);

    const handleDiagonalsClick = useCallback(() => {
        if (diagonalPlotId || isSelectingDiagonalPlot || isShowDiagonals) {
            setDiagonalPlotId(null);
            setIsSelectingDiagonalPlot(false);
            return;
        }
        setIsSelectingDiagonalPlot(true);
    }, [diagonalPlotId, isSelectingDiagonalPlot, isShowDiagonals, setDiagonalPlotId, setIsSelectingDiagonalPlot]);

    const commonTools = useMemo(() => ({
        upload: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Upload}
                label={selectedFile ? `${selectedFile.name} — Change` : 'Upload Map'}
                active={!!selectedFile}
                onClick={handleUploadClick}
                disabled={isProcessingFile}
                size={size}
                id="step-image-upload"
            />
        ),
        saved: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={FolderOpen}
                label="Saved Measurements"
                onClick={onOpenLoad}
                size={size}
                id="step-saved-calculations"
            />
        ),
        save: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={BookmarkCheck}
                label={plots.length > 0 ? "Save Measurement" : "Draw plots to save"}
                active={plots.length > 0}
                onClick={onOpenSave}
                disabled={plots.length === 0}
                size={size}
                id="step-save-calculation"
            />
        ),
        drive: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={HardDrive}
                label="Download from Drive"
                href="https://drive.google.com/drive/folders/1r0ryb1SyCeYV-41CM1WweokGDKT5t9RB"
                size={size}
                id="step-drive"
            />
        ),
        calibrate: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Ruler}
                label={scale ? `Scale: 1 px ≈ ${(1 / scale).toFixed(2)} ft — Change` : 'Set Scale'}
                active={mode === 'calibrating'}
                onClick={handleCalibrateClick}
                disabled={!image || mode === 'calibrating'}
                size={size}
                id="step-calibration"
            />
        ),
        draw: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={PenTool}
                label={mode === 'drawing_plot' ? 'Drawing in progress...' : plots.length > 0 ? 'Draw Another Plot' : 'Draw Plot'}
                active={mode === 'drawing_plot'}
                onClick={startPlotDrawing}
                disabled={!image || !scale || mode === 'drawing_plot' || mode === 'calibrating'}
                size={size}
                id="step-drawing"
            />
        ),
        undoPoint: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Undo2}
                label="Undo Point"
                onClick={undoPlotAction}
                disabled={mode !== 'drawing_plot' || plotPoints.length === 0}
                size={size}
            />
        ),
        redoPoint: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Redo2}
                label="Redo Point"
                onClick={redoPlotAction}
                disabled={mode !== 'drawing_plot' || plotPointsFuture.length === 0}
                size={size}
            />
        ),
        divide: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Scissors}
                label="Divide Plot"
                active={mode === 'manual_divide_plot'}
                onClick={startManualDivide}
                disabled={plots.length === 0 || isDrawing}
                size={size}
                id="step-divide"
            />
        ),
        diagonals: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={(diagonalPlotId || isSelectingDiagonalPlot) ? Eye : EyeOff}
                label={diagonalPlotId ? 'Hide Diagonals' : isSelectingDiagonalPlot ? 'Cancel Plot Selection' : 'Show Plot Diagonals'}
                active={Boolean(diagonalPlotId) || isSelectingDiagonalPlot}
                onClick={handleDiagonalsClick}
                disabled={plots.length === 0 || isDrawing}
                size={size}
                id="step-diagonals"
            />
        ),
        magnifier: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Search}
                label={isMagnifierEnabled ? 'Disable Magnifier' : 'Enable Magnifier'}
                active={isMagnifierEnabled}
                onClick={() => setIsMagnifierEnabled(!isMagnifierEnabled)}
                size={size}
                id="step-magnifier"
            />
        ),
        undoPlot: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Undo2}
                label="Undo Plot"
                onClick={undoPlotAction}
                disabled={isDrawing || plotsHistory.length === 0}
                size={size}
            />
        ),
        redoPlot: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Redo2}
                label="Redo Plot"
                onClick={redoPlotAction}
                disabled={isDrawing || plotsFuture.length === 0}
                size={size}
            />
        ),
        clearPlots: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Trash2}
                label="Clear All Plots"
                onClick={() => confirmClearPlot()}
                disabled={!hasAnyPlotWork || isDrawing}
                variant="danger"
                size={size}
                id="step-clear-plots"
            />
        ),
        reset: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={RotateCcw}
                label="Reset Map"
                onClick={() => confirmClearMap()}
                disabled={!image || isDrawing}
                variant="danger"
                size={size}
                id="step-reset"
            />
        ),
        themeToggle: (size: 'md' | 'sm' = 'md') => {
            const isDark = theme === 'dark';
            return (
                <ToolBtn
                    icon={isDark ? Sun : Moon}
                    label={isDark ? 'Light Theme' : 'Dark Theme'}
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    size={size}
                    id="step-theme"
                />
            );
        },
        help: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={HelpCircle}
                label="Help / Tutorial"
                onClick={() => window.dispatchEvent(new Event('start-tutorial'))}
                size={size}
                id="step-help"
            />
        ),
    }), [
        selectedFile, isProcessingFile, handleUploadClick, onOpenLoad, onOpenSave,
        scale, mode, image, plots.length, plotPoints.length, plotPointsFuture.length,
        plotsHistory.length, plotsFuture.length, isDrawing, hasAnyPlotWork,
        handleCalibrateClick, startPlotDrawing, undoPlotAction, redoPlotAction,
        startManualDivide, diagonalPlotId, isSelectingDiagonalPlot, handleDiagonalsClick,
        isMagnifierEnabled, setIsMagnifierEnabled, theme, setTheme, confirmClearMap,
        confirmClearPlot
    ]);

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                disabled={isProcessingFile}
                onChange={handleImageUpload}
            />

            {isSelectingDiagonalPlot && (
                <div className="pointer-events-none absolute left-4 top-18 z-50 rounded-lg border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md">
                    কর্ণ দেখতে একটি প্লট নির্বাচন করুন
                </div>
            )}

            <div
                id="step-toolbar"
                className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex"
            >
                {commonTools.upload()}
                {commonTools.saved()}
                {plots.length > 0 && commonTools.save()}
                {commonTools.drive()}
                <VDivider />
                {commonTools.calibrate()}
                {commonTools.draw()}
                {mode === 'drawing_plot' && commonTools.undoPoint()}
                {mode === 'drawing_plot' && commonTools.redoPoint()}
                {commonTools.divide()}
                <VDivider />
                {commonTools.diagonals()}
                {commonTools.magnifier()}
                <VDivider />
                <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={false} render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
                        <ToolBtn icon={MoreHorizontal} label="More Tools" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="left"
                        align="end"
                        sideOffset={10}
                        className="w-fit p-1 rounded-2xl border border-border bg-card/95 shadow-xl"
                    >
                        <div className="flex flex-row items-center gap-1">
                            {commonTools.undoPlot('sm')}
                            {commonTools.redoPlot('sm')}
                            {commonTools.clearPlots('sm')}
                            {commonTools.reset('sm')}
                            <div className="mx-0.5 h-6 w-px bg-border/60" />
                            {commonTools.themeToggle('sm')}
                            {commonTools.help('sm')}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {scale && !isDrawing && (
                <div className="absolute bottom-18 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border bg-card/95 px-3 py-1 shadow-md text-xs font-medium md:hidden text-primary whitespace-nowrap">
                    Scale: 1 px ≈ {(1 / scale).toFixed(2)} ft
                </div>
            )}

            <div id="step-toolbar" className={`absolute bottom-4 left-1/2 z-40 flex w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center justify-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl ${isDrawing ? 'hidden' : 'flex md:hidden'}`}>
                {commonTools.upload('sm')}
                {commonTools.saved('sm')}
                <HDivider />
                {commonTools.calibrate('sm')}
                {commonTools.draw('sm')}
                {commonTools.divide('sm')}
                <HDivider />
                {commonTools.magnifier('sm')}
                <HDivider />
                <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={false} render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
                        <ToolBtn
                            icon={MoreHorizontal}
                            label="More Tools"
                            size="sm"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="end"
                        sideOffset={12}
                        className="w-fit p-1 rounded-2xl border border-border bg-card/95 shadow-xl"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-1">
                                {plots.length > 0 && commonTools.save('sm')}
                                {commonTools.drive('sm')}
                                {commonTools.diagonals('sm')}
                                {commonTools.themeToggle('sm')}
                                {commonTools.help('sm')}
                            </div>
                            <div className="flex flex-row items-center gap-1 border-t border-border/60 pt-1">
                                {commonTools.undoPlot('sm')}
                                {commonTools.redoPlot('sm')}
                                {commonTools.clearPlots('sm')}
                                {commonTools.reset('sm')}
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
