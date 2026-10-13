import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createWishlist, fetchSharedWishlists, fetchWishlists, updateWishlist, deleteWishlist } from "@/api/wishlists";
import { MainButton } from "@/components/common/MainButton";
import { SvgPlus, SvgWarning } from "@/components/common/Icons";
import { WishlistCard } from "@/components/common/WishlistCard";
import { StatCard } from "@/components/common/StatCard";
import type { Wishlist } from "@/types";
import "../../styles/wishlists.css";
import { ModaL } from "@/components/common/Modal";
import { InputField } from "@/components/common/InputField";
import { BigInputField } from "@/components/common/BigInputField";
import { ImageUploadArea } from "@/components/common/ImageUploadArea";
import { fetchReservedForMeItems } from "@/api/items";

export function WishlistsPage() {
  const { t } = useTranslation();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [sharedCount, setSharedCount] = useState(0);
  const [reservedCount, setReservedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Стейти для модалок
  const [creating, setCreating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeWishlistId, setActiveWishlistId] = useState<string | null>(null);

  // Спільні стейти форми (використовуються для Create та Settings)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [giftingDate, setGiftingDate] = useState("");
  const [privacySetting, setPrivacySetting] = useState("Anyone with the link");

  const loadWishlists = () => {
    setLoading(true);
    Promise.all([
      fetchWishlists(),
      fetchSharedWishlists().catch(() => []),
      fetchReservedForMeItems().catch(() => [])
    ])
      .then(([myWishlists, sharedLists, reservedItems]) => {
        setWishlists(myWishlists);
        setSharedCount(sharedLists.length);
        setReservedCount(reservedItems.length);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setGiftingDate("");
    setPrivacySetting("Anyone with the link");
    setActiveWishlistId(null);
  };

  // --- СТВОРЕННЯ ВІШЛІСТА ---
  const handleCreate = async () => {
    if (!name.trim() || !giftingDate) {
      return;
    }

    try {
      const newWishlist = await createWishlist({
        title: name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        giftingDate: giftingDate,
        visibility: privacySetting
      });

      setWishlists((prev) => [...prev, newWishlist]);
      resetForm();
      setCreating(false);
    } catch (err) {
      console.error("Failed to create wishlist", err);
    }
  };

  // --- НАЛАШТУВАННЯ ВІШЛІСТА ---
  const openSettings = (wishlist: Wishlist) => {
    setActiveWishlistId(wishlist.id);
    setName(wishlist.title);
    setDescription(wishlist.description || "");
    setImageUrl(wishlist.imageUrl || "");

    const formattedDate = wishlist.giftingDate 
      ? wishlist.giftingDate.split('T')[0] 
      : "";
    setGiftingDate(formattedDate);

    setPrivacySetting(wishlist.visibility || "Anyone with the link");
    setIsSettingsOpen(true);
  };

  const handleUpdate = async () => {
    if (!activeWishlistId) return;
    try {
      await updateWishlist(activeWishlistId, {
        title: name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        giftingDate: giftingDate || undefined,
        visibility: privacySetting
      });
      await loadWishlists(); // Перезавантажуємо список після збереження
      setIsSettingsOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to update wishlist", err);
    }
  };

  // --- ВИДАЛЕННЯ ВІШЛІСТА ---
  const openDelete = (id: string) => {
    setActiveWishlistId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!activeWishlistId) return;
    try {
      await deleteWishlist(activeWishlistId);
      await loadWishlists(); // Перезавантажуємо список після видалення
      setIsDeleteOpen(false);
      setActiveWishlistId(null);
    } catch (err) {
      console.error("Failed to delete wishlist", err);
    }
  };

  const totalItems = wishlists.reduce((sum, w) => sum + w.itemCount, 0);

  // СОРТУВАННЯ: Спочатку найближчі дати, потім пізніші, без дати — в кінець
  const sortedWishlists = [...wishlists].sort((a, b) => {
    if (!a.giftingDate) return 1;
    if (!b.giftingDate) return -1;
    return new Date(a.giftingDate).getTime() - new Date(b.giftingDate).getTime();
  });

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div className="header-titles">
          <h1>{t('wishlists.title')}</h1>
          <p className="subtitle">
            <span>{wishlists.length}</span> {t('wishlists.listsCount')} · <span>{totalItems}</span> {t('wishlists.itemsTotal')}
          </p>
        </div>
        <MainButton
          text={t('wishlists.newWishlist')}
          icon={<SvgPlus />}
          onClick={() => {
            resetForm();
            setCreating(true);
          }}
          collapseOnMobile={true}
          hoverColor="var(--color-black-hover)"
        />
      </div>

      <section className="wishlists-analytics-grid">
        <StatCard count={totalItems} label={t('wishlists.stats.totalItems')} countColor="var(--color-green)" />
        <StatCard count={reservedCount} label={t('wishlists.stats.reserved')} countColor="var(--color-pink)" />
        <StatCard count={sharedCount} label={t('wishlists.stats.shared')} countColor="var(--color-brown)" />
      </section>

      {loading && <p>{t('wishlists.loading')}</p>}
      {error && <p>{t('wishlists.error')} {error}</p>}

      <div className="wishlist-grid">
        {sortedWishlists.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: 'var(--color-gray)', fontFamily: 'var(--font-lato)', marginBottom: '16px' }}>
              {t('wishlists.empty')}
            </p>
          </div>
        ) : ( sortedWishlists.map((wishlist) => (
          <WishlistCard
            key={wishlist.id}
            title={wishlist.title}
            count={wishlist.itemCount}
            imageUrl={wishlist.imageUrl ?? undefined}
            giftingDate={wishlist.giftingDate ?? undefined}
            link={`/wishlists/${wishlist.id}`}
            onSettingsClick={() => openSettings(wishlist)}
            onDeleteClick={() => openDelete(wishlist.id)}
          />
        )))}
      </div>

      {/* Модалка Створення */}
      {creating && (
        <ModaL
          title={t('wishlists.modal.createTitle')}
          buttonText={t('wishlists.modal.createBtn')}
          MainbuttonColor='var(--color-pink)'
          secondaryButtonText={t('wishlists.modal.cancelBtn')}
          onClose={() => {
            setCreating(false);
            resetForm();
          }}
          onSubmit={handleCreate}
        >
          <Create
            name={name} setName={setName}
            description={description} setDescription={setDescription}
            imageUrl={imageUrl} setImageUrl={setImageUrl}
            giftingDate={giftingDate} setGiftingDate={setGiftingDate}
            privacySetting={privacySetting} setPrivacySetting={setPrivacySetting}
          />
        </ModaL>
      )}

      {/* Модалка Налаштувань */}
      {isSettingsOpen && (
        <ModaL
          title={t('wishlists.modal.settingsTitle')}
          buttonText={t('wishlists.modal.saveBtn')}
          MainbuttonColor='var(--color-pink)'
          secondaryButtonText={t('wishlists.modal.cancelBtn')}
          onClose={() => {
            setIsSettingsOpen(false);
            resetForm();
          }}
          onSubmit={handleUpdate}
        >
          <Create
            name={name} setName={setName}
            description={description} setDescription={setDescription}
            imageUrl={imageUrl} setImageUrl={setImageUrl}
            giftingDate={giftingDate} setGiftingDate={setGiftingDate}
            privacySetting={privacySetting} setPrivacySetting={setPrivacySetting}
          />
        </ModaL>
      )}

      {/* Модалка Видалення */}
      {isDeleteOpen && (
        <ModaL
          title={t('wishlists.modal.deleteTitle')}
          buttonText={t('wishlists.modal.deleteBtn')}
          onClose={() => setIsDeleteOpen(false)}
          onSubmit={handleDelete}
          MainbuttonColor='var(--color-red)'
          secondaryButtonText={t('wishlists.modal.cancelBtn')}
          backgroundColor='var(--color-red-bg)'
          titleColor='var(--color-red)'
          icon={<SvgWarning />}
          description={t('wishlists.modal.deleteDesc')}
        />
      )}
    </div>
  );
}

