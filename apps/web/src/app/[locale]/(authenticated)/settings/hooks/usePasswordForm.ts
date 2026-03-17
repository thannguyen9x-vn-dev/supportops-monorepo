"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";

import type { PasswordFormValues, SubmitState } from "../settings.types";
import { getErrorMessage } from "../utils/getErrorMessage";

type UsePasswordFormOptions = {
  t: (key: string) => string;
};

export function usePasswordForm({ t }: UsePasswordFormOptions) {
  const toast = useToast();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const {
    control,
    handleSubmit,
    reset,
    setError,
  } = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmNewPassword) {
      setError("confirmNewPassword", {
        type: "validate",
        message: t("validation.passwordMismatch"),
      });
      return;
    }

    setSubmitState("saving");

    try {
      await settingsService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmNewPassword
      });
      reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setSubmitState("success");
      toast.success(t("state.saved"));
    } catch (error) {
      setSubmitState("error");
      toast.error(getErrorMessage(error, t("state.saveError")));
    }
  };

  return { control, handleSubmit, onSubmit, submitState };
}
