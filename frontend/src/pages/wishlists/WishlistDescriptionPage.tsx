import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import '../../styles/wishlistdescription.css'
import { MainButton } from "@/components/common/MainButton";
import { SvgArrowFullLeft, SvgCheckmark, SvgLink, SvgPlus, SvgSettings, SvgShare, SvgWarning } from "@/components/common/Icons";
import { WishCard } from "@/components/common/WishCard";
import { WishItem, WishlistDetail, User } from "@/types";
import { useEffect, useState } from "react";
import { fetchWishlist, fetchWishlistItems, addWishlistItem, updateWishlist, joinWishlist } from "@/api/wishlists";
import { fetchCurrentUser } from "@/api/users";
import { ModaL } from "@/components/common/Modal";
import { InputField } from "@/components/common/InputField";
import { BigInputField } from "@/components/common/BigInputField";
import { ImageUploadArea } from "@/components/common/ImageUploadArea";
import { deleteItem, updateItem, reserveItem, unreserveItem } from "@/api/items";

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
}

export function WishlistDescriptionPage() {
  const { t } = useTranslation();
  const { wishlistId } = useParams<{ wishlistId: string }>();
  const [wishlistItems, setWishlistItems] = useState<WishItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [copied, setCopied] = useState(false);

  const [creatingWish, setCreatingWish] = useState(false);
  const [editingItem, setEditingItem] = useState<WishItem | null>(null);
  const [viewingItem, setViewingItem] = useState<WishItem | null>(null);

  const [reservingItem, setReservingItem] = useState<WishItem | null>(null);
  const [unreservingItem, setUnreservingItem] = useState<WishItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [settingsName, setSettingsName] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsImageUrl, setSettingsImageUrl] = useState("");
  const [settingsDate, setSettingsDate] = useState("");
  const [settingsPrivacy, setSettingsPrivacy] = useState("Anyone with the link");

  const navigate = useNavigate()

  const isMyWishlist = wishlist && currentUser && String(wishlist.userId) === String(currentUser.id);

  const loadData = async () => {
    if (!wishlistId) return;
    try {
      const [listData, itemsData, userData] = await Promise.all([
        fetchWishlist(wishlistId),
        fetchWishlistItems(wishlistId),
        fetchCurrentUser().catch(() => null)
      ]);
      setWishlist(listData);
      setWishlistItems(itemsData);
      setCurrentUser(userData);

      if (userData && String(listData.userId) !== String(userData.id)) {
        await joinWishlist(wishlistId).catch(console.error);
      }
    } catch (error) {
      console.error(error);
      navigate("/wishlists");
    }
  };

  useEffect(() => {
    loadData();
  }, [wishlistId]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const openSettingsModal = () => {
    if (!wishlist) return;
    setSettingsName(wishlist.title || "");
    setSettingsDesc(wishlist.description || "");
    setSettingsImageUrl(wishlist.imageUrl || "");

    const formattedDate = wishlist.giftingDate
      ? wishlist.giftingDate.split('T')[0]
      : "";
    setSettingsDate(formattedDate);

    setSettingsPrivacy(wishlist.visibility || "Anyone with the link");
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!wishlistId) return;
    if (!settingsName.trim()) return;

    try {
      await updateWishlist(wishlistId, {
        title: settingsName,
        description: settingsDesc || undefined,
        imageUrl: settingsImageUrl || undefined,
        giftingDate: settingsDate || undefined,
        visibility: settingsPrivacy
      });

      await loadData();
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCreateWish = async () => {
    if (!wishlistId) return;
    if (!name.trim() || !price) return;

    try {
      await addWishlistItem(wishlistId, {
        title: name,
        price: parseFloat(price),
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        externalLink: link || undefined,
      });

      await loadData();
      closeWishModal();
    } catch (error) {
      console.error("Failed to add wish:", error);
    }
  };

  const openEditModal = (item: WishItem) => {
    setEditingItem(item);
    setName(item.title);
    setPrice(item.price.toString());
    setLink(item.externalLink || "");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
  };

  const handleEditWish = async () => {
    if (!editingItem || !name.trim() || !price) return;

    try {
      await updateItem(editingItem.id, {
        title: name,
        price: parseFloat(price),
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        externalLink: link || undefined,
      });

      await loadData();
      closeWishModal();
    } catch (error) {
      console.error("Failed to edit wish:", error);
    }
  };

  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteWish = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete);
      await loadData();
      setIsDeleteOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete wish:", error);
    }
  };

  const closeWishModal = () => {
    setCreatingWish(false);
    setEditingItem(null);
    setName("");
    setPrice("");
    setLink("");
    setDescription("");
    setImageUrl("");
  };

  const handleReserve = async () => {
    if (!reservingItem) return;
    try {
      await reserveItem(reservingItem.id);
      await loadData(); 
      setReservingItem(null); 
    } catch (error) {
      console.error("Failed to reserve item:", error);
    }
  };

  const handleUnreserve = async () => {
    if (!unreservingItem) return;
    try {
      await unreserveItem(unreservingItem.id);
      await loadData(); 
      setUnreservingItem(null); 
    } catch (error) {
      console.error("Failed to unreserve item:", error);
    }
  };

  return (
    <>
      <header className="wishlistdescription-header">
        <div className="wishlistdescription-header-container">
          <div className="wishlistdescription-logo">wishly</div>
          <div className="wishlistdescription-button-back" onClick={() => navigate(-1)}>
            <SvgArrowFullLeft />
            <div className="wishlistdescription-backtitle">{t('wishlistDesc.back')}</div>
          </div>
        </div>
      </header>

      <div className="wishlist-description-container">
        <div className="wishlist-detail-header">
          <div className="header-titles">
            <h1>{wishlist?.title}</h1>
            <p className="subtitle-description">
              {wishlist?.description}
            </p>
            <div className="subtitle-count">
              <p>{wishlist?.itemCount}</p>
              {t('wishlistDesc.items')} ·
              <p>{wishlist?.reservedCount}</p>
              {t('wishlistDesc.reserved')}
            </div>
          </div>

          <div className="wishlist-actions">
            {isMyWishlist && (
              <MainButton
                text={t('wishlistDesc.settingsBtn')}
                backgroundColor="var(--color-white)"
                hoverColor="var(--color-pink-bg)"
                textColor="var(--color-gray)"
                icon={<SvgSettings />}
                style={{ border: "var(--border-main)" }}
                collapseOnMobile={true}
                onClick={openSettingsModal}
              />
            )}
            {isMyWishlist && (
              <div className="wishlist-description-btn-wrap">
                <MainButton
                  text={copied ? t('wishlistDesc.copiedBtn') : t('wishlistDesc.shareBtn')}
                  backgroundColor="var(--color-pink)"
                  textColor="var(--color-white)"
                  collapseOnMobile={true}
                  icon={copied ? <SvgCheckmark /> : <SvgShare />}
                  onClick={handleShare}
                />
              </div>
            )}
          </div>
        </div>

        <div className="items-grid">
          {wishlistItems.map((item) => (
            <WishCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              isReserved={item.isReserved}
              isMyWishlist={!!isMyWishlist}
              reservedByMe={item.reservedByMe}
              imageUrl={item.imageUrl ?? undefined}
              onCardClick={() => setViewingItem(item)}
              onEditClick={() => openEditModal(item)}
              onDeleteClick={() => openDeleteModal(item.id)}
              onReserveClick={() => setReservingItem(item)}
              onReservedByYouClick={() => setUnreservingItem(item)}
            />
          ))}
        </div>
      </div>

      {isMyWishlist && (
        <div className="btn-floating-add">
          <MainButton
            text={t('wishlistDesc.addWishBtn')}
            backgroundColor="var(--color-black)"
            hoverColor="var(--color-black-hover)"
            textColor="var(--color-white)"
            collapseOnMobile={true}
            icon={<SvgPlus />}
            style={{ boxShadow: "0px 4px 24px 0px #0F0E1A38" }}
            onClick={() => setCreatingWish(true)}
          />
        </div>
      )}

      {/* МОДАЛКИ */}
      {viewingItem && (
        <DetailsModal onClose={() => setViewingItem(null)} item={viewingItem}/>
      )}

      {reservingItem && (
        <DetailsModal 
          onClose={() => setReservingItem(null)} 
          item={reservingItem} 
          buttonText={t('wishlistDesc.modal.reserveTitle')} 
          buttonColor="var(--color-pink)" 
          buttonAction={handleReserve}
        />
      )}

      {unreservingItem && (
        <DetailsModal 
          onClose={() => setUnreservingItem(null)} 
          item={unreservingItem} 
          buttonText={t('wishlistDesc.modal.cancelReserveTitle')} 
          buttonHoverColor="var(--color-red-hover)"
          buttonColor="var(--color-red)" 
          buttonAction={handleUnreserve}
        />
      )}

      {(creatingWish || editingItem) && (
        <ModaL
          title={editingItem ? t('wishlistDesc.modal.editWishTitle') : t('wishlistDesc.modal.addWishTitle')}
          buttonText={editingItem ? t('wishlistDesc.modal.saveBtn') : t('wishlistDesc.modal.createBtn')}
          MainbuttonColor='var(--color-pink)'
          secondaryButtonText={t('wishlistDesc.modal.cancelBtn')}
          onClose={closeWishModal}
          onSubmit={editingItem ? handleEditWish : handleCreateWish}
        >
          <CreateWishForm
            name={name} setName={setName}
            price={price} setPrice={setPrice}
            link={link} setLink={setLink}
            description={description} setDescription={setDescription}
            imageUrl={imageUrl} setImageUrl={setImageUrl}
            wishlistTitle={wishlist?.title || t('wishlists.form.namePlaceholder')}
          />
        </ModaL>
      )}

      {isSettingsOpen && (
        <ModaL
          title={t('wishlists.modal.settingsTitle')}
          buttonText={t('wishlists.modal.saveBtn')}
          MainbuttonColor='var(--color-pink)'
          secondaryButtonText={t('wishlists.modal.cancelBtn')}
          onClose={() => setIsSettingsOpen(false)}
          onSubmit={handleSaveSettings}
        >
          <ImageUploadArea imageUrl={settingsImageUrl} setImageUrl={setSettingsImageUrl} />
          <InputField label={t('wishlists.form.name')} value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
          <BigInputField label={t('wishlists.form.desc')} value={settingsDesc} onChange={(e) => setSettingsDesc(e.target.value)} />

          <InputField
            label={t('wishlists.form.date')}
            value={settingsDate}
            type="date"
            onChange={(e) => setSettingsDate(e.target.value)}
          />

          <div>
            <p className="privacy-question">{t('wishlists.form.privacyLabel')}</p>
            <label className={`radio-option-box ${settingsPrivacy === "Only me" ? "checked" : ""}`}>
              <input type="radio" name="privacy" value="Only me" checked={settingsPrivacy === "Only me"} onChange={() => setSettingsPrivacy("Only me")} />
              <span className="custom-radio-circle"></span>
              <div className="radio-text">
                <span className="radio-title">{t('wishlists.form.onlyMe')}</span>
                <span className="radio-desc">{t('wishlists.form.onlyMeDesc')}</span>
              </div>
            </label>

            <label className={`radio-option-box ${settingsPrivacy === "Anyone with the link" ? "checked" : ""}`}>
              <input type="radio" name="privacy" value="Anyone with the link" checked={settingsPrivacy === "Anyone with the link"} onChange={() => setSettingsPrivacy("Anyone with the link")} />
              <span className="custom-radio-circle"></span>
              <div className="radio-text">
                <span className="radio-title">{t('wishlists.form.anyone')}</span>
                <span className="radio-desc">{t('wishlists.form.anyoneDesc')}</span>
              </div>
            </label>
          </div>
        </ModaL>
      )}

      {isDeleteOpen && (
        <ModaL
          title={t('wishlistDesc.modal.deleteTitle')}
          buttonText={t('wishlistDesc.modal.deleteBtn')}
          onClose={() => {
            setIsDeleteOpen(false);
            setItemToDelete(null);
          }}
          onSubmit={handleDeleteWish}
          MainbuttonColor='var(--color-red)'
          secondaryButtonText={t('wishlistDesc.modal.cancelBtn')}
          backgroundColor='var(--color-red-bg)'
          titleColor='var(--color-red)'
          icon={<SvgWarning />}
          description={t('wishlistDesc.modal.deleteDesc')}
        />
      )}
    </>
  );
}

