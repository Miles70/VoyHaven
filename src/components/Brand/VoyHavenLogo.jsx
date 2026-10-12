import "./VoyHavenLogo.css";

function VoyHavenLogo({ className = "", alt = "VoyHaven" }) {
  return (
    <img
      className={`voyhavenLogoImage ${className}`.trim()}
      src="/brand/voyhaven-horizontal-v3.png"
      width="1032"
      height="222"
      alt={alt}
      decoding="async"
    />
  );
}

export default VoyHavenLogo;