interface CreateProps {
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  giftingDate: string;
  setGiftingDate: (val: string) => void;
  privacySetting: string;
  setPrivacySetting: (val: string) => void;
}

function Create({
  name, setName,
  description, setDescription,
  imageUrl, setImageUrl,
  giftingDate, setGiftingDate,
  privacySetting, setPrivacySetting,
}: CreateProps) {
  const { t } = useTranslation();

  return (
    <>
      <ImageUploadArea imageUrl={imageUrl} setImageUrl={setImageUrl} />
      <InputField
        label={t('wishlists.form.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('wishlists.form.namePlaceholder')}
      />
      <BigInputField
        label={t('wishlists.form.desc')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('wishlists.form.descPlaceholder')}
      />
      <InputField
        label={t('wishlists.form.date')}
        value={giftingDate}
        type="date"
        onChange={(e) => setGiftingDate(e.target.value)}
      />

      <div>
        <p className="privacy-question">{t('wishlists.form.privacyLabel')}</p>

        <label className={`radio-option-box ${privacySetting === "Only me" ? "checked" : ""}`}>
          <input
            type="radio"
            name="privacy"
            value="Only me"
            checked={privacySetting === "Only me"}
            onChange={() => setPrivacySetting("Only me")}
          />
          <span className="custom-radio-circle"></span>
          <div className="radio-text">
            <span className="radio-title">{t('wishlists.form.onlyMe')}</span>
            <span className="radio-desc">{t('wishlists.form.onlyMeDesc')}</span>
          </div>
        </label>

        <label className={`radio-option-box ${privacySetting === "Anyone with the link" ? "checked" : ""}`}>
          <input
            type="radio"
            name="privacy"
            value="Anyone with the link"
            checked={privacySetting === "Anyone with the link"}
            onChange={() => setPrivacySetting("Anyone with the link")}
          />
          <span className="custom-radio-circle"></span>
          <div className="radio-text">
            <span className="radio-title">{t('wishlists.form.anyone')}</span>
            <span className="radio-desc">{t('wishlists.form.anyoneDesc')}</span>
          </div>
        </label>
      </div>
    </>
  );
}