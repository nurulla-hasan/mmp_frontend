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
import { ModalWrapper } from "@/components/common/modal-wrapper";

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
          <TableHead>Unit</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Shotok</TableCell>
          <TableCell>{results.shotok.toFixed(DECIMALS)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Katha</TableCell>
          <TableCell>{results.katha.toFixed(DECIMALS)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sq Ft</TableCell>
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
            Side {i + 1}: {formatFeetInches(len)}
          </li>
        ))}
      </ul>
      {diagonals && diagonals.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground print:hidden">
          <span className="font-semibold text-foreground">
            Diagonals:
          </span>
          <ul className="list-inside pl-4">
            {diagonals.map((d, i) => (
              <li key={`diag-${i}`}>
                Corner {d.p1Index + 1} to {d.p2Index + 1}:{" "}
                {formatFeetInches(d.lengthFt)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showPerimeter && (
        <p className="mt-2 font-semibold text-sm">
          Perimeter: {formatFeetInches(perimeter)}
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
          Calculation Results
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => setIsSaveModalOpen(true)}
            className="print:hidden whitespace-nowrap"
            title="Save Measurement"
          >
            <BookmarkCheck />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPrintModalOpen(true)}
            className="print:hidden whitespace-nowrap"
          >
            <Printer />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="col-span-1 py-3 gap-3 sm:py-6 sm:gap-6">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle
              className="text-xs sm:text-base font-medium text-foreground truncate"
              title="Total Shotok"
            >
              Total Shotok
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
              title="Total Katha"
            >
              Total Katha
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
              title="Total Sq Ft"
            >
              Total Sq Ft
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
        <Label className="mb-2 block">Area by Plot:</Label>
        <Card className="py-2 sm:py-6">
          <CardContent className="px-2 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plot</TableHead>
                  <TableHead>Shotok</TableHead>
                  <TableHead>Katha</TableHead>
                  <TableHead>Sq Ft</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plots.map((plot, index) => (
                  <TableRow key={plot.id}>
                    <TableCell>{plot.name || `Plot ${index + 1}`}</TableCell>
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

      <ModalWrapper
        open={isPrintModalOpen}
        onOpenChange={setIsPrintModalOpen}
        title="প্রতিবেদন বিবরণ (Report Details)"
        description="প্রিন্ট করার পূর্বে প্রতিবেদনের প্রয়োজনীয় তথ্য পূরণ করুন।"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block font-medium">
                মৌজা (Mouza)
              </Label>
              <Input
                placeholder="যেমন: মৌজা ৪২"
                value={reportInfo.mouza}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, mouza: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block font-medium">
                জে. এল. নং (J. L. No)
              </Label>
              <Input
                placeholder="যেমন: ১৫"
                value={reportInfo.jlNo}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, jlNo: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block font-medium">
                দাগ নং (Dag No)
              </Label>
              <Input
                placeholder="যেমন: ৩৪০/১২"
                value={reportInfo.dagNo}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, dagNo: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block font-medium">
                খতিয়ান নং (Khatian No)
              </Label>
              <Input
                placeholder="যেমন: ১০৫"
                value={reportInfo.khatianNo}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, khatianNo: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block font-medium">
                তারিখ (Date)
              </Label>
              <Input
                placeholder="যেমন: ০২/০৯/২০২৬"
                value={reportInfo.date}
                onChange={(e) =>
                  setReportInfo({ ...reportInfo, date: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block font-medium">
                সার্ভেয়ার / আমিনের নাম (Surveyor)
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPrintModalOpen(false)}
            >
              বাতিল (Cancel)
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsPrintModalOpen(false);
                setTimeout(onPrint, 500);
              }}
            >
              <Printer className="size-4 mr-1.5" />
              প্রিন্ট করুন (Print)
            </Button>
          </div>
        </div>
      </ModalWrapper>

      <SaveCalculationDialog
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
      />
    </div>
  );
});
