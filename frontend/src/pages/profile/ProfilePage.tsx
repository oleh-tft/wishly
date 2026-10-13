import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/routes/paths";
import { StatCard } from "../../components/common/StatCard";
import { MainButton } from "../../components/common/MainButton";
import { SvgArrowFullRight, SvgEdit, SvgProfile } from "../../components/common/Icons";
import { ModaL } from "../../components/common/Modal";
import { InputField } from "../../components/common/InputField";
import "../../styles/profile.css";
import { fetchCurrentUser, updateCurrentUser, type UserResponse } from "../../api/users";
import { clearToken } from "@/api/auth";

import { fetchWishlists, fetchSharedWishlists } from "@/api/wishlists";
import { fetchReservedForMeItems } from "@/api/items";
import type { Wishlist } from "@/types";

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

  const [totalWishlistsCount, setTotalWishlistsCount] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);
  const [reservedCount, setReservedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCurrentUser(),
      fetchWishlists().catch(() => [] as Wishlist[]),
      fetchSharedWishlists().catch(() => []),
      fetchReservedForMeItems().catch(() => [])
    ])
      .then(([user, myWishlists, sharedLists, reservedItems]) => {
        setCurrentUser(user);

        setTotalWishlistsCount(myWishlists.length);
        setTotalItemsCount(myWishlists.reduce((sum, w) => sum + w.itemCount, 0));
        setSharedCount(sharedLists.length);
        setReservedCount(reservedItems.length);
      })
      .catch((err) => {
        console.error("Failed to aggregate profile stats context:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const fullName = currentUser?.name ?? "";
  const email = currentUser?.email ?? "";
  const profileBio = currentUser?.bio ?? "";
  const profileAvatarUrl = currentUser?.avatarUrl ?? null;
  const modalAvatarUrl = editAvatarPreview ?? profileAvatarUrl;
  const currentModalName = editName || fullName;
  const initial = currentModalName ? currentModalName.charAt(0).toUpperCase() : "";

  const memberSince = currentUser?.createdAt
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(currentUser.createdAt))
    : "";

  const accountData = [
    { label: t('profile.accountDetails.fullName'), value: fullName },
    { label: t('profile.accountDetails.email'), value: email },
    ...(memberSince ? [{ label: t('profile.accountDetails.memberSince'), value: memberSince }] : [])
  ];

  const handleOpenEditModal = () => {
    setEditName(fullName);
    setEditBio(profileBio);
    setEditAvatarPreview(null);
    setIsEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditAvatarPreview(null);
    setIsEditOpen(false);
  };

  const handleBadgeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setEditAvatarPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const updatePayload = {
      name: editName,
      bio: editBio.trim() || null,
      avatarUrl: modalAvatarUrl,
    };

    try {
      const updatedUser = await updateCurrentUser(updatePayload);
      setCurrentUser(updatedUser);
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    setIsSignOutOpen(false);
    navigate(ROUTES.signIn);
  };

  if (loading) {
    return <div className="profile-page-view"><p>{t('profile.loading')}</p></div>;
  }

  return (
    <>
      <div className="profile-page-view">
        <div className="page-header-block">
          <h1 className="page-title">{t('profile.title')}</h1>
          <p className="page-subtitle">{t('profile.subtitle')}</p>
        </div>

        <section className="profile-banner-card">
          <div className="avatar-square">
            {profileAvatarUrl ? (
              <img src={profileAvatarUrl} alt={fullName} className="profile-avatar-img" />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          <div className="bio-info-block">
            <h2 className="bio-name">{fullName}</h2>
            <span className="bio-email">{email}</span>
            <p className="bio-text">{profileBio || t('profile.noBio')}</p>

            <div className="bio-action-row">
              <MainButton
                text={t('profile.editBtn')}
                backgroundColor="var(--color-pink-light)"
                hoverColor="var(--color-pink-light-hover)"
                textColor="var(--color-pink)"
                icon={<SvgEdit />}
                onClick={handleOpenEditModal}
              />
            </div>
          </div>
        </section>

        <section className="analytics-grid">
          <StatCard count={totalWishlistsCount} label={t('profile.stats.totalWishlists')} countColor="var(--color-indigo)" />
          <StatCard count={totalItemsCount} label={t('profile.stats.totalItems')} countColor="var(--color-green)" />
          <StatCard count={reservedCount} label={t('profile.stats.reserved')} countColor="var(--color-pink)" />
          <StatCard count={sharedCount} label={t('profile.stats.shared')} countColor="var(--color-brown)" />
        </section>

        <section className="details-table-card">
          <div className="table-header">
            <h3>{t('profile.accountDetails.title')}</h3>
          </div>
          <div className="table-body">
            {accountData.map((row) => (
              <div key={row.label} className="table-row-item">
                <span className="row-label">{row.label}</span>
                <span className="row-value">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="settings-footer-actions">
          <MainButton
            text={t('profile.signOutBtn')}
            backgroundColor="var(--color-black)"
            hoverColor="var(--color-black-hover)"
            textColor="var(--color-white)"
            onClick={() => setIsSignOutOpen(true)}
            icon={<SvgArrowFullRight />}
            iconPosition="after"
          />
        </div>
      </div>

      {isEditOpen && (
        <ModaL
          title={t('profile.editModal.title')}
          buttonText={isSaving ? t('profile.editModal.saving') : t('profile.editModal.save')}
          onClose={handleCloseEditModal}
          onSubmit={handleSaveProfile}
          MainbuttonColor="var(--color-pink)"
          secondaryButtonText={t('profile.editModal.cancel')}
        >
          <div className="edit-profile-form">
            <div className="modal-avatar-section">
              <span className="modal-section-label">{t('profile.editModal.photoLabel')}</span>
              <div className="modal-avatar-circle">
                <div className="modal-avatar-image">
                  {modalAvatarUrl ? (
                    <img src={modalAvatarUrl} alt={editName} className="profile-avatar-img" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <button className="modal-avatar-badge" type="button" onClick={handleBadgeClick}><SvgEdit /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
              </div>
            </div>

            <div className="modal-input-group">
              <InputField label={t('profile.editModal.nameLabel')} value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="modal-input-group">
              <label className="modal-custom-label">{t('profile.editModal.bioLabel')}</label>
              <textarea 
                className="modal-custom-textarea" 
                value={editBio} 
                onChange={(e) => setEditBio(e.target.value)} 
                maxLength={200}
                rows={4} 
              />
              <span style={{ fontSize: "12px", color: "var(--color-gray)", textAlign: "right", marginTop: "4px" }}>
                {editBio.length}/200
              </span>
            </div>
          </div>
        </ModaL>
      )}

      {isSignOutOpen && (
        <ModaL
          title={t('profile.signOutModal.title')}
          buttonText={t('profile.signOutModal.confirm')}
          onClose={() => setIsSignOutOpen(false)}
          onSubmit={handleSignOut}
          MainbuttonColor="var(--color-pink)"
          secondaryButtonText={t('profile.signOutModal.cancel')}
          description={t('profile.signOutModal.desc')}
        >
        </ModaL>
      )}
    </>
  );
}