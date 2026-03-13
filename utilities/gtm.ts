export interface GtmHeadEntry {
  key: string
  children?: string
  innerHTML?: string
}

export interface GtmHeadConfig {
  script: GtmHeadEntry[]
  noscript: GtmHeadEntry[]
}

interface BuildGtmHeadConfigParams {
  platform: string
  gtmId?: string | null
}

export const getGtmHeadConfig = ({
  platform,
  gtmId,
}: BuildGtmHeadConfigParams): GtmHeadConfig => {
  if (!gtmId || platform !== "web") {
    return { script: [], noscript: [] }
  }

  return {
    script: [
      {
        key: "gtm-script",
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
      },
    ],
    noscript: [
      {
        key: "gtm-noscript",
        innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      },
    ],
  }
}