interface CreateWishFormProps {
  name: string;
  setName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  link: string;
  setLink: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  wishlistTitle: string;
}

function CreateWishForm({
  name, setName,
  price, setPrice,
  link, setLink,
  description, setDescription,
  imageUrl, setImageUrl,
  wishlistTitle
}: CreateWishFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <ImageUploadArea imageUrl={imageUrl} setImageUrl={setImageUrl} />
      <InputField label={t('wishlistDesc.form.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('wishlistDesc.form.namePlaceholder')} />
      <InputField label={t('wishlistDesc.form.price')} value={price} type="number" onChange={(e) => setPrice(e.target.value)} placeholder={t('wishlistDesc.form.pricePlaceholder')} />
      <InputField label={t('wishlistDesc.form.link')} value={link} type="url" onChange={(e) => setLink(e.target.value)} placeholder={t('wishlistDesc.form.linkPlaceholder')} />
      <div style={{ pointerEvents: 'none', opacity: 0.4 }}>
        <InputField label={t('wishlistDesc.form.wishlist')} value={wishlistTitle} onChange={() => { }} />
      </div>
      <BigInputField label={t('wishlistDesc.form.desc')} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('wishlistDesc.form.descPlaceholder')} />
    </>
  );
}

interface DetailsModalProps {
  onClose: () => void,
  item: WishItem,
  buttonText?: string,
  buttonColor?: string,
  buttonHoverColor?: string,
  buttonAction?: () => void 
}

