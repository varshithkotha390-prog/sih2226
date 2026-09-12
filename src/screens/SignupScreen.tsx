import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';
import { useLanguage } from '../i18n/LanguageContext';

export const SignupScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <AuthLayout
      title={t('createAccountTitle')}
      subtitle={t('createAccountSubtitle')}
      showDemoSwitcher={false}
    >
      <SignupForm />
    </AuthLayout>
  );
};
