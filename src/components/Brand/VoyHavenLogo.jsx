import { useId } from "react";
import "./VoyHavenLogo.css";

function VoyHavenLogo({ className = "", alt = "VoyHaven" }) {
  const id = useId();
  return (
    <svg className={`voyhavenLogoImage ${className}`.trim()} viewBox="0 0 1032 222" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`${id}-symbol`}><rect width="280" height="222" /></clipPath>
        <clipPath id={`${id}-name`}><rect x="280" width="752" height="222" /></clipPath>
        <filter id={`${id}-blue`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0.043137  0 0 0 0 0.247059  0 0 0 0 0.501961  0 0 0 1 0" />
        </filter>
      </defs>
      <image href="/brand/voyhaven-horizontal-v3.png" width="1032" height="222" clipPath={`url(#${id}-symbol)`} />
      <g clipPath={`url(#${id}-name)`}>
        <image href="/brand/voyhaven-horizontal-v3.png" width="1032" height="222" filter={`url(#${id}-blue)`} />
      </g>
    </svg>
  );
}

export default VoyHavenLogo;