function DetailsModal({onClose, item, buttonText, buttonColor, buttonHoverColor, buttonAction} : DetailsModalProps) {
  const { t } = useTranslation();

  return <ModaL
    onClose={onClose}
    title={t('wishlistDesc.modal.wishDetails')}
    buttonText={buttonText}
    MainbuttonColor={buttonColor}
    mainButtonHoverColor={buttonHoverColor}
    onSubmit={buttonAction}
  >
    <div className="view-wish-layout">
      {item.imageUrl ? (
        <div className="view-wish-image-wrap">
          <img src={item.imageUrl} alt={item.title} />
        </div>
      ) : (
        <div className="view-wish-placeholder"></div>
      )}
      <div className="view-wish-info">
        <h3>{item.title}</h3>
        <p className="view-wish-price">{item.price} $</p>
        {item.description && <p className="view-wish-desc">{item.description}</p>}

        {item.externalLink && (
          <a href={normalizeUrl(item.externalLink)} target="_blank" rel="noopener noreferrer" className="view-wish-link">
            <MainButton icon={<SvgLink />} text={t('wishlistDesc.modal.linkBtn')} textColor="var(--color-blue-light)" backgroundColor="var(--color-blue-bg)" hoverColor="var(--color-blue-light-bg)" style={{ width: "100%" }} small={true} />
          </a>
        )}
      </div>
    </div>
  </ModaL>
}