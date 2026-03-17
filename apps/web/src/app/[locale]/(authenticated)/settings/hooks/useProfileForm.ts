"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/features/common/toast/useToast";
import { settingsService } from "@/features/settings/services/settings.service";

import type { ProfileFormValues, SubmitState } from "../settings.types";
import { toUpdateProfileRequest } from "../settings.mapper";
import { getErrorMessage } from "../utils/getErrorMessage";

type UseProfileFormOptions = {
  onSaved: (values: ProfileFormValues) => void;
  t: (key: string) => string;
};

export function useProfileForm({ t, onSaved }: UseProfileFormOptions) {
  const toast = useToast();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const {
    control,
    handleSubmit,
    reset
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      birthday: "",
      phoneCountry: "US",
      phoneNumber: "",
      address: "",
      country: "US",
      email: "",
      organization: "",
      zipCode: "",
      city: "",
      department: ""
    }
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitState("saving");

    try {
      await settingsService.updateProfile(toUpdateProfileRequest(values));
      onSaved(values);
      setSubmitState("success");
      toast.success(t("state.saved"));
    } catch (error) {
      setSubmitState("error");
      toast.error(getErrorMessage(error, t("state.saveError")));
    }
  };

  return { control, handleSubmit, onSubmit, reset, submitState };
}
