"use client";

import Link from "next/link";
import React, { useId, useRef } from "react";
import {
  ArrowLeft,
  Bold,
  Camera,
  FileText,
  ImagePlus,
  Info,
  Italic,
  Link2,
  List,
  LoaderCircle,
  MapPin,
  Ruler,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import {
  PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE,
  PROPERTY_FORM_TEXT,
  PROPERTY_IMAGE_UPLOAD_LIMIT,
} from "@/modules/properties/constants";
import type {
  CategoryOption,
  LocationSuggestion,
  PropertyFormData,
} from "@/modules/properties/types";

const panelClassName =
  "overflow-hidden rounded-[2rem] border border-[#e8ebf8] bg-white shadow-[0_24px_70px_rgba(19,27,46,0.05)]";

const sectionHeaderClassName =
  "flex items-center gap-3 border-b border-[#edf1ff] bg-[#eef1ff] px-6 py-5 sm:px-8";

const labelClassName =
  "mb-2 block text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[#1b2236]";

const helperClassName = "mt-2 text-sm text-[#64708a]";

const baseFieldClassName =
  "w-full rounded-2xl border border-transparent bg-[#dbe1ff] px-4 py-4 text-[1rem] text-[#131b2e] outline-none transition placeholder:text-[#6b7894] focus:border-[#adc2ff] focus:bg-white focus:ring-4 focus:ring-[#004ac6]/10";

const errorFieldClassName =
  "border-[#ef4444] bg-[#fff1f2] focus:border-[#ef4444] focus:ring-[#ef4444]/10";

const actionButtonClassName =
  "inline-flex items-center justify-center rounded-2xl px-6 py-4 text-sm font-extrabold uppercase tracking-[0.16em] transition";

interface PreviewImage {
  id: string;
  src: string;
  alt: string;
  isPrimary?: boolean;
  onRemove: () => void;
}

interface PropertyFormScreenProps {
  mode: "create" | "edit";
  formData: PropertyFormData;
  errors: Record<string, string>;
  categories: CategoryOption[];
  loadingCategories: boolean;
  locationQuery: string;
  locationSuggestions: LocationSuggestion[];
  locationLoading: boolean;
  isLocationDropdownOpen: boolean;
  selectedLocationPlaceId: string;
  previewImages: PreviewImage[];
  submitting: boolean;
  pageTitle: string;
  headerTitle: string;
  headerMeta: string;
  badgeLabel: string;
  badgeClassName: string;
  submitLabel: string;
  submittingLabel: string;
  resetLabel?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFieldChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onDescriptionChange: (value: string) => void;
  onLocationQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationSelect: (selected: LocationSuggestion) => void;
  onLocationDropdownOpenChange: (open: boolean) => void;
  onFilesAdded: (files: File[]) => void;
  onReset?: () => void;
}

type DescriptionAction = "bold" | "italic" | "list" | "link";

const formatDescriptionSelection = (
  action: DescriptionAction,
  value: string,
  selectionStart: number,
  selectionEnd: number,
) => {
  const selectedText = value.slice(selectionStart, selectionEnd);

  switch (action) {
    case "bold": {
      const content = selectedText || "Bold text";
      const nextValue =
        value.slice(0, selectionStart) +
        `**${content}**` +
        value.slice(selectionEnd);
      const selectionOffset = selectedText ? 2 : 0;
      return {
        value: nextValue,
        selectionStart: selectionStart + selectionOffset,
        selectionEnd:
          selectionStart + selectionOffset + (selectedText || content).length,
      };
    }
    case "italic": {
      const content = selectedText || "Italic text";
      const nextValue =
        value.slice(0, selectionStart) +
        `*${content}*` +
        value.slice(selectionEnd);
      const selectionOffset = selectedText ? 1 : 0;
      return {
        value: nextValue,
        selectionStart: selectionStart + selectionOffset,
        selectionEnd:
          selectionStart + selectionOffset + (selectedText || content).length,
      };
    }
    case "list": {
      const content = selectedText || "List item";
      const lines = content
        .split("\n")
        .map((line) => (line.trim().startsWith("- ") ? line : `- ${line}`))
        .join("\n");
      const nextValue =
        value.slice(0, selectionStart) + lines + value.slice(selectionEnd);
      return {
        value: nextValue,
        selectionStart,
        selectionEnd: selectionStart + lines.length,
      };
    }
    case "link": {
      const content = selectedText || "Link text";
      const template = `[${content}](https://)`;
      const nextValue =
        value.slice(0, selectionStart) + template + value.slice(selectionEnd);
      return {
        value: nextValue,
        selectionStart: selectionStart + 1,
        selectionEnd: selectionStart + 1 + content.length,
      };
    }
  }
};

const getFieldClassName = (hasError: boolean): string =>
  `${baseFieldClassName} ${hasError ? errorFieldClassName : ""}`;

const getImageCapacityText = (previewCount: number): string => {
  const remaining = Math.max(PROPERTY_IMAGE_UPLOAD_LIMIT - previewCount, 0);

  if (!remaining) {
    return `Image limit reached (${PROPERTY_IMAGE_UPLOAD_LIMIT}/${PROPERTY_IMAGE_UPLOAD_LIMIT})`;
  }

  return `${remaining} of ${PROPERTY_IMAGE_UPLOAD_LIMIT} upload slots remaining`;
};

export default function PropertyFormScreen({
  mode,
  formData,
  errors,
  categories,
  loadingCategories,
  locationQuery,
  locationSuggestions,
  locationLoading,
  isLocationDropdownOpen,
  selectedLocationPlaceId,
  previewImages,
  submitting,
  pageTitle,
  headerTitle,
  headerMeta,
  badgeLabel,
  badgeClassName,
  submitLabel,
  submittingLabel,
  resetLabel,
  onSubmit,
  onFieldChange,
  onDescriptionChange,
  onLocationQueryChange,
  onLocationSelect,
  onLocationDropdownOpenChange,
  onFilesAdded,
  onReset,
}: PropertyFormScreenProps) {
  const fileInputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canUploadMore = previewImages.length < PROPERTY_IMAGE_UPLOAD_LIMIT;

  const applyDescriptionFormat = (action: DescriptionAction) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const nextDescription = formatDescriptionSelection(
      action,
      formData.description,
      textarea.selectionStart,
      textarea.selectionEnd,
    );

    onDescriptionChange(nextDescription.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        nextDescription.selectionStart,
        nextDescription.selectionEnd,
      );
    });
  };

  const handleInputFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length) {
      onFilesAdded(files);
    }

    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    if (!canUploadMore) {
      return;
    }

    const files = Array.from(event.dataTransfer.files ?? []);

    if (files.length) {
      onFilesAdded(files);
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(75,65,225,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(0,74,198,0.08),transparent_32%)]" />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-4 border-b border-[#e8ebf8] pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href={APP_ROUTES.adminProperties}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5d6a83] transition hover:text-[#004ac6]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to properties</span>
            </Link>

            <h1 className="mt-5 font-auth-headline text-[2rem] font-bold tracking-[-0.04em] text-[#131b2e] sm:text-[2.6rem]">
              {pageTitle}
            </h1>
            <p className="mt-2 text-base text-[#64708a]">{headerMeta}</p>
          </div>

          <span
            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] ${badgeClassName}`}
          >
            {badgeLabel}
          </span>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-7 lg:space-y-8">
          <section className={panelClassName}>
            <div className={sectionHeaderClassName}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#004ac6] shadow-[0_10px_24px_rgba(0,74,198,0.12)]">
                <Info className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-auth-headline text-[1.35rem] font-semibold text-[#004ac6]">
                  Core Investment Details
                </h2>
                <p className="mt-1 text-sm text-[#64708a]">
                  Capture the commercial story, category, valuation, and
                  availability.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-7 gap-y-6 px-6 py-7 sm:px-8 lg:grid-cols-3">
              <label className="block lg:col-span-2">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.titleLabel}
                </span>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onFieldChange}
                  placeholder="Prime Commercial Land - Kathmandu"
                  className={getFieldClassName(Boolean(errors.title))}
                />
                {errors.title ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.title}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.categoryLabel}
                </span>
                <div className="relative">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={onFieldChange}
                    className={getFieldClassName(Boolean(errors.categoryId))}
                    disabled={loadingCategories}
                  >
                    <option value={PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE}>
                      {loadingCategories
                        ? "Loading categories..."
                        : PROPERTY_FORM_TEXT.categoryPlaceholder}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.categoryId ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.categoryId}
                  </p>
                ) : null}
              </label>

              <label className="relative block lg:col-span-3">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.locationLabel}
                </span>
                <MapPin className="pointer-events-none absolute left-4 top-[3.35rem] h-5 w-5 text-[#7a8aa8]" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={onLocationQueryChange}
                  onFocus={() => onLocationDropdownOpenChange(true)}
                  onBlur={() => onLocationDropdownOpenChange(false)}
                  placeholder={PROPERTY_FORM_TEXT.locationPlaceholder}
                  className={`${getFieldClassName(Boolean(errors.location))} pl-12`}
                />

                {isLocationDropdownOpen ? (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#dbe3fb] bg-white shadow-[0_18px_45px_rgba(19,27,46,0.12)]">
                    {locationLoading ? (
                      <div className="flex items-center gap-3 px-4 py-4 text-sm text-[#5d6a83]">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        <span>{PROPERTY_FORM_TEXT.loadingLocations}</span>
                      </div>
                    ) : null}

                    {!locationLoading && locationSuggestions.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-[#5d6a83]">
                        {PROPERTY_FORM_TEXT.noLocations}
                      </div>
                    ) : null}

                    {!locationLoading &&
                      locationSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => onLocationSelect(suggestion)}
                          className={`block w-full px-4 py-3 text-left text-sm transition ${
                            selectedLocationPlaceId === suggestion.placeId
                              ? "bg-[#eef2ff] font-semibold text-[#004ac6]"
                              : "text-[#24314d] hover:bg-[#f7f9ff]"
                          }`}
                        >
                          {suggestion.description}
                        </button>
                      ))}
                  </div>
                ) : null}

                {errors.location ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.location}
                  </p>
                ) : (
                  <p className={helperClassName}>
                    Choose a suggestion so the listing can be mapped accurately.
                  </p>
                )}
              </label>

              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.priceLabel}
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7a8aa8]">
                    Rs
                  </span>
                  <input
                    type="number"
                    step={100000}
                    name="price"
                    value={formData.price}
                    onChange={onFieldChange}
                    placeholder="45000000"
                    className={`${getFieldClassName(Boolean(errors.price))} pl-12`}
                  />
                </div>
                {errors.price ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.price}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.roiLabel}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="roi"
                    value={formData.roi}
                    onChange={onFieldChange}
                    placeholder="12.5"
                    className={`${getFieldClassName(Boolean(errors.roi))} pr-10`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7a8aa8]">
                    %
                  </span>
                </div>
                {errors.roi ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.roi}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.statusLabel}
                </span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onFieldChange}
                  className={getFieldClassName(Boolean(errors.status))}
                >
                  <option value="">{PROPERTY_FORM_TEXT.statusPlaceholder}</option>
                  {[
                    { value: "Available", label: "Available" },
                    { value: "Pending", label: "Pending" },
                    { value: "Sold", label: "Sold" },
                  ].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.status}
                  </p>
                ) : null}
              </label>
            </div>
          </section>

          <section className={panelClassName}>
            <div className={sectionHeaderClassName}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#004ac6] shadow-[0_10px_24px_rgba(0,74,198,0.12)]">
                <Ruler className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-auth-headline text-[1.35rem] font-semibold text-[#004ac6]">
                  Technical Dimensions
                </h2>
                <p className="mt-1 text-sm text-[#64708a]">
                  Keep land measurement and access details consistent for every
                  listing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-7 gap-y-6 px-6 py-7 sm:px-8 md:grid-cols-3">
              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.areaLabel}
                </span>
                <input
                  type="number"
                  step={10}
                  name="area"
                  value={formData.area}
                  onChange={onFieldChange}
                  placeholder="5400"
                  className={getFieldClassName(Boolean(errors.area))}
                />
                {errors.area ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.area}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.areaNepaliLabel}
                </span>
                <input
                  type="text"
                  name="areaNepali"
                  value={formData.areaNepali}
                  onChange={onFieldChange}
                  placeholder={PROPERTY_FORM_TEXT.areaNepaliPlaceholder}
                  className={getFieldClassName(Boolean(errors.areaNepali))}
                />
                {errors.areaNepali ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.areaNepali}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className={labelClassName}>
                  {PROPERTY_FORM_TEXT.distanceLabel}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    name="distanceFromHighway"
                    value={formData.distanceFromHighway ?? ""}
                    onChange={onFieldChange}
                    placeholder="150"
                    className={`${getFieldClassName(
                      Boolean(errors.distanceFromHighway),
                    )} pr-12`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7a8aa8]">
                    m
                  </span>
                </div>
                {errors.distanceFromHighway ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.distanceFromHighway}
                  </p>
                ) : null}
              </label>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-7 xl:grid-cols-2">
            <section className={panelClassName}>
              <div className={sectionHeaderClassName}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#004ac6] shadow-[0_10px_24px_rgba(0,74,198,0.12)]">
                  <Camera className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-auth-headline text-[1.35rem] font-semibold text-[#004ac6]">
                    Property Media
                  </h2>
                  <p className="mt-1 text-sm text-[#64708a]">
                    Feature the strongest visual first, then upload supporting
                    shots.
                  </p>
                </div>
              </div>

              <div className="px-6 py-7 sm:px-8">
                <div className="grid grid-cols-2 gap-4">
                  {previewImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative h-40 overflow-hidden rounded-[1.35rem] border border-[#dbe3fb] bg-[#eef2ff]"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,27,46,0.02),rgba(19,27,46,0.5))]" />

                      {image.isPrimary ? (
                        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[#1d2438]">
                          Main Image
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={image.onRemove}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#ba1a1a] opacity-0 shadow-[0_12px_28px_rgba(19,27,46,0.18)] transition group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {canUploadMore ? (
                    <label
                      htmlFor={fileInputId}
                      className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#c5d0f3] bg-[#f8faff] px-4 text-center transition hover:border-[#8fb0ff] hover:bg-[#eef4ff]"
                    >
                      <ImagePlus className="h-8 w-8 text-[#6f7d9b]" />
                      <span className="mt-3 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[#53617c]">
                        Add More
                      </span>
                    </label>
                  ) : null}
                </div>

                <input
                  id={fileInputId}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleInputFiles}
                  className="hidden"
                  disabled={!canUploadMore}
                />

                <label
                  htmlFor={fileInputId}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className={`mt-5 flex min-h-[14.5rem] flex-col items-center justify-center rounded-[1.6rem] border-2 border-dashed px-6 py-8 text-center transition ${
                    canUploadMore
                      ? "cursor-pointer border-[#c7d2f6] bg-[#fbfcff] hover:border-[#004ac6] hover:bg-[#f5f8ff]"
                      : "cursor-not-allowed border-[#d7ddea] bg-[#f7f8fc]"
                  }`}
                >
                  <UploadCloud
                    className={`h-12 w-12 ${
                      canUploadMore ? "text-[#004ac6]" : "text-[#9aa6bf]"
                    }`}
                  />
                  <p className="mt-4 text-lg font-semibold text-[#131b2e]">
                    Drag & drop images here
                  </p>
                  <p className="mt-2 text-sm text-[#64708a]">
                    Support JPG, PNG, WEBP (Max 5MB per file)
                  </p>
                  <span
                    className={`mt-5 ${actionButtonClassName} ${
                      canUploadMore
                        ? "border border-[#004ac6] text-[#004ac6] hover:bg-[#004ac6] hover:text-white"
                        : "border border-[#d7ddea] text-[#9aa6bf]"
                    }`}
                  >
                    Select Files
                  </span>
                  <p className={`${helperClassName} text-center`}>
                    {getImageCapacityText(previewImages.length)}
                  </p>
                </label>
              </div>
            </section>

            <section className={panelClassName}>
              <div className={sectionHeaderClassName}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#004ac6] shadow-[0_10px_24px_rgba(0,74,198,0.12)]">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-auth-headline text-[1.35rem] font-semibold text-[#004ac6]">
                    Property Description
                  </h2>
                  <p className="mt-1 text-sm text-[#64708a]">
                    Highlight access, development potential, and investment
                    upside.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col px-6 py-7 sm:px-8">
                {mode === "create" ? (
                  <div className="mb-4 flex items-center gap-2 rounded-[1.2rem] bg-[#dbe1ff] p-3">
                    {[
                      { key: "bold", icon: Bold, label: "Bold" },
                      { key: "italic", icon: Italic, label: "Italic" },
                      { key: "list", icon: List, label: "List" },
                      { key: "link", icon: Link2, label: "Link" },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            applyDescriptionFormat(item.key as DescriptionAction)
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#334155] transition hover:bg-white hover:text-[#004ac6]"
                          aria-label={`Format description as ${item.label.toLowerCase()}`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <textarea
                  ref={textareaRef}
                  name="description"
                  value={formData.description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  rows={11}
                  placeholder="Describe the property's access, zoning potential, nearby infrastructure, and value story."
                  className={`${getFieldClassName(Boolean(errors.description))} min-h-[21rem] resize-none leading-8`}
                />

                {errors.description ? (
                  <p className="mt-2 text-sm font-medium text-[#c81e1e]">
                    {errors.description}
                  </p>
                ) : (
                  <p className={helperClassName}>
                    Structured bullet points read especially well in the property
                    detail page.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#e8ebf8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            {onReset && resetLabel ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#67758f] transition hover:text-[#ba1a1a]"
              >
                <Trash2 className="h-4 w-4" />
                <span>{resetLabel}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={APP_ROUTES.adminProperties}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#66748e] underline decoration-[#ccd6ef] underline-offset-[0.35rem] transition hover:text-[#004ac6] hover:decoration-[#004ac6]"
              >
                Cancel Changes
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className={`${actionButtonClassName} min-w-[18rem] bg-[linear-gradient(135deg,#004ac6_0%,#4b41e1_100%)] text-white shadow-[0_20px_40px_rgba(30,64,175,0.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(30,64,175,0.34)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                  mode === "create" ? "sm:min-w-[19rem]" : ""
                }`}
              >
                {submitting ? submittingLabel : submitLabel}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#eef1fb] pt-6 text-[0.72rem] font-bold uppercase tracking-[0.26em] text-[#8f98af] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[#7d879f]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34c759]" />
                System Online
              </span>
              <span>v2.4.0-stable</span>
            </div>
            <div className="flex items-center gap-5">
              <span>{headerTitle}</span>
              <span>Blue Whale Investment Group</span>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
