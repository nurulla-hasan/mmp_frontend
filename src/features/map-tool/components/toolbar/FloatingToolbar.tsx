'use client';

import { useRef, useMemo, useCallback, memo } from 'react';
import {
    Upload, Ruler, PenTool, Scissors, Eye, EyeOff, Search, HelpCircle,
    Moon, Sun, MoreHorizontal, HardDrive, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { SaveProjectDialog } from '@/features/map-tool/components/SaveProjectDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';

// ─── Tooltip wrapper ─────────────────────────────────────────────────────────
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

// ─── Icon button ─────────────────────────────────────────────────────────────
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
    const dim = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const classes = [
        `flex ${dim} items-center justify-center rounded-xl transition-all`,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        active
            ? 'bg-primary text-primary-foreground shadow-md'
            : variant === 'danger'
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        disabled ? 'pointer-events-none opacity-40' : '',
    ].join(' ');

    return (
        <ToolTip label={label}>
            <span className={disabled ? "cursor-not-allowed inline-flex" : "inline-flex"}>
                {href ? (
                    <a id={id} href={href} target="_blank" rel="noopener noreferrer" className={classes}>
                        <Icon className={iconSize} />
                    </a>
                ) : (
                    <button id={id} type="button" onClick={onClick} disabled={disabled} className={classes}>
                        <Icon className={iconSize} />
                    </button>
                )}
            </span>
        </ToolTip>
    );
});

// ─── Divider ─────────────────────────────────────────────────────────────────
function VDivider() {
    return <div className="my-1 h-px w-7 self-center bg-border" />;
}
// ─── Main Component ───────────────────────────────────────────────────────────
export function FloatingToolbar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
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
        setMode,
        setIsDrawing,
        setCalibrationLine,
        confirmClearPlot,
        startPlotDrawing,
        startManualDivide,
        isShowDiagonals,
        setIsShowDiagonals,
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
        setMode: s.setMode,
        setIsDrawing: s.setIsDrawing,
        setCalibrationLine: s.setCalibrationLine,
        confirmClearPlot: s.confirmClearPlot,
        startPlotDrawing: s.startPlotDrawing,
        startManualDivide: s.startManualDivide,
        isShowDiagonals: s.isShowDiagonals,
        setIsShowDiagonals: s.setIsShowDiagonals,
        isMagnifierEnabled: s.isMagnifierEnabled,
        setIsMagnifierEnabled: s.setIsMagnifierEnabled,
    })));

    const isDrawing = mode === 'drawing_plot' || mode === 'calibrating' || mode === 'manual_divide_plot';

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

    const commonTools = useMemo(() => ({
        upload: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Upload}
                label={selectedFile ? `${selectedFile.name} — পরিবর্তন করুন` : 'ম্যাপ আপলোড করুন'}
                active={!!selectedFile}
                onClick={handleUploadClick}
                disabled={isProcessingFile}
                size={size}
                id="step-image-upload"
            />
        ),
        drive: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={HardDrive}
                label="ড্রাইভ থেকে ডাউনলোড করুন"
                href="https://drive.google.com/drive/folders/1r0ryb1SyCeYV-41CM1WweokGDKT5t9RB"
                size={size}
                id="step-drive"
            />
        ),
        calibrate: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Ruler}
                label={scale ? `স্কেল: ১ px ≈ ${(1 / scale).toFixed(2)} ft — পরিবর্তন করুন` : 'স্কেল সেট করুন'}
                active={mode === 'calibrating' || !!scale}
                onClick={handleCalibrateClick}
                disabled={!image || mode === 'calibrating'}
                size={size}
                id="step-calibration"
            />
        ),
        draw: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={PenTool}
                label={mode === 'drawing_plot' ? 'আঁকা চলছে...' : plots.length > 0 ? 'আরেক প্লট আঁকুন' : 'প্লট আঁকুন'}
                active={mode === 'drawing_plot'}
                onClick={startPlotDrawing}
                disabled={!image || !scale || mode === 'drawing_plot' || mode === 'calibrating'}
                size={size}
                id="step-drawing"
            />
        ),
        divide: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Scissors}
                label="জমি ভাগ করুন"
                active={mode === 'manual_divide_plot'}
                onClick={startManualDivide}
                disabled={plots.length === 0 || isDrawing}
                size={size}
                id="step-divide"
            />
        ),
        diagonals: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={isShowDiagonals ? Eye : EyeOff}
                label={isShowDiagonals ? 'কর্ণ লুকান' : 'কর্ণ দেখান'}
                active={isShowDiagonals}
                onClick={() => setIsShowDiagonals(!isShowDiagonals)}
                size={size}
                id="step-diagonals"
            />
        ),
        magnifier: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={Search}
                label={isMagnifierEnabled ? 'ম্যাগনিফায়ার বন্ধ' : 'ম্যাগনিফায়ার চালু'}
                active={isMagnifierEnabled}
                onClick={() => setIsMagnifierEnabled(!isMagnifierEnabled)}
                size={size}
                id="step-magnifier"
            />
        ),
        home: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={ArrowLeft}
                label="টুলস"
                onClick={() => router.push('/tools')}
                size={size}
                id="step-home"
            />
        ),
        themeToggle: (size: 'md' | 'sm' = 'md') => {
            const isDark = theme === 'dark';
            return (
                <ToolBtn
                    icon={isDark ? Sun : Moon}
                    label={isDark ? 'লাইট থিম' : 'ডার্ক থিম'}
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    size={size}
                    id="step-theme"
                />
            );
        },

        help: (size: 'md' | 'sm' = 'md') => (
            <ToolBtn
                icon={HelpCircle}
                label="সাহায্য / টিউটোরিয়াল"
                onClick={() => window.dispatchEvent(new Event('start-tutorial'))}
                size={size}
                id="step-help"
            />
        ),
    }), [
        selectedFile, isProcessingFile, handleUploadClick,
        scale, mode, image, plots.length, isDrawing, handleCalibrateClick, startPlotDrawing,
        startManualDivide, isShowDiagonals, setIsShowDiagonals,
        isMagnifierEnabled, setIsMagnifierEnabled, router, theme, setTheme,
    ]);

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                disabled={isProcessingFile}
                onChange={handleImageUpload}
            />

            {/* ── Desktop: floating right panel ─────────────────────────────────── */}
            <div
                id="step-toolbar"
                className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex"
            >
                {commonTools.home()}
                <VDivider />
                {commonTools.upload()}
                {commonTools.drive()}
                <VDivider />
                {commonTools.calibrate()}
                {commonTools.draw()}
                {commonTools.divide()}
                <VDivider />
                {commonTools.diagonals()}
                {commonTools.magnifier()}

                <VDivider />
                <span id="step-save"><SaveProjectDialog iconOnly /></span>
                {commonTools.themeToggle()}
                {commonTools.help()}
            </div>

            {/* ── Mobile: Scale Indicator ───────────────────────────────────────── */}
            {scale && !isDrawing && (
                <div className="absolute bottom-18 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border bg-card/95 px-3 py-1 shadow-md text-[10px] font-medium md:hidden text-primary whitespace-nowrap">
                    স্কেল: ১ px ≈ {(1 / scale).toFixed(2)} ft
                </div>
            )}

            {/* ── Mobile: floating bottom bar ───────────────────────────────────── */}
            <div id="step-toolbar" className={`absolute bottom-4 left-1/2 z-40 w-max max-w-[95vw] flex-wrap -translate-x-1/2 items-center justify-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl ${isDrawing ? 'hidden' : 'flex md:hidden'}`}>
                {commonTools.home('sm')}
                {commonTools.upload('sm')}
                {commonTools.drive('sm')}
                {commonTools.calibrate('sm')}
                {commonTools.draw('sm')}
                {commonTools.divide('sm')}
                <span id="step-save"><SaveProjectDialog iconOnly size="sm" /></span>
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
                        alignOffset={-10}
                        sideOffset={12}
                        className="w-fit"
                    >
                        <div>
                            {commonTools.magnifier('sm')}
                            {commonTools.diagonals('sm')}
                            {commonTools.themeToggle('sm')}
                            {commonTools.help('sm')}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
