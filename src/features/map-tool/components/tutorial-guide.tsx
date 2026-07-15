import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import Image from 'next/image';

interface TutorialStep {
    targetId?: string;
    title: string;
    content: string;
    /** Where to position the popover card */
    position: 'top' | 'bottom' | 'center';
    /** Whether to show the spotlight cutout + border highlight (default: true when targetId is set) */
    highlight?: boolean;
}

const STEPS: TutorialStep[] = [
    {
        title: "স্বাগতম!",
        content: "Mouza Map Pro তে স্বাগতম! চলুন ধাপে ধাপে দেখে নিই কীভাবে খুব সহজে জমির পরিমাপ বের করা যায়।",
        position: 'center',
        highlight: false,
    },
    {
        targetId: 'step-home',
        title: "টুলস পেজ",
        content: "যেকোনো সময় টুলস পেজে ফিরে যেতে এই বাটনে ক্লিক করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-image-upload',
        title: "ম্যাপ আপলোড",
        content: "শুরু করার জন্য বাম পাশ থেকে আপনার মৌজা ম্যাপের ছবিটি আপলোড করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-drive',
        title: "ড্রাইভ থেকে ম্যাপ আপলোড",
        content: "গুগল ড্রাইভ থেকে সরাসরি যেকোনো মৌজা ম্যাপ (PDF বা ছবি) ইম্পোর্ট করতে এখানে ক্লিক করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-calibration',
        title: "স্কেল ক্যালিব্রেশন",
        content: "স্কেল ক্যালিব্রেশন অত্যন্ত জরুরি। ম্যাপের জানা কোনো দূরত্বের ওপর ভিত্তি করে স্কেল ঠিক করে নিন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-drawing',
        title: "নকশা আঁকা",
        content: "'প্লট আঁকুন' বাটনে ক্লিক করে পয়েন্ট যোগ করুন। ৩ বা তার বেশি পয়েন্ট হলে 'শেষ করুন' চাপুন, অথবা প্রথম পয়েন্টের snap circle এ গিয়ে close করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-divide',
        title: "জমি ভাগ করা",
        content: "আঁকা প্লটটিকে নির্দিষ্ট মাপে ভাগ করতে এই টুলটি ব্যবহার করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-diagonals',
        title: "কর্ণ (Diagonals)",
        content: "প্লটের ভেতরের কর্ণগুলো (diagonals) দেখতে বা লুকাতে এটি ক্লিক করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-magnifier',
        title: "ম্যাগনিফায়ার",
        content: "ম্যাপের কোনো নির্দিষ্ট অংশ জুম করে নিখুঁতভাবে দেখতে ম্যাগনিফায়ার ব্যবহার করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-save',
        title: "প্রজেক্ট সেভ",
        content: "আপনার কাজ শেষে প্রজেক্টটি সেভ করতে এখানে ক্লিক করুন।",
        position: 'bottom',
        highlight: true,
    },

    {
        targetId: 'step-theme',
        title: "থিম পরিবর্তন",
        content: "আপনার সুবিধামতো ডার্ক (Dark) বা লাইট (Light) থিম বেছে নিতে এখানে ক্লিক করুন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-help',
        title: "সাহায্য ও টিউটোরিয়াল",
        content: "ম্যাপ টুলের কোনো অপশন বুঝতে সমস্যা হলে এই টিউটোরিয়ালটি পুনরায় চালু করতে পারবেন।",
        position: 'bottom',
        highlight: true,
    },
    {
        targetId: 'step-map-stage',
        title: "ম্যাপ স্টেজ",
        content: "এটি হলো আপনার ম্যাপ স্টেজ। এখানে আপনি ড্রয়িং করতে পারবেন। মাউসের চাকা ঘুরিয়ে জুম করতে পারেন।",
        position: 'center', // popover: centered on screen
        highlight: true, // but still spotlight the canvas
    },
    {
        targetId: 'step-results',
        title: "ফলাফল ও প্রিন্ট",
        content: "এখানে আপনি প্লটের আয়তন (শতাংশ, কাঠা, স্কয়ার ফিট) দেখতে পাবেন। 'Print Report' বাটনে ক্লিক করে পিডিএফ সেভ করতে পারবেন।",
        position: 'top',
        highlight: true,
    },
];

