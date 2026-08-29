import { memo, useMemo, useState } from "react";
import { BookmarkCheck, Printer } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import { DECIMALS } from "@/features/land-measurement/utils/calculations";
import { formatFeetInches } from "@/features/land-measurement/utils/canvas";
import type { PolygonResults } from "@/features/land-measurement/types/map";
import { SaveCalculationDialog } from "./calculations/save-calculation-dialog";

type ReportTableProps = {
  results: PolygonResults;
};

type SideLengthsListProps = {
  lengths: number[];
  perimeter: number;
  decimals?: number;
  showPerimeter?: boolean;
  diagonals?: { p1Index: number; p2Index: number; lengthFt: number }[];
};

export const ReportTable = memo(function ReportTable({
  results,
}: ReportTableProps) {
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

export const SideLengthsList = memo(function SideLengthsList({
  lengths,
  perimeter,
  showPerimeter = true,
  diagonals,
}: SideLengthsListProps) {
  return (
    <>
      <ul className="list-disc list-inside print:hidden text-sm">
        {lengths.map((len, i) => (
          <li key={i}>
            বাহু {i + 1}: {formatFeetInches(len)}
          </li>
        ))}
      </ul>
      {diagonals && diagonals.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground print:hidden">
          <span className="font-semibold text-foreground">
            কর্ণ (Diagonals):
          </span>
          <ul className="list-inside pl-4">
            {diagonals.map((d, i) => (
              <li key={`diag-${i}`}>
                কোণা {d.p1Index + 1} থেকে {d.p2Index + 1}:{" "}
                {formatFeetInches(d.lengthFt)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showPerimeter && (
        <p className="mt-2 font-semibold text-sm">
          পরিসীমা: {formatFeetInches(perimeter)}
        </p>
      )}
    </>
  );
});

export const ResultsDisplay = memo(function ResultsDisplay({
  onPrint,
}: {
  onPrint: () => void;
}) {
  const { plots, reportInfo, setReportInfo } = useMapStore(
    useShallow((s) => ({
      plots: s.plots,
      reportInfo: s.reportInfo,
      setReportInfo: s.setReportInfo,
    })),
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const totals = useMemo(
    () =>
      plots.reduce(
        (acc, plot) => ({
          shotok: acc.shotok + plot.results.shotok,
          katha: acc.katha + plot.results.katha,
          sqft: acc.sqft + plot.results.sqft,
        }),
        { shotok: 0, katha: 0, sqft: 0 },
      ),
    [plots],
  );

  if (plots.length === 0) {
    return null;
  }

  return (
    <div
      id="step-results"
      className="mt-6 bg-muted/50 p-4 rounded-lg border border-border"
    >
      <div className="flex flex-row justify-between items-center mb-4 gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">
          হিসাবের ফলাফল
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsSaveModalOpen(true)}
            className="print:hidden whitespace-nowrap gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            title="পরিমাপ সেভ করুন"
          >
            <BookmarkCheck className="size-3.5" />
            <span className="hidden sm:inline">সেভ করুন</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPrintModalOpen(true)}
            className="print:hidden whitespace-nowrap text-xs gap-1"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">প্রিন্ট</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle
              className="text-xs sm:text-base font-medium text-foreground truncate"
              title="মোট শতক"
            >
              মোট শতক
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-base sm:text-xl font-bold text-primary truncate">
              {totals.shotok.toFixed(DECIMALS)}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle
              className="text-xs sm:text-base font-medium text-muted-foreground truncate"
              title="মোট কাঠা"
            >
              মোট কাঠা
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-base sm:text-xl font-bold text-primary truncate">
              {totals.katha.toFixed(DECIMALS)}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle
              className="text-xs sm:text-base font-medium text-muted-foreground truncate"
              title="মোট বর্গফুট"
            >
              মোট বর্গফুট
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="text-base sm:text-xl font-bold text-primary truncate">
              {totals.sqft.toFixed(DECIMALS)}
            </p>
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
                    <TableCell>
                      {plot.results.shotok.toFixed(DECIMALS)}
                    </TableCell>
                    <TableCell>
                      {plot.results.katha.toFixed(DECIMALS)}
                    </TableCell>
                    <TableCell>
                      {plot.results.sqft.toFixed(DECIMALS)}
                    </TableCell>
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
            <DialogDescription className="sr-only">
              প্রিন্ট করার আগে রিপোর্টের তথ্য দিন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                মৌজা
              </Label>
              <Input
                placeholder="মৌজার নাম"
                value={reportInfo.mouza}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, mouza: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                জে. এল. নং
              </Label>
              <Input
                placeholder="জে. এল. নম্বর"
                value={reportInfo.jlNo}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, jlNo: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                দাগ নং
              </Label>
              <Input
                placeholder="দাগ নম্বর"
                value={reportInfo.dagNo}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, dagNo: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                খতিয়ান নং
              </Label>
              <Input
                placeholder="খতিয়ান নম্বর"
                value={reportInfo.khatianNo}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, khatianNo: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                তারিখ
              </Label>
              <Input
                placeholder="যেমন: ১২/০৬/২০২৬"
                value={reportInfo.date}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, date: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                সার্ভেয়ার
              </Label>
              <Input
                placeholder="সার্ভেয়ারের নাম"
                value={reportInfo.surveyorName}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, surveyorName: e.target.value })
                }
                className="h-8"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              বাতিল
            </DialogClose>
            <Button
              onClick={() => {
                setIsPrintModalOpen(false);
                setTimeout(onPrint, 500);
              }}
            >
              প্রিন্ট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveCalculationDialog
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
      />
    </div>
  );
});
