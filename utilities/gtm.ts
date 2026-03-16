export interface GtmHeadEntry {
  key: string
  innerHTML?: string
}

export interface GtmHeadConfig {
  script: GtmHeadEntry[]
  noscript: GtmHeadEntry[]
}

interface GetGtmHeadConfigParams {
  isWeb: boolean
  gtmId?: string | null
}

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/

/**
 * Builds the GTM head config for web clients when a valid container ID is present.
 */
export const getGtmHeadConfig = ({
  isWeb,
  gtmId,
}: GetGtmHeadConfigParams): GtmHeadConfig => {
  if (!gtmId || !GTM_ID_PATTERN.test(gtmId) || !isWeb) {
    return { script: [], noscript: [] }
  }

  return {
    script: [
      {
        key: 'gtm-script',
        innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
      },
    ],
    noscript: [
      {
        key: 'gtm-noscript',
        innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      },
    ],
  }
}
