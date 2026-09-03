"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, MapPin, Edit, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import {
  createUpazilaAction,
  updateUpazilaAction,
  deleteUpazilaAction,
} from "../_actions/district.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TDistrict, TUpazila } from "@/interface/district";

const upazilaSchema = z.object({
  name: z.string().min(2, "Upazila name is required"),
  slug: z
    .string()
    .min(2, "Upazila slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers or dashes"),
});

type UpazilaFormData = z.infer<typeof upazilaSchema>;

export function UpazilaManageModal({ district }: { district: TDistrict }) {
  const [open, setOpen] = useState(false);
  const [editingUpazilaId, setEditingUpazilaId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const upazilas: TUpazila[] =
    district.upazilaList ||
    district.upazilas.map((name) => ({
      id: name,
      name,
      slug: name.toLowerCase().replace(/[\s_]+/g, "-"),
      districtId: district.id,
    }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<UpazilaFormData>({
    resolver: zodResolver(upazilaSchema),
    mode: "onChange",
    defaultValues: { name: "", slug: "" },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  async function onAddUpazila(data: UpazilaFormData) {
    const result = await createUpazilaAction({
      name: data.name.trim(),
      slug: data.slug.trim(),
      districtId: district.id,
    });

    if (result.success) {
      SuccessToast(`Upazila "${data.name}" added successfully.`);
      reset();
    } else {
      ErrorToast(result.message || "Failed to add upazila.");
    }
  }

  async function handleUpdateUpazila(upazilaId: string) {
    if (!editName.trim() || !editSlug.trim()) return;
    setIsUpdating(true);
    try {
      const result = await updateUpazilaAction(upazilaId, {
        name: editName.trim(),
        slug: editSlug.trim(),
      });
      if (result.success) {
        SuccessToast("Upazila updated successfully.");
        setEditingUpazilaId(null);
      } else {
        ErrorToast(result.message || "Failed to update upazila.");
      }
    } catch {
      ErrorToast("An error occurred while updating upazila.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteUpazila(upazilaId: string, name: string) {
    try {
      const result = await deleteUpazilaAction(upazilaId);
      if (result.success) {
        SuccessToast(`Upazila "${name}" deleted successfully.`);
      } else {
        ErrorToast(result.message || "Failed to delete upazila.");
      }
    } catch {
      ErrorToast("An error occurred while deleting upazila.");
    }
  }

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title={`Upazilas in ${district.name}`}
      description={`Manage upazilas/thanas under ${district.name} district (${upazilas.length} total).`}
      actionTrigger={
        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
          <MapPin className="size-3.5 text-primary" />
          <span>Upazilas</span>
          <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 h-4 text-xs">
            {upazilas.length}
          </Badge>
        </Button>
      }
    >
      <div className="space-y-4 max-h-[70vh] flex flex-col">
        {/* Add Upazila Form */}
        <form
          onSubmit={handleSubmit(onAddUpazila)}
          className="p-3 bg-muted/40 rounded-lg border border-border space-y-2.5"
        >
          <div className="text-foreground flex items-center gap-1.5">
            <Plus className="size-3.5 text-primary" />
            <span>Add New Upazila to {district.name}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Input
                {...register("name")}
                placeholder="Upazila Name (e.g. Mirpur)"
                className="h-8 text-xs bg-background"
                onChange={handleNameChange}
              />
            </div>
            <div>
              <Input
                {...register("slug")}
                placeholder="Slug (e.g. mirpur)"
                className="h-8 text-xs font-mono bg-background"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              loadingText="Adding..."
              className="h-7 text-xs gap-1"
            >
              <Plus className="size-3" />
              Add Upazila
            </Button>
          </div>
        </form>

        {/* Upazilas List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-37.5">
          {upazilas.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No upazilas added for this district yet.
            </div>
          ) : (
            upazilas.map((u) => {
              const isEditing = editingUpazilaId === u.id;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-card border border-border/80"
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-xs flex-1"
                        placeholder="Name"
                      />
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="h-7 text-xs font-mono w-32"
                        placeholder="Slug"
                      />
                      <Button
                        size="icon"
                        variant="default"
                        className="size-7 shrink-0"
                        onClick={() => handleUpdateUpazila(u.id)}
                        disabled={isUpdating}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0"
                        onClick={() => setEditingUpazilaId(null)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-foreground truncate">
                          {u.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground truncate">
                          ({u.slug})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingUpazilaId(u.id);
                            setEditName(u.name);
                            setEditSlug(u.slug);
                          }}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <ConfirmationModal
                          title={`Delete Upazila "${u.name}"?`}
                          description="Are you sure you want to remove this upazila from this district?"
                          confirmText="Delete"
                          cancelText="Cancel"
                          loadingText="Deleting..."
                          variant="destructive"
                          onConfirm={() => handleDeleteUpazila(u.id, u.name)}
                          actionTrigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

