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

export { type DialogControl, FormDialog, type FormDialogProps };
