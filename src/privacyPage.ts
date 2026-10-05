import {
  detectSiteLocale,
  HTML_LANG,
  type Locale,
  subscribeSiteLocale
} from './i18n'
import {
  API_TERMS_HREF,
  CONTACT_MAIL,
  ISSUES_HREF,
  MS_PRIVACY_HREF,
  SITE_HREF
} from './privacyCopy'
import { privacyCopy } from './privacyI18n'
import { loadSiteChrome } from './siteChrome'

const article = document.querySelector<HTMLElement>('#privacy-article')!

function render(locale: Locale): void {
  const copy = privacyCopy(locale)
  document.title = copy.documentTitle
  document.documentElement.lang = HTML_LANG[locale]

  article.innerHTML = `
      <a class="back-link" href="./">${copy.back}</a>
      <h1>${copy.title}</h1>
      <p class="meta">${copy.meta}</p>
      <p>${copy.introHtml}</p>
      <h2>${copy.accessTitle}</h2>
      <p>${copy.accessLead}</p>
      <ul>
        <li>${copy.accessFiles}</li>
        <li>${copy.accessUser}</li>
      </ul>
      <h2>${copy.useTitle}</h2>
      <ul>
        <li>${copy.useDownload}</li>
        <li>${copy.useAccount}</li>
      </ul>
      <p>${copy.useOnly}</p>
      <h2>${copy.storageTitle}</h2>
      <ul>
        <li>${copy.storageFile}</li>
        <li>${copy.storageHandler}</li>
        <li>${copy.storageTokens}</li>
        <li>${copy.storageTransfer}</li>
      </ul>
      <h2>${copy.apiTitle}</h2>
      <p>
        ${copy.apiBefore}
        <a href="${API_TERMS_HREF}">${copy.apiLink}</a>${copy.apiAfter}
      </p>
      <h2>${copy.choicesTitle}</h2>
      <ul>
        <li>${copy.choicesSignOut}</li>
        <li>
          ${copy.choicesRevokeBefore}
          <a href="${MS_PRIVACY_HREF}">${copy.choicesRevokeLink}</a>${copy.choicesRevokeAfter}
        </li>
      </ul>
      <h2>${copy.contactTitle}</h2>
      <p>
        ${copy.contactBefore}
        <a href="mailto:${CONTACT_MAIL}">${CONTACT_MAIL}</a>
        ·
        <a href="${SITE_HREF}">mlightcad.com</a>
        ·
        <a href="${ISSUES_HREF}">${copy.contactIssues}</a>
      </p>
  `
}

async function boot(): Promise<void> {
  await loadSiteChrome()
  let locale = detectSiteLocale()
  render(locale)
  subscribeSiteLocale(next => {
    if (next === locale) return
    locale = next
    render(locale)
  })
}

void boot()
