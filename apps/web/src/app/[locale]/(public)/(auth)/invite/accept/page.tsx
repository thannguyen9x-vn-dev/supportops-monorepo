'use client';

import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Button } from '@mui/material';
import { TextInputField } from '@supportops/ui-form';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordRequirementChecklist } from '@/components/password/PasswordRequirementChecklist';
import { authService } from '@/features/auth/services/auth.service';
import { ApiError } from '@/lib/api';
import { buildPasswordRules, getPasswordRequirementState } from '@/lib/validation/passwordPolicy';

import styles from '../../auth.module.css';

type AcceptInviteFormValues = {
  fullName: string;
  password: string;
  confirmPassword: string;
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('auth.acceptInvite');
  const commonT = useTranslations('auth.common');

  const token = searchParams.get('token') ?? '';
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const password = useWatch({
    control,
    name: 'password',
  });
  const passwordRequirements = getPasswordRequirementState(password ?? '');

  const onSubmit = async (values: AcceptInviteFormValues) => {
    if (!token) {
      setError('root', { message: t('missingToken') });
      return;
    }

    setSubmitted(false);

    try {
      await authService.acceptInvite({
        token,
        fullName: values.fullName.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      setSubmitted(true);
      setTimeout(() => {
        router.replace(`/${locale}/login`);
      }, 1200);
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : t('submitError');
      setError('root', { message });
    }
  };

  return (
    <AuthCard
      title={t('title')}
      subtitle={t('subtitle')}
      footer={
        <>
          <span>{t('footerPrompt')}</span>
          <Link href={`/${locale}/login`}>{t('footerAction')}</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <input
          type="text"
          name="invite-username"
          autoComplete="username"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
        />
        <input
          type="password"
          name="invite-password"
          autoComplete="new-password"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
        />

        <div className={styles.fields}>
          <TextInputField
            name="fullName"
            control={control}
            label={t('fullNameLabel')}
            placeholder={t('fullNamePlaceholder')}
            startIcon={<BadgeOutlinedIcon fontSize="small" />}
            rules={{ required: true }}
          />

          <TextInputField
            name="password"
            control={control}
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            type="password"
            autoComplete="new-password"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            rules={buildPasswordRules<AcceptInviteFormValues, 'password'>({
              required: commonT('passwordRequired'),
              min: commonT('passwordMin'),
              max: commonT('passwordMax'),
              format: commonT('passwordFormat'),
            })}
          />

          <PasswordRequirementChecklist
            className={styles.passwordChecklist}
            items={[
              {
                key: 'minLength',
                label: t('passwordRequirements.minLength'),
                met: passwordRequirements.minLength,
              },
              {
                key: 'lowercase',
                label: t('passwordRequirements.lowercase'),
                met: passwordRequirements.lowercase,
              },
              {
                key: 'uppercase',
                label: t('passwordRequirements.uppercase'),
                met: passwordRequirements.uppercase,
              },
              {
                key: 'number',
                label: t('passwordRequirements.number'),
                met: passwordRequirements.number,
              },
              {
                key: 'specialCharacter',
                label: t('passwordRequirements.specialCharacter'),
                met: passwordRequirements.specialCharacter,
              },
            ]}
          />

          <TextInputField
            name="confirmPassword"
            control={control}
            label={t('confirmPasswordLabel')}
            placeholder={t('confirmPasswordPlaceholder')}
            type="password"
            autoComplete="new-password"
            startIcon={<LockOutlinedIcon fontSize="small" />}
            rules={{
              required: true,
              validate: (value: string) => value === password || commonT('passwordMismatch'),
            }}
          />

          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || !token}>
            {t('submit')}
          </Button>

          {!token ? <Alert severity="warning">{t('missingToken')}</Alert> : null}
          {submitted ? <Alert severity="success">{t('submitSuccess')}</Alert> : null}
          {errors.root?.message ? <Alert severity="error">{errors.root.message}</Alert> : null}
        </div>
      </form>
    </AuthCard>
  );
}
