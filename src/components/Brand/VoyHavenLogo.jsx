import { useId } from "react";
import "./VoyHavenLogo.css";

function VoyHavenLogo({ className = "", alt = "VoyHaven" }) {
  const id = useId();
  return (
    <svg className={`voyhavenLogoImage ${className}`.trim()} viewBox="0 0 1032 222" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`${id}-name`}><rect x="280" width="752" height="222" /></clipPath>
        <filter id={`${id}-wordmark`} colorInterpolationFilters="sRGB">
          <feFlood floodColor="var(--voyhaven-wordmark, #0b3f80)" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <image href="/brand/voyhaven-angel-v-v4.png" x="0" y="0" width="270" height="222" preserveAspectRatio="xMidYMid meet" />
      <g className="voyhavenWordmark" clipPath={`url(#${id}-name)`}>
        <image href="/brand/voyhaven-horizontal-v3.png" width="1032" height="222" filter={`url(#${id}-wordmark)`} />
      </g>
    </svg>
  );
}

export default VoyHavenLogo;
