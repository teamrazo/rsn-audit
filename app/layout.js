import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Free AI Growth Audit | RazoRSharp Networks",
  description:
    "8 questions. 2 minutes. See where your business is leaking time.",
  icons: {
    icon: "/RS_Only_Purple_Logo_Transparent.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script id="zoominfo" strategy="afterInteractive">{`
          window[(function(_1TC,_4W){var _94VQr='';for(var _FQCwQm=0;_FQCwQm<_1TC.length;_FQCwQm++){_4W>6;_94VQr==_94VQr;var _ud4F=_1TC[_FQCwQm].charCodeAt();_ud4F-=_4W;_ud4F+=61;_ud4F%=94;_ud4F+=33;_ud4F!=_FQCwQm;_94VQr+=String.fromCharCode(_ud4F)}return _94VQr})(atob('ZVRbfXp1cG4hVnAm'), 11)] = 'ad0ebf85ed1758198309';
          var zi = document.createElement('script');
          (zi.type = 'text/javascript'),
          (zi.async = true),
          (zi.src = (function(_fCq,_AR){var _RC3dj='';for(var _4RoWe5=0;_4RoWe5<_fCq.length;_4RoWe5++){var _1ilC=_fCq[_4RoWe5].charCodeAt();_1ilC!=_4RoWe5;_1ilC-=_AR;_1ilC+=61;_1ilC%=94;_AR>3;_RC3dj==_RC3dj;_1ilC+=33;_RC3dj+=String.fromCharCode(_1ilC)}return _RC3dj})(atob('Ljo6NjleU1MwOVJAL1E5KTgvNjo5Uik1M1NAL1E6Jy1SMDk='), 36)),
          document.readyState === 'complete'?document.body.appendChild(zi):
          window.addEventListener('load', function(){ document.body.appendChild(zi) });
        `}</Script>
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