export const TutorialGuide = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            setTimeout(() => setIsOpen(true), 1000);
        }

        const handleStartTutorial = () => {
            setCurrentStep(0);
            setIsOpen(true);
        };
        window.addEventListener('start-tutorial', handleStartTutorial);
        return () => window.removeEventListener('start-tutorial', handleStartTutorial);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const step = STEPS[currentStep];
        if (step.targetId && step.highlight) {
            const elements = document.querySelectorAll(`[id="${step.targetId}"]`);
            let visibleElement: HTMLElement | null = null;
            elements.forEach(el => {
                if ((el as HTMLElement).offsetWidth > 0 || (el as HTMLElement).offsetHeight > 0) {
                    visibleElement = el as HTMLElement;
                }
            });

            if (visibleElement) {
                const targetEl = visibleElement as HTMLElement;
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    setTargetRect(targetEl.getBoundingClientRect());
                }, 350);
            } else {
                setTimeout(() => setTargetRect(null), 0);
            }
        } else {
            setTimeout(() => setTargetRect(null), 0);
        }

        const handleResize = () => {
            if (step.targetId && step.highlight) {
                const elements = document.querySelectorAll(`[id="${step.targetId}"]`);
                elements.forEach(el => {
                    if ((el as HTMLElement).offsetWidth > 0 || (el as HTMLElement).offsetHeight > 0) {
                        setTargetRect(el.getBoundingClientRect());
                    }
                });
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize, true);
        };
    }, [currentStep, isOpen]);

    if (!isOpen) return null;

    const step = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;
    const showHighlight = !!(targetRect && step.highlight);

    const handleNext = () => {
        if (isLastStep) closeTutorial();
        else setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => setCurrentStep(prev => Math.max(0, prev - 1));

    const closeTutorial = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    // Popover position
    const popoverStyle = (): React.CSSProperties => {
        if (step.position === 'center' || !targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '90vw',
                width: '360px',
            };
        }

        let actualPosition = step.position;
        // Auto-flip if it would overflow the screen vertically
        if (actualPosition === 'bottom' && targetRect.bottom + 250 > window.innerHeight) {
            actualPosition = 'top';
        } else if (actualPosition === 'top' && targetRect.top - 250 < 0) {
            actualPosition = 'bottom';
        }

        if (actualPosition === 'bottom') {
            return {
                top: targetRect.bottom + 20,
                left: Math.min(
                    Math.max(targetRect.left + targetRect.width / 2, 180),
                    window.innerWidth - 180
                ),
                transform: 'translate(-50%, 0)',
                maxWidth: '90vw',
                width: '360px',
            };
        }
        // top
        return {
            top: Math.max(20, targetRect.top - 20),
            left: Math.min(
                Math.max(targetRect.left + targetRect.width / 2, 180),
                window.innerWidth - 180
            ),
            transform: 'translate(-50%, -100%)',
            maxWidth: '90vw',
            width: '360px',
        };
    };

    const pad = 10;

    return (
        <div className="fixed inset-0 z-200 pointer-events-none">

            {/* ── Dark overlay with optional spotlight cutout ── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="tutorial-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {showHighlight && (
                            <rect
                                x={Math.max(0, targetRect!.left - pad)}
                                y={Math.max(0, targetRect!.top - pad)}
                                width={targetRect!.width + pad * 2}
                                height={targetRect!.height + pad * 2}
                                rx="10"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.65)"
                    mask="url(#tutorial-mask)"
                />
            </svg>

            {/* ── Glowing border on top of canvas (separate from SVG) ── */}
            {showHighlight && (
                <div
                    className="absolute pointer-events-none rounded-[10px]"
                    style={{
                        top: Math.max(0, targetRect!.top - pad),
                        left: Math.max(0, targetRect!.left - pad),
                        width: targetRect!.width + pad * 2,
                        height: targetRect!.height + pad * 2,
                        boxShadow: '0 0 0 2px #38bdf8, 0 0 24px 6px rgba(56,189,248,0.35)',
                        border: '2px dashed #38bdf8',
                        animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                    }}
                />
            )}

            {/* ── Popover card ── */}
            <div
                className="absolute pointer-events-auto"
                style={popoverStyle()}
            >
                <div className="bg-background border border-border rounded-xl shadow-2xl p-5 relative w-full overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full pointer-events-none" />

                    <button
                        onClick={closeTutorial}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Welcome image (step 0 only) */}
                    {currentStep === 0 && (
                        <div className="relative mb-4 rounded-lg overflow-hidden h-36 flex items-center justify-center">
                            <Image
                                src="/assets/hero.png"
                                alt="Welcome"
                                fill
                                className="object-contain opacity-80"
                                sizes="(max-width: 768px) 100vw, 360px"
                            />
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-black shrink-0">
                            {currentStep + 1}
                        </span>
                        {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                        {step.content}
                    </p>

                    <div className="flex items-center justify-between">
                        {/* Progress dots */}
                        <div className="flex gap-1">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentStep === 0}>
                                <ChevronLeft size={16} className="mr-1" />
                                পূর্ববর্তী
                            </Button>
                            <Button variant="default" size="sm" onClick={handleNext}>
                                {isLastStep ? 'শেষ করুন' : 'পরবর্তী'}
                                {!isLastStep && <ChevronRight size={16} className="ml-1" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
