import { useLanguage } from "../../i18n/LanguageContext";
import { copy } from "../../../seo/copy.js";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import footerTranslations from "../../i18n/footerTranslations.js";
import siteConfig from "../../config/site";
import "./Footer.css";
import VoyHavenLogo from "../Brand/VoyHavenLogo";

const cardPaymentMethods = [
  { id: "visa", label: "Visa", display: "VISA" },
  { id: "mastercard", label: "Mastercard", display: "mastercard" },
  { id: "amex", label: "American Express", display: "AMEX" },
  { id: "discover", label: "Discover", display: "DISCOVER" },
  { id: "jcb", label: "JCB", display: "JCB" },
  { id: "diners", label: "Diners Club", display: "DINERS CLUB" },
  { id: "unionpay", label: "UnionPay", display: "UnionPay" },
  { id: "applepay", label: "Apple Pay", display: "Apple Pay" },
  { id: "googlepay", label: "Google Pay", display: "G Pay" },
  { id: "3dsecure", label: "3D Secure", display: "3D Secure" },
];

const cryptoPaymentMethods = [
  { id: "usdt", label: "USDT on BNB Chain or Ethereum", display: "₮ USDT", network: "BSC · ETH" },
  { id: "usdc", label: "USDC on BNB Chain or Ethereum", display: "◎ USDC", network: "BSC · ETH" },
  { id: "bnb", label: "BNB on BNB Chain", display: "BNB", network: "BNB Chain" },
  { id: "eth", label: "ETH on Ethereum", display: "◆ ETH", network: "Ethereum" },
];

function PaymentCard({ method }) {
  return (
    <span
      className={`footerPaymentCard footerPaymentCard--${method.id}`}
      aria-label={method.label}
      title={method.label}
    >
      {method.id === "mastercard" && (
        <i className="mastercardMark" aria-hidden="true" />
      )}
      {method.id === "3dsecure" && (
        <i className="secureMark" aria-hidden="true">✓</i>
      )}
      <b>{method.display}</b>
      {method.network && <small>{method.network}</small>}
    </span>
  );
}

function Footer() {
  const { language, t } = useLanguage();
  const seoCopy = copy[language];
  const labels = footerTranslations[language] || footerTranslations.en;
  const infoLink = path => `${path}?lang=${language}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div className="footerBrand">
          <Link to="/" className="footerLogo">
            <VoyHavenLogo className="footerVoyHavenLogo" alt={siteConfig.brandName} />
          </Link>

          <p>{siteConfig.description}</p>

          <div className="socialLinks" aria-label="VoyHaven social channels">
            <span aria-label="Facebook"><FaFacebookF /></span>
            <span aria-label="Instagram"><FaInstagram /></span>
            <span aria-label="X"><FaXTwitter /></span>
            <span aria-label="YouTube"><FaYoutube /></span>
          </div>
        </div>

        <div className="footerColumn">
          <h3>{labels.travel}</h3>
          <Link to="/">{labels.hotels}</Link>
          <a href={`/${language}/hotels`}>{seoCopy.destinations}</a>
          <a href={`/${language}/flights`}>{seoCopy.routes}</a>
          <Link to={infoLink("/support")}>{labels.reservationSupport}</Link>
          <Link to={infoLink("/refund")}>{labels.cancellations}</Link>
        </div>

        <div className="footerColumn">
          <h3>VoyHaven</h3>
          <Link to={infoLink("/about")}>{labels.about}</Link>
          <Link to={infoLink("/contact")}>{labels.contact}</Link>
          <Link to={infoLink("/support")}>{labels.support}</Link>
        </div>

        <div className="footerColumn">
          <h3>{labels.legal}</h3>
          <Link to={infoLink("/privacy")}>{labels.privacy}</Link>
          <Link to={infoLink("/terms")}>{labels.terms}</Link>
          <Link to={infoLink("/refund")}>{labels.refund}</Link>
        </div>
      </div>

      <div className="container footerPayments">
        <div className="footerPaymentSections">
          <section className="footerPaymentSection" aria-labelledby="footer-card-payments-title">
            <div className="footerPaymentsIntro">
              <strong id="footer-card-payments-title">{labels.payments}</strong>
              <span>{labels.wallets}</span>
            </div>
            <div className="footerPaymentCards" aria-label="VoyHaven accepted card and wallet payment methods">
              {cardPaymentMethods.map((method) => (
                <PaymentCard key={method.id} method={method} />
              ))}
            </div>
          </section>

          <section className="footerPaymentSection footerCryptoPayments" aria-labelledby="footer-crypto-payments-title">
            <div className="footerPaymentsIntro">
              <strong id="footer-crypto-payments-title">{labels.crypto}</strong>
              <span>BNB Chain & Ethereum</span>
            </div>
            <div className="footerPaymentCards footerCryptoPaymentCards" aria-label="VoyHaven accepted crypto payment methods">
              {cryptoPaymentMethods.map((method) => (
                <PaymentCard key={method.id} method={method} />
              ))}
            </div>
          </section>
        </div>

        <p className="footerPaymentNote">
          {labels.paymentNote}
        </p>
      </div>

      <div className="container footerBottom">
        <p>© {currentYear} {siteConfig.brandName}. {t("brand.allRightsReserved")}</p>
      </div>
    </footer>
  );
}

export default Footer;
