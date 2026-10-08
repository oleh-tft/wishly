import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/common/InputField';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { MainButton } from '../../components/common/MainButton';
import { ModaL } from '../../components/common/Modal';
import { SvgProfile, SvgEmail, SvgWarning } from '../../components/common/Icons';
import { fetchCurrentUser, updateCurrentUser, deleteCurrentUser } from '../../api/users';
import { clearToken } from '@/api/auth';
import { ROUTES } from '@/routes/paths';
import { useNavigate } from 'react-router-dom';
import '../../styles/settings.css';
import i18n from '@/locales/i18n';

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [emailNotify, setEmailNotify] = useState(false);
  const [reserveNotify, setReserveNotify] = useState(false);
  const [activityNotify, setActivityNotify] = useState(false);
  const [privacySetting, setPrivacySetting] = useState('Only me');
  const [language, setLanguage] = useState('EN');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        if (data.name) setFullName(data.name);
        if (data.email) setEmail(data.email);
        
        if (data.emailNotifications !== undefined) setEmailNotify(data.emailNotifications);
        if (data.reservationNotifications !== undefined) setReserveNotify(data.reservationNotifications);
        if (data.wishlistActivity !== undefined) setActivityNotify(data.wishlistActivity);
        if (data.defaultVisibility) setPrivacySetting(data.defaultVisibility);

        if (data.language) {
          setLanguage(data.language.toUpperCase());
          i18n.changeLanguage(data.language.toLowerCase());
        }
      })
      .catch((err) => {
        console.error("Could not fetch user info from the database:", err);
        setErrorMessage(t('settings.errorLoad'));
      });
  }, []);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      name: fullName,
      email: email,
      emailNotifications: emailNotify,
      reservationNotifications: reserveNotify,
      wishlistActivity: activityNotify,
      defaultVisibility: privacySetting,
      language: language
    };

    try {
      const updatedUser = await updateCurrentUser(payload);

      setFullName(updatedUser.name);
      setEmail(updatedUser.email);
      setEmailNotify(updatedUser.emailNotifications);
      setReserveNotify(updatedUser.reservationNotifications);
      setActivityNotify(updatedUser.wishlistActivity);
      setPrivacySetting(updatedUser.defaultVisibility);
      if (updatedUser.language) setLanguage(updatedUser.language.toUpperCase());

      setSuccessMessage(t('settings.successSaved'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {setSuccessMessage(null); navigate(0)}, 2000);
    } catch (err) {
      console.error("Error communicating settings state payload with backend:", err);
      setErrorMessage(err instanceof Error ? err.message : t('settings.errorSave'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (val: string) => {
    console.log("clicked", val);
    setLanguage(val);
    i18n.changeLanguage(val.toLowerCase());
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteCurrentUser();
      clearToken();
      navigate(ROUTES.signIn, { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMessage(t('settings.errorDelete'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="settings-page-view">
      <div className="page-header-block">
        <h1 className="page-title">{t('settings.title')}</h1>
        <p className="page-subtitle">{t('settings.subtitle')}</p>
      </div>

      {successMessage && <div className="settings-alert-success" style={{ color: 'var(--color-green)', backgroundColor: 'var(--color-green-bg)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontFamily: 'var(--font-lato)' }}>{successMessage}</div>}
      {errorMessage && <div className="settings-alert-error" style={{ color: 'var(--color-red)', backgroundColor: 'var(--color-red-bg)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontFamily: 'var(--font-lato)' }}>{errorMessage}</div>}

      <section className="settings-card">
        <div className="card-header">
          <h3>{t('settings.accountInfo.title')}</h3>
        </div>
        <div className="card-settings-body form-grid">
          <InputField label={t('settings.accountInfo.fullName')} value={fullName} icon={<SvgProfile />} onChange={(e) => setFullName(e.target.value)} />
          <InputField label={t('settings.accountInfo.email')} value={email} type="email" icon={<SvgEmail />} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </section>

      <section className="settings-card">
        <div className="card-header">
          <h3>{t('settings.preferences.title')}</h3>
        </div>
        <div className="card-settings-body toggles-list">
          <ToggleSwitch
            label={t('settings.preferences.emailNotify')}
            description={t('settings.preferences.emailNotifyDesc')}
            checked={emailNotify}
            onChange={setEmailNotify}
          />
          <ToggleSwitch
            label={t('settings.preferences.reserveNotify')}
            description={t('settings.preferences.reserveNotifyDesc')}
            checked={reserveNotify}
            onChange={setReserveNotify}
          />
          <ToggleSwitch
            label={t('settings.preferences.activityNotify')}
            description={t('settings.preferences.activityNotifyDesc')}
            checked={activityNotify}
            onChange={setActivityNotify}
          />
          <ToggleSwitch
            label={t('settings.preferences.language')}
            description={t('settings.preferences.languageDesc')}
            variant="options"
            options={[
              { label: 'EN', value: 'EN' },
              { label: 'UA', value: 'UK' }
            ]}
            selectedValue={language}
            onOptionSelect={handleLanguageChange}
          />
        </div>
      </section>

      <section className="settings-card">
        <div className="card-header">
          <h3>{t('settings.privacy.title')}</h3>
        </div>
        <div className="card-settings-body privacy-options">
          <p className="privacy-question">{t('settings.privacy.question')}</p>

          <label className={`radio-option-box ${privacySetting === 'Only me' ? 'checked' : ''}`}>
            <input
              type="radio"
              name="privacy"
              value="Only me"
              checked={privacySetting === 'Only me'}
              onChange={() => setPrivacySetting('Only me')}
            />
            <span className="custom-radio-circle"></span>
            <div className="radio-text">
              <span className="radio-title">{t('settings.privacy.onlyMe')}</span>
              <span className="radio-desc">{t('settings.privacy.onlyMeDesc')}</span>
            </div>
          </label>

          <label className={`radio-option-box ${privacySetting === 'Anyone with the link' ? 'checked' : ''}`}>
            <input
              type="radio"
              name="privacy"
              value="Anyone with the link"
              checked={privacySetting === 'Anyone with the link'}
              onChange={() => setPrivacySetting('Anyone with the link')}
            />
            <span className="custom-radio-circle"></span>
            <div className="radio-text">
              <span className="radio-title">{t('settings.privacy.anyone')}</span>
              <span className="radio-desc">{t('settings.privacy.anyoneDesc')}</span>
            </div>
          </label>
        </div>
      </section>

      <section className="settings-card settings-danger-zone-card">
        <div className="card-header">
          <h3>{t('settings.dangerZone.title')}</h3>
        </div>
        <div className="card-settings-body danger-row">
          <div className="danger-text">
            <span className="danger-title">{t('settings.dangerZone.deleteAccount')}</span>
            <span className="danger-desc">{t('settings.dangerZone.deleteAccountDesc')}</span>
          </div>
          <MainButton
            text={t('settings.dangerZone.deleteBtn')}
            backgroundColor="var(--color-red-bg)"
            hoverColor='var(--color-red-light-hover)'
            textColor="var(--color-red)"
            icon={<SvgWarning />}
            onClick={() => setIsDeleteOpen(true)}
            style={{minWidth: "8em"}}
          />
        </div>
      </section>

      <div className="settings-footer-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <MainButton
          text={isSaving ? t('settings.footer.saving') : t('settings.footer.save')}
          onClick={handleSave}
          hoverColor="var(--color-black-hover)"
          style={{minWidth: "8.75rem"}}
        />
      </div>

      {isDeleteOpen && (
        <ModaL
          title={t('settings.deleteModal.title')}
          buttonText={t('settings.deleteModal.confirm')}
          onClose={() => setIsDeleteOpen(false)}
          onSubmit={handleDeleteAccount}
          MainbuttonColor='var(--color-red)'
          secondaryButtonText={t('settings.deleteModal.cancel')}
          backgroundColor='var(--color-red-bg)'
          titleColor='var(--color-red)'
          icon={<SvgWarning />}
          description={t('settings.deleteModal.desc')}
        />
      )}
    </div>
  );
}