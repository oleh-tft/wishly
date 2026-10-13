import { MainButton } from '@/components/common/MainButton';
import '../../styles/landing.css'
import { WishCard } from '@/components/common/WishCard';
import { SvgArrowDown, SvgSettings, SvgShare } from '@/components/common/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Додано імпорт
import lightGradient from '@/assets/images/light-gradient.png';
import giftBox from '@/assets/images/gift-box-with-ribbon.png';
import placeholder1 from '@/assets/images/placeholder-1.png'
import placeholder2 from '@/assets/images/placeholder-2.png'
import placeholder3 from '@/assets/images/placeholder-3.png'
import placeholder4 from '@/assets/images/placeholder-4.png'
import placeholder5 from '@/assets/images/placeholder-5.png'
import placeholder6 from '@/assets/images/placeholder-6.png'
import placeholder7 from '@/assets/images/placeholder-7.png'
import placeholder8 from '@/assets/images/placeholder-8.png'
import { ROUTES } from '@/routes/paths';
import { ModaL } from '@/components/common/Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function LandingPage() {
  const [showAd, setShowAd] = useState(false)
  const [showFloatingBtn, setShowFloatingBtn] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation(); // Підключення хука

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowFloatingBtn(true);
      } else {
        setShowFloatingBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <img src={lightGradient} className="bg-gradient-top" alt="" aria-hidden="true" />
      <SectionMain />
      <SectionAboutUs />
      <SectionHIW />
      <SectionWCU />
      <SectionPreview setShowAd={setShowAd} />
      <SectionCreate />
      {showFloatingBtn && <div className="landing-btn-floating">
        <MainButton backgroundColor="var(--color-black)" hoverColor='var(--color-black-hover)' textColor="var(--color-white)" icon={<SvgArrowDown />} style={{ boxShadow: "0px 4px 24px 0px #0F0E1A38", rotate: "180deg", borderRadius: "50%", width: "48px", height: "48px" }} onClick={scrollToTop}/>
      </div>}
      {showAd && (
        <ModaL 
          title={t('landing.modal.title')} 
          buttonText={t('landing.modal.button')} 
          MainbuttonColor='var(--color-pink)' 
          description={t('landing.modal.description')} 
          onSubmit={() => navigate("/sign-up")} 
          onClose={() => setShowAd(false)} 
        />
      )}
    </>
  );
}

function SectionMain() {
  const navigate = useNavigate()
  const { t } = useTranslation();

  const scrollToHowItWorks = () => {
    const element = document.getElementById('hiw');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="section-main">
      <div className="main-name">
        <img src={giftBox} className="present present-tr" alt="present" />
        <img src={giftBox} className="present present-bl" alt="present" />
        <img src={giftBox} className="present present-bm" alt="present" />
        <h1>WISHLY</h1>
        <div className="main-description-wrap">
          <div className="desc-label-wrap">
            <div className="pink-dot"></div>
            <p className="description-label">{t('landing.main.labelFull')}</p>
          </div>
          <div className="desc-label-mobile-wrap label-simple">
            <div className="pink-dot"></div>
            <p className="description-label">{t('landing.main.labelSimple')}</p>
          </div>
          <div className="desc-label-mobile-wrap label-beautiful">
            <p className="description-label">{t('landing.main.labelBeautiful')}</p>
            <div className="pink-dot"></div>
          </div>
          <div className="description-info">
            <p className="description-text">{t('landing.main.description')}</p>
            <div className="description-buttons">
              <MainButton text={t('landing.main.btnCreate')} backgroundColor='var(--color-pink)' textColor='var(--color-white)' style={{ width: "48%" }} onClick={() => navigate("/sign-up")} />
              <MainButton text={t('landing.main.btnHow')} backgroundColor='var(--color-black)' hoverColor='var(--color-black-hover)' textColor='var(--color-white)' style={{ width: "48%" }} onClick={scrollToHowItWorks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionAboutUs() {
  const { t } = useTranslation();
  return (
    <div id="about-us" className="section-about-us">
      <div className="about-us-img"></div>
      <div className="about-us">
        <p className="about-us-title">{t('landing.about.tag')}</p>
        <div className="about-us-info">
          <h3>{t('landing.about.title')}</h3>
          <p>{t('landing.about.p1')}</p>
          <p>{t('landing.about.p2')}</p>
        </div>
        <div className="about-us-stats">
          <div className="stat-wrap">
            <p className="stat-num">180k+</p>
            <p className="stat-text">{t('landing.about.stat1')}</p>
          </div>
          <div className="stat-wrap">
            <p className="stat-num">42</p>
            <p className="stat-text">{t('landing.about.stat2')}</p>
          </div>
          <div className="stat-wrap">
            <p className="stat-num">4.9★</p>
            <p className="stat-text">{t('landing.about.stat3')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHIW() {
  const { t } = useTranslation();
  return (
    <div id="hiw" className="section-hiw">
      <p className="hiw-title">{t('landing.hiw.title')}</p>
      <div className="hiw-steps">
        <div className="hiw-step">
          <p className="step-num">01</p>
          <h4 className="step-name">{t('landing.hiw.step1Title')}</h4>
          <p className="step-description">{t('landing.hiw.step1Desc')}</p>
        </div>
        <div className="hiw-step">
          <p className="step-num">02</p>
          <h4 className="step-name">{t('landing.hiw.step2Title')}</h4>
          <p className="step-description">{t('landing.hiw.step2Desc')}</p>
        </div>
        <div className="hiw-step">
          <p className="step-num">03</p>
          <h4 className="step-name">{t('landing.hiw.step3Title')}</h4>
          <p className="step-description">{t('landing.hiw.step3Desc')}</p>
        </div>
      </div>
    </div>
  )
}

function SectionWCU() {
  const { t } = useTranslation();
  return (
    <div id="wcu" className="section-wcu">
      <div className="wcu-left">
        <p className="wcu-title">{t('landing.wcu.title')}</p>
        <div className="wcu-info">
          <h3>{t('landing.wcu.headingLine1')}<br />{t('landing.wcu.headingLine2')}</h3>
          <p>{t('landing.wcu.desc')}</p>
        </div>
      </div>
      <div className="wcu-right">
        <div className="wcu-advantage">
          <div className="advantage-icon">✦</div>
          <div className="advantage-info">
            <h4>{t('landing.wcu.adv1Title')}</h4>
            <p>{t('landing.wcu.adv1Desc')}</p>
          </div>
        </div>
        <div className="wcu-advantage">
          <div className="advantage-icon">✦</div>
          <div className="advantage-info">
            <h4>{t('landing.wcu.adv2Title')}</h4>
            <p>{t('landing.wcu.adv2Desc')}</p>
          </div>
        </div>
        <div className="wcu-advantage">
          <div className="advantage-icon">✦</div>
          <div className="advantage-info">
            <h4>{t('landing.wcu.adv3Title')}</h4>
            <p>{t('landing.wcu.adv3Desc')}</p>
          </div>
        </div>
        <div className="wcu-advantage">
          <div className="advantage-icon">✦</div>
          <div className="advantage-info">
            <h4>{t('landing.wcu.adv4Title')}</h4>
            <p>{t('landing.wcu.adv4Desc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionPreview({ setShowAd }: { setShowAd: Dispatch<SetStateAction<boolean>> }) {
  const { t } = useTranslation();
  return (
    <div id="preview" className="section-preview">
      <div className="preview-head">
        <p className="preview-title">{t('landing.preview.tag')}</p>
        <h2>{t('landing.preview.title')}</h2>
        <p className="preview-text">{t('landing.preview.desc')}</p>
      </div>
      <div className="preview-container">
        <div className="landing-wishlist-container">
          <div className="landing-wishlist-detail-header">
            <div className="header-titles">
              <h1>{t('landing.preview.mockTitle')}</h1>
              <div className="subtitle-count">
                <p>8</p> {t('landing.preview.items')} · <p>2</p> {t('landing.preview.reserved')}
              </div>
            </div>

            <div className="landing-wishlist-actions">
              <MainButton text={t('landing.preview.btnSettings')} backgroundColor="var(--color-white)" hoverColor="var(--color-pink-bg)" textColor="var(--color-gray)" icon={<SvgSettings />} style={{ border: "1px solid var(--color-border)" }} collapseOnMobile={true} onClick={() => setShowAd(true)} />
              <MainButton text={t('landing.preview.btnShare')} backgroundColor="var(--color-pink)" textColor="var(--color-white)" collapseOnMobile={true} icon={<SvgShare />} onClick={() => setShowAd(true)} />
            </div>
          </div>

          <div className='preview-separator'></div>

          <div className="landing-items-grid">
            <WishCard id="1" title={t('landing.preview.itemsList.1')} price={78} imageUrl={placeholder1} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="2" title={t('landing.preview.itemsList.2')} price={55} imageUrl={placeholder2} isReserved={true} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="3" title={t('landing.preview.itemsList.3')} price={195} imageUrl={placeholder3} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="4" title={t('landing.preview.itemsList.4')} price={45} imageUrl={placeholder4} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="5" title={t('landing.preview.itemsList.5')} price={220} imageUrl={placeholder5} isReserved={true} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="6" title={t('landing.preview.itemsList.6')} price={375} imageUrl={placeholder6} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="7" title={t('landing.preview.itemsList.7')} price={490} imageUrl={placeholder7} mockButton={true} mockAction={() => setShowAd(true)} />
            <WishCard id="8" title={t('landing.preview.itemsList.8')} price={65} imageUrl={placeholder8} mockButton={true} mockAction={() => setShowAd(true)} />
          </div>
        </div>
      </div>
      <div className="preview-end">
        <span className="preview-white">{t('landing.preview.endText')}</span>
        <Link to={ROUTES.signIn} className="preview-pink">{t('landing.preview.endLink')}</Link>
      </div>
    </div>
  )
}

function SectionCreate() {
  const navigate = useNavigate()
  const { t } = useTranslation();

  return (
    <div className="section-create">
      <h3>{t('landing.create.title')}</h3>
      <p>{t('landing.create.subtitle')}</p>
      <MainButton text={t('landing.create.btn')} backgroundColor='var(--color-black)' hoverColor='var(--color-black-hover)' textColor='var(--color-white)' onClick={() => navigate("/sign-up")} />
    </div>
  )
}