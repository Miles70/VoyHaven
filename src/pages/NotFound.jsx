import { useFlowText } from '../i18n/flowTranslations';
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "./InformationPage.css";

function NotFound() {
  const ui = useFlowText();

  const { language } = useLanguage();
  const isTurkish = language === "tr";

  return (
    <main className="informationPage container">
      <p className="informationEyebrow">404</p>
      <h1>{ui(isTurkish ? "Bu rota kaybolmuş." : "This route got lost.")}</h1>
      <p>{ui(isTurkish ? "Aradığın sayfa taşınmış veya hiç var olmamış olabilir." : "The page may have moved or may never have existed.")}</p>
      <Link to="/" className="informationBack">← {ui(isTurkish ? "Ana sayfaya dön" : "Back to home")}</Link>
    </main>
  );
}

export default NotFound;
