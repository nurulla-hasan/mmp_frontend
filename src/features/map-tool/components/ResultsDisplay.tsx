import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { DECIMALS } from '@/features/map-tool/utils/calculations';
import { formatFeetInches } from '@/features/map-tool/utils/canvas';
import type { PolygonResults } from '@/features/map-tool/types/map';

type ReportTableProps = {
  results: PolygonResults;
};

type SideLengthsListProps = {
  lengths: number[];
  perimeter: number;
  decimals?: number;
  showPerimeter?: boolean;
  diagonals?: { p1Index: number; p2Index: number; lengthFt: number; }[];
};

// Removed ResultsDisplayProps


export const ReportTable = memo(function ReportTable({ results }: ReportTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>একক</TableHead>
          <TableHead>মান</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>শতক</TableCell>
          <TableCell>{results.shotok.toFixed(DECIMALS)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>কাঠা</TableCell>
          <TableCell>{results.katha.toFixed(DECIMALS)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>বর্গফুট</TableCell>
          <TableCell>{results.sqft.toFixed(DECIMALS)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
});

export const SideLengthsList = memo(function SideLengthsList({ lengths, perimeter, showPerimeter = true, diagonals }: SideLengthsListProps) {
  return (
    <>
      <ul className="list-disc list-inside print:hidden text-sm">
        {lengths.map((len, i) => (
          <li key={i}>বাহু {i + 1}: {formatFeetInches(len)}</li>
        ))}
      </ul>
      {diagonals && diagonals.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground print:hidden">
          <span className="font-semibold text-foreground">কর্ণ (Diagonals):</span>
          <ul className="list-inside pl-4">
            {diagonals.map((d, i) => (
              <li key={`diag-${i}`}>
                কোণা {d.p1Index + 1} থেকে {d.p2Index + 1}: {formatFeetInches(d.lengthFt)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showPerimeter && (
        <p className="mt-2 font-semibold text-sm">পরিসীমা: {formatFeetInches(perimeter)}</p>
      )}
    </>
  );
});

import { useMapStore } from '@/features/map-tool/store/useMapStore';

import { Input } from '@/components/ui/input';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export const ResultsDisplay = memo(function ResultsDisplay({ onPrint }: { onPrint: () => void }) {
  const { results, plots, reportInfo, setReportInfo } = useMapStore();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!results) {
    return (
      <div id="step-results" className="mt-6 bg-muted/50 p-4 rounded-lg border border-dashed border-border">
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center text-muted-foreground">
          <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">এখনও কোনো হিসাব নেই</p>
          <p className="text-xs">ম্যাপে প্লট আঁকলে এখানে ফলাফল দেখাবে</p>
        </div>
      </div>
    );
  }

  return (
    <div id="step-results" className="mt-6 bg-muted/50 p-4 rounded-lg border border-border">
      <div className="flex flex-row justify-between items-center mb-4 gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">হিসাবের ফলাফল</h3>
        <Button size="sm" onClick={() => setIsPrintModalOpen(true)} className="print:hidden whitespace-nowrap">
          <Printer />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-base font-medium text-foreground truncate" title="শতক">শতক</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-base sm:text-xl font-bold text-primary truncate">{results.shotok.toFixed(DECIMALS)}</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-base font-medium text-muted-foreground truncate" title="কাঠা">কাঠা</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-base sm:text-xl font-bold text-primary truncate">{results.katha.toFixed(DECIMALS)}</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-base font-medium text-muted-foreground truncate" title="বর্গফুট">বর্গফুট</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-base sm:text-xl font-bold text-primary truncate">{results.sqft.toFixed(DECIMALS)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Label className="mb-2 block">প্লটভিত্তিক ক্ষেত্রফল:</Label>
        <Card className="py-2 sm:py-6">
          <CardContent className="px-2 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>প্লট</TableHead>
                  <TableHead>শতক</TableHead>
                  <TableHead>কাঠা</TableHead>
                  <TableHead>বর্গফুট</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plots.map((plot, index) => (
                  <TableRow key={plot.id}>
                    <TableCell>{plot.name || `প্লট ${index + 1}`}</TableCell>
                    <TableCell>{plot.results.shotok.toFixed(DECIMALS)}</TableCell>
                    <TableCell>{plot.results.katha.toFixed(DECIMALS)}</TableCell>
                    <TableCell>{plot.results.sqft.toFixed(DECIMALS)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>রিপোর্টের তথ্য দিন</DialogTitle>
            <DialogDescription className="sr-only">প্রিন্ট করার আগে রিপোর্টের তথ্য দিন।</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">মৌজা</Label>
              <Input placeholder="মৌজার নাম" value={reportInfo.mouza} onChange={(e) => setReportInfo({ ...reportInfo, mouza: e.target.value })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">জে. এল. নং</Label>
              <Input placeholder="জে. এল. নম্বর" value={reportInfo.jlNo} onChange={(e) => setReportInfo({ ...reportInfo, jlNo: e.target.value })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">দাগ নং</Label>
              <Input placeholder="দাগ নম্বর" value={reportInfo.dagNo} onChange={(e) => setReportInfo({ ...reportInfo, dagNo: e.target.value })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">খতিয়ান নং</Label>
              <Input placeholder="খতিয়ান নম্বর" value={reportInfo.khatianNo} onChange={(e) => setReportInfo({ ...reportInfo, khatianNo: e.target.value })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">তারিখ</Label>
              <Input placeholder="যেমন: ১২/০৬/২০২৬" value={reportInfo.date} onChange={(e) => setReportInfo({ ...reportInfo, date: e.target.value })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">সার্ভেয়ার</Label>
              <Input placeholder="সার্ভেয়ারের নাম" value={reportInfo.surveyorName} onChange={(e) => setReportInfo({ ...reportInfo, surveyorName: e.target.value })} className="h-8" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>বাতিল</DialogClose>
            <Button onClick={() => { setIsPrintModalOpen(false); setTimeout(onPrint, 500); }}>প্রিন্ট করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

