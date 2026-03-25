import * as react_jsx_runtime from 'react/jsx-runtime';
import { DialogProps } from '@mui/material';
import { ReactNode } from 'react';

/** Minimal shape required — compatible with useDialog() from @supportops/ui */
type DialogControl = {
    isOpen: boolean;
    close: () => void;
};
interface FormDialogProps {
    /** Dialog open/close controller (e.g. from useDialog()) */
    dialog: DialogControl;
    /** Dialog header title */
    title: ReactNode;
    /** Form content rendered inside the scrollable body */
    children: ReactNode;
    /**
     * When provided, the Submit button acts as `type="submit" form={formId}`.
     * Use this when the <form> lives inside children and owns its own submit handler.
     */
    formId?: string;
    /**
     * Called when the Submit button is clicked and no formId is provided.
     * Ignored when formId is set.
     */
    onSubmit?: () => void | Promise<void>;
    submitLabel?: string;
    cancelLabel?: string;
    submitDisabled?: boolean;
    maxWidth?: DialogProps["maxWidth"];
    fullWidth?: boolean;
}
declare function FormDialog({ dialog, title, children, formId, onSubmit, submitLabel, cancelLabel, submitDisabled, maxWidth, fullWidth, }: FormDialogProps): react_jsx_runtime.JSX.Element;

interface ConfirmDialogProps {
    /** Dialog open/close controller (e.g. from useDialog()) */
    dialog: DialogControl;
    /** Bold title shown inside the dialog */
    title: ReactNode;
    /** Optional descriptive text below the title */
    description?: ReactNode;
    /** Label for the confirm/action button (default: "Confirm") */
    confirmLabel?: string;
    /** Label for the cancel button (default: "Cancel") */
    cancelLabel?: string;
    /** Called when the user clicks the confirm button */
    onConfirm: () => void | Promise<void>;
    confirmDisabled?: boolean;
    /** Controls the accent color of the icon and confirm button (default: "error") */
    variant?: "error" | "warning" | "info";
    maxWidth?: DialogProps["maxWidth"];
}
declare function ConfirmDialog({ dialog, title, description, confirmLabel, cancelLabel, onConfirm, confirmDisabled, variant, maxWidth, }: ConfirmDialogProps): react_jsx_runtime.JSX.Element;

export { ConfirmDialog, type ConfirmDialogProps, type DialogControl, FormDialog, type FormDialogProps };
