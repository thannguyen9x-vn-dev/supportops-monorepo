"use client";

import { useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FormField } from "../FormField";
import { cn } from "../../../utils/cn";

interface FileFieldProps<T extends FieldValues> {
  name: Path<T>;
  form?: UseFormReturn<T>;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  dropzoneText?: string;
}

function normalizeFiles(value: unknown): File[] {
  if (!value) return [];
  if (value instanceof File) return [value];
  if (Array.isArray(value)) return value.filter((item): item is File => item instanceof File);
  return [];
}

export function FileField<T extends FieldValues>({
  name,
  form,
  label,
  description,
  required,
  className,
  disabled,
  accept,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  dropzoneText = "Drop files here or click to upload"
}: FileFieldProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField className={className} description={description} form={form} label={label} name={name} required={required}>
      {(field) => {
        const files = normalizeFiles(field.value);
        const hasLimit = maxSize > 0;

        const handleFiles = (fileList: FileList | null) => {
          if (!fileList) return;

          const incoming = Array.from(fileList).filter((file) => (!hasLimit ? true : file.size <= maxSize));
          if (multiple) {
            const next = [...files, ...incoming].slice(0, maxFiles);
            field.onChange(next as never);
            return;
          }

          field.onChange((incoming[0] ?? null) as never);
        };

        const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
          handleFiles(event.target.files);
          event.target.value = "";
        };

        const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
          event.preventDefault();
          if (disabled || field.isSubmitting) return;
          handleFiles(event.dataTransfer.files);
        };

        const removeFile = (index: number) => {
          if (!multiple) {
            field.onChange(null as never);
            return;
          }

          const next = files.filter((_, fileIndex) => fileIndex !== index);
          field.onChange(next as never);
        };

        const helper = files.map((file, index) => ({
          key: `${file.name}-${index}`,
          label: `${file.name} (${Math.round(file.size / 1024)}KB)`,
          index
        }));

        return (
          <div className="space-y-2">
            <button
              aria-describedby={field["aria-describedby"]}
              aria-invalid={field["aria-invalid"]}
              className={cn(
                "w-full rounded-md border-2 border-dashed px-4 py-6 text-sm text-gray-600",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                field.error ? "border-red-300" : "border-gray-300",
                disabled || field.isSubmitting ? "cursor-not-allowed bg-gray-50 opacity-70" : "hover:border-blue-400 hover:bg-blue-50/30"
              )}
              disabled={disabled || field.isSubmitting}
              id={field.id}
              onBlur={field.onBlur}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              type="button"
            >
              {dropzoneText}
            </button>

            <input
              accept={accept}
              className="hidden"
              disabled={disabled || field.isSubmitting}
              multiple={multiple}
              onChange={handleInputChange}
              ref={inputRef}
              type="file"
            />

            {helper.length > 0 ? (
              <ul className="space-y-1">
                {helper.map((file) => (
                  <li className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-xs text-gray-600" key={file.key}>
                    <span>{file.label}</span>
                    <button
                      className="text-red-600 hover:text-red-700"
                      disabled={disabled || field.isSubmitting}
                      onClick={() => removeFile(file.index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      }}
    </FormField>
  );
}
