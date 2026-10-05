import type { Locale } from './i18n'
import type { PrivacyCopy } from './privacyCopy'

const en: PrivacyCopy = {
  documentTitle: 'Privacy Policy — OneDrive CAD Viewer',
  back: '← Back to OneDrive CAD Viewer',
  title: 'Privacy Policy',
  meta: 'Last updated: August 17, 2026 · Product: OneDrive CAD Viewer (MLightCAD)',
  introHtml:
    'This Privacy Policy describes how <strong>OneDrive CAD Viewer</strong> (“the App”) accesses, uses, and handles Microsoft user data when you connect your Microsoft account. The App is provided by MLightCAD and is intended for viewing CAD drawings (DWG/DXF) from OneDrive in your browser.',
  accessTitle: 'Microsoft user data we access',
  accessLead: 'With your consent, the App requests these Microsoft Graph / OneDrive permissions:',
  accessFiles:
    '<code>Files.Read</code> (and related OneDrive / SharePoint read scopes used by the File Picker) — access files you select with this App, not bulk export of your entire OneDrive.',
  accessUser:
    '<code>User.Read</code> — to show your account name, email, and profile picture in the App UI.',
  useTitle: 'How we use Microsoft user data',
  useDownload:
    'Download the CAD file you select so it can be displayed in the in-browser viewer (MLightCAD embed).',
  useAccount: 'Show which Microsoft account is signed in.',
  useOnly:
    'We use Microsoft user data only to provide these user-facing features. We do not sell Microsoft user data, use it for advertising, or use it to determine creditworthiness.',
  storageTitle: 'Storage, sharing, and transfer',
  storageFile:
    'File content is downloaded in your browser using your Microsoft access token and passed to the viewer embed via <code>postMessage</code>. The App does not upload your OneDrive files to our servers for storage.',
  storageHandler:
    'When OneDrive or SharePoint opens a drawing with the File Handler preview, it POSTs a Microsoft Graph link for that file. A small edge script accepts that POST and passes the link into your browser (session storage or the page URL fragment). It is not stored on a server.',
  storageTokens:
    'Access tokens are kept in the browser session for Microsoft Graph / OneDrive API calls; signing out clears the session when possible.',
  storageTransfer:
    'We do not transfer Microsoft user data to third parties except as needed to operate the viewer experience in your browser, or when required by law or for security investigations.',
  apiTitle: 'API terms',
  apiBefore: 'The App’s use of information received from Microsoft APIs adheres to the',
  apiLink: 'Microsoft APIs Terms of Use',
  apiAfter: '.',
  choicesTitle: 'Your choices',
  choicesSignOut: 'You can disconnect the App at any time using Sign Out in the App.',
  choicesRevokeBefore: 'You can also revoke access in your',
  choicesRevokeLink: 'Microsoft account permissions',
  choicesRevokeAfter: '.',
  contactTitle: 'Contact',
  contactBefore: 'Questions about this policy or the App:',
  contactIssues: 'GitHub issues'
}

const zh: PrivacyCopy = {
  documentTitle: '隐私政策 — OneDrive CAD 查看器',
  back: '← 返回 OneDrive CAD 查看器',
  title: '隐私政策',
  meta: '最近更新：2026 年 8 月 17 日 · 产品：OneDrive CAD 查看器（MLightCAD）',
  introHtml:
    '本隐私政策说明当你连接 Microsoft 帐户时，<strong>OneDrive CAD 查看器</strong>（“本应用”）如何访问、使用和处理 Microsoft 用户数据。本应用由 MLightCAD 提供，用于在浏览器中查看 OneDrive 上的 CAD 图纸（DWG/DXF）。',
  accessTitle: '我们访问的 Microsoft 用户数据',
  accessLead: '经你同意后，本应用会请求以下 Microsoft Graph / OneDrive 权限：',
  accessFiles:
    '<code>Files.Read</code>（以及文件选择器使用的相关 OneDrive / SharePoint 读取范围）— 仅访问你通过本应用选择的文件，不会批量导出整个 OneDrive。',
  accessUser: '<code>User.Read</code> — 用于在应用界面中显示你的帐户名称、电子邮件和头像。',
  useTitle: '我们如何使用 Microsoft 用户数据',
  useDownload: '下载你选择的 CAD 文件，以便在浏览器内查看器（MLightCAD 嵌入）中显示。',
  useAccount: '显示当前登录的 Microsoft 帐户。',
  useOnly:
    '我们仅将这些 Microsoft 用户数据用于上述面向用户的功能。我们不会出售这些数据，不会将其用于广告，也不会用于评估信用状况。',
  storageTitle: '存储、共享与传输',
  storageFile:
    '文件内容在你的浏览器中使用 Microsoft 访问令牌下载，并通过 <code>postMessage</code> 传给查看器嵌入页。本应用不会把你的 OneDrive 文件上传到我们的服务器存储。',
  storageHandler:
    '当 OneDrive 或 SharePoint 通过 File Handler 预览打开图纸时，会 POST 该文件的 Microsoft Graph 链接。一个小型边缘脚本接收该 POST，再把链接交给你的浏览器（会话存储或页面 URL 片段）。不会在服务器上保存。',
  storageTokens:
    '访问令牌保存在浏览器会话中，用于 Microsoft Graph / OneDrive API 调用；退出登录时会尽可能清除会话。',
  storageTransfer:
    '除了在你的浏览器中提供查看体验所必需的情况，或法律要求、安全调查所需外，我们不会将 Microsoft 用户数据传输给第三方。',
  apiTitle: 'API 条款',
  apiBefore: '本应用对从 Microsoft API 获得的信息的使用遵守',
  apiLink: 'Microsoft APIs 使用条款',
  apiAfter: '。',
  choicesTitle: '你的选择',
  choicesSignOut: '你可以随时在应用中使用“退出”断开本应用。',
  choicesRevokeBefore: '你也可以在',
  choicesRevokeLink: 'Microsoft 帐户权限',
  choicesRevokeAfter: '。',
  contactTitle: '联系我们',
  contactBefore: '关于本政策或本应用的问题：',
  contactIssues: 'GitHub 议题'
}

const ja: PrivacyCopy = {
  documentTitle: 'プライバシーポリシー — OneDrive CAD ビューア',
  back: '← OneDrive CAD ビューアに戻る',
  title: 'プライバシーポリシー',
  meta: '最終更新: 2026年8月17日 · 製品: OneDrive CAD ビューア（MLightCAD）',
  introHtml:
    '本プライバシーポリシーは、Microsoft アカウントを接続したときに <strong>OneDrive CAD ビューア</strong>（「本アプリ」）が Microsoft ユーザーデータをどのようにアクセス・利用・取り扱うかを説明します。本アプリは MLightCAD が提供し、ブラウザで OneDrive 上の CAD 図面（DWG/DXF）を表示するためのものです。',
  accessTitle: 'アクセスする Microsoft ユーザーデータ',
  accessLead: '同意のうえ、本アプリは次の Microsoft Graph / OneDrive のアクセス許可を要求します。',
  accessFiles:
    '<code>Files.Read</code>（およびファイルピッカーが使う関連の OneDrive / SharePoint 読み取りスコープ）— 本アプリで選択したファイルにアクセスします。OneDrive 全体の一括エクスポートは行いません。',
  accessUser:
    '<code>User.Read</code> — アプリ UI にアカウント名、メール、プロフィール画像を表示するため。',
  useTitle: 'Microsoft ユーザーデータの利用目的',
  useDownload: '選択した CAD ファイルをダウンロードし、ブラウザ内ビューア（MLightCAD 埋め込み）で表示します。',
  useAccount: 'サインイン中の Microsoft アカウントを表示します。',
  useOnly:
    'Microsoft ユーザーデータは、これらのユーザー向け機能の提供にのみ使用します。販売、広告、信用判断には使用しません。',
  storageTitle: '保存、共有、転送',
  storageFile:
    'ファイル内容は Microsoft のアクセストークンを使い、ブラウザ内でダウンロードされ、<code>postMessage</code> でビューア埋め込みに渡されます。本アプリは OneDrive ファイルを当社サーバーに保存するためにアップロードしません。',
  storageHandler:
    'OneDrive または SharePoint が File Handler プレビューで図面を開くと、そのファイルの Microsoft Graph リンクが POST されます。小さなエッジスクリプトがその POST を受け取り、リンクをブラウザ（セッションストレージまたは URL フラグメント）に渡します。サーバーには保存されません。',
  storageTokens:
    'アクセストークンは Microsoft Graph / OneDrive API 呼び出しのためブラウザセッションに保持され、サインアウト時に可能な範囲でセッションを消去します。',
  storageTransfer:
    'ブラウザ内でビューア体験を提供するために必要な場合、または法令やセキュリティ調査で求められる場合を除き、Microsoft ユーザーデータを第三者に転送しません。',
  apiTitle: 'API の条件',
  apiBefore: 'Microsoft API から取得した情報の本アプリによる利用は、',
  apiLink: 'Microsoft APIs 利用規約',
  apiAfter: 'に従います。',
  choicesTitle: 'お客様の選択',
  choicesSignOut: 'アプリ内の「サインアウト」でいつでも本アプリを切断できます。',
  choicesRevokeBefore: '次のページでアクセスを取り消すこともできます：',
  choicesRevokeLink: 'Microsoft アカウントのアクセス許可',
  choicesRevokeAfter: '。',
  contactTitle: 'お問い合わせ',
  contactBefore: '本ポリシーまたは本アプリに関するご質問：',
  contactIssues: 'GitHub の Issue'
}

const ko: PrivacyCopy = {
  documentTitle: '개인정보 처리방침 — OneDrive CAD 뷰어',
  back: '← OneDrive CAD 뷰어로 돌아가기',
  title: '개인정보 처리방침',
  meta: '최종 업데이트: 2026년 8월 17일 · 제품: OneDrive CAD 뷰어(MLightCAD)',
  introHtml:
    '이 개인정보 처리방침은 Microsoft 계정을 연결할 때 <strong>OneDrive CAD 뷰어</strong>(“앱”)가 Microsoft 사용자 데이터에 어떻게 접근·이용·처리하는지를 설명합니다. 이 앱은 MLightCAD가 제공하며, 브라우저에서 OneDrive의 CAD 도면(DWG/DXF)을 보기 위한 것입니다.',
  accessTitle: '접근하는 Microsoft 사용자 데이터',
  accessLead: '동의 후 앱은 다음 Microsoft Graph / OneDrive 권한을 요청합니다.',
  accessFiles:
    '<code>Files.Read</code>(및 파일 선택기가 사용하는 관련 OneDrive / SharePoint 읽기 범위) — 이 앱에서 선택한 파일에만 접근하며 OneDrive 전체를 일괄 내보내기하지 않습니다.',
  accessUser: '<code>User.Read</code> — 앱 UI에 계정 이름, 이메일, 프로필 사진을 표시하기 위함입니다.',
  useTitle: 'Microsoft 사용자 데이터 이용 방법',
  useDownload: '선택한 CAD 파일을 다운로드하여 브라우저 뷰어(MLightCAD 임베드)에 표시합니다.',
  useAccount: '로그인한 Microsoft 계정을 표시합니다.',
  useOnly:
    'Microsoft 사용자 데이터는 이러한 사용자 대상 기능을 제공하는 데만 사용합니다. 판매, 광고, 신용 평가에는 사용하지 않습니다.',
  storageTitle: '저장, 공유 및 전송',
  storageFile:
    '파일 내용은 Microsoft 액세스 토큰으로 브라우저에서 다운로드되며 <code>postMessage</code>로 뷰어 임베드에 전달됩니다. 앱은 OneDrive 파일을 당사 서버에 저장하기 위해 업로드하지 않습니다.',
  storageHandler:
    'OneDrive 또는 SharePoint가 File Handler 미리 보기로 도면을 열면 해당 파일의 Microsoft Graph 링크가 POST됩니다. 작은 에지 스크립트가 그 POST를 받아 링크를 브라우저(세션 저장소 또는 URL 조각)로 넘깁니다. 서버에 저장되지 않습니다.',
  storageTokens:
    '액세스 토큰은 Microsoft Graph / OneDrive API 호출을 위해 브라우저 세션에 보관되며, 로그아웃 시 가능한 범위에서 세션을 지웁니다.',
  storageTransfer:
    '브라우저에서 뷰어 경험을 제공하기 위해 필요한 경우, 또는 법률이나 보안 조사에 필요한 경우를 제외하고 Microsoft 사용자 데이터를 제3자에게 전송하지 않습니다.',
  apiTitle: 'API 약관',
  apiBefore: '앱이 Microsoft API에서 받은 정보를 사용하는 방식은',
  apiLink: 'Microsoft APIs 사용 약관',
  apiAfter: '을 따릅니다.',
  choicesTitle: '선택 사항',
  choicesSignOut: '앱의 로그아웃으로 언제든지 앱 연결을 해제할 수 있습니다.',
  choicesRevokeBefore: '다음에서 액세스 권한을 취소할 수도 있습니다:',
  choicesRevokeLink: 'Microsoft 계정 권한',
  choicesRevokeAfter: '.',
  contactTitle: '문의',
  contactBefore: '이 정책 또는 앱에 대한 문의:',
  contactIssues: 'GitHub 이슈'
}

const es: PrivacyCopy = {
  documentTitle: 'Política de privacidad — Visor CAD de OneDrive',
  back: '← Volver al visor CAD de OneDrive',
  title: 'Política de privacidad',
  meta: 'Última actualización: 17 de agosto de 2026 · Producto: Visor CAD de OneDrive (MLightCAD)',
  introHtml:
    'Esta Política de privacidad describe cómo <strong>OneDrive CAD Viewer</strong> (“la App”) accede, usa y trata los datos de usuario de Microsoft cuando conectas tu cuenta de Microsoft. La App la proporciona MLightCAD y sirve para ver dibujos CAD (DWG/DXF) de OneDrive en el navegador.',
  accessTitle: 'Datos de usuario de Microsoft a los que accedemos',
  accessLead: 'Con tu consentimiento, la App solicita estos permisos de Microsoft Graph / OneDrive:',
  accessFiles:
    '<code>Files.Read</code> (y ámbitos de lectura de OneDrive / SharePoint relacionados que usa el selector de archivos): acceso a los archivos que eliges con esta App, no una exportación masiva de todo tu OneDrive.',
  accessUser:
    '<code>User.Read</code>: para mostrar el nombre de la cuenta, el correo y la foto de perfil en la interfaz.',
  useTitle: 'Cómo usamos los datos de usuario de Microsoft',
  useDownload:
    'Descargar el archivo CAD que eliges para mostrarlo en el visor del navegador (inserción de MLightCAD).',
  useAccount: 'Mostrar qué cuenta de Microsoft ha iniciado sesión.',
  useOnly:
    'Usamos los datos de usuario de Microsoft solo para estas funciones orientadas al usuario. No vendemos esos datos, no los usamos para publicidad ni para evaluar solvencia.',
  storageTitle: 'Almacenamiento, uso compartido y transferencia',
  storageFile:
    'El contenido del archivo se descarga en tu navegador con el token de acceso de Microsoft y se envía al visor insertado mediante <code>postMessage</code>. La App no sube tus archivos de OneDrive a nuestros servidores para almacenarlos.',
  storageHandler:
    'Cuando OneDrive o SharePoint abre un dibujo con la vista previa de File Handler, envía por POST un enlace de Microsoft Graph de ese archivo. Un script perimetral pequeño acepta ese POST y pasa el enlace a tu navegador (almacenamiento de sesión o fragmento de URL). No se guarda en un servidor.',
  storageTokens:
    'Los tokens de acceso se conservan en la sesión del navegador para llamadas a Microsoft Graph / OneDrive; al cerrar sesión se borra la sesión cuando es posible.',
  storageTransfer:
    'No transferimos datos de usuario de Microsoft a terceros salvo lo necesario para el visor en tu navegador, o cuando lo exija la ley o una investigación de seguridad.',
  apiTitle: 'Términos de las API',
  apiBefore: 'El uso que hace la App de la información recibida de las API de Microsoft cumple los',
  apiLink: 'Términos de uso de las API de Microsoft',
  apiAfter: '.',
  choicesTitle: 'Tus opciones',
  choicesSignOut: 'Puedes desconectar la App en cualquier momento con Cerrar sesión.',
  choicesRevokeBefore: 'También puedes revocar el acceso en',
  choicesRevokeLink: 'los permisos de tu cuenta Microsoft',
  choicesRevokeAfter: '.',
  contactTitle: 'Contacto',
  contactBefore: 'Preguntas sobre esta política o la App:',
  contactIssues: 'Incidencias de GitHub'
}

const pt: PrivacyCopy = {
  documentTitle: 'Política de privacidade — Visualizador CAD do OneDrive',
  back: '← Voltar ao visualizador CAD do OneDrive',
  title: 'Política de privacidade',
  meta: 'Última atualização: 17 de agosto de 2026 · Produto: Visualizador CAD do OneDrive (MLightCAD)',
  introHtml:
    'Esta Política de privacidade descreve como o <strong>OneDrive CAD Viewer</strong> (“o App”) acessa, usa e trata dados de usuário da Microsoft quando você conecta sua conta Microsoft. O App é fornecido pela MLightCAD e serve para ver desenhos CAD (DWG/DXF) do OneDrive no navegador.',
  accessTitle: 'Dados de usuário da Microsoft que acessamos',
  accessLead: 'Com o seu consentimento, o App solicita estas permissões do Microsoft Graph / OneDrive:',
  accessFiles:
    '<code>Files.Read</code> (e escopos de leitura relacionados do OneDrive / SharePoint usados pelo seletor de arquivos) — acesso aos arquivos que você escolhe neste App, sem exportação em massa de todo o OneDrive.',
  accessUser:
    '<code>User.Read</code> — para mostrar o nome da conta, o e-mail e a foto de perfil na interface.',
  useTitle: 'Como usamos os dados de usuário da Microsoft',
  useDownload:
    'Baixar o arquivo CAD que você escolhe para exibi-lo no visualizador do navegador (incorporação MLightCAD).',
  useAccount: 'Mostrar qual conta Microsoft está conectada.',
  useOnly:
    'Usamos dados de usuário da Microsoft apenas para esses recursos voltados ao usuário. Não vendemos esses dados, não os usamos para publicidade nem para avaliar crédito.',
  storageTitle: 'Armazenamento, compartilhamento e transferência',
  storageFile:
    'O conteúdo do arquivo é baixado no seu navegador com o token de acesso da Microsoft e enviado ao visualizador incorporado via <code>postMessage</code>. O App não envia seus arquivos do OneDrive aos nossos servidores para armazenamento.',
  storageHandler:
    'Quando o OneDrive ou o SharePoint abre um desenho com a pré-visualização do File Handler, ele envia por POST um link do Microsoft Graph desse arquivo. Um pequeno script de borda aceita esse POST e passa o link ao seu navegador (armazenamento de sessão ou fragmento da URL). Não é guardado em um servidor.',
  storageTokens:
    'Os tokens de acesso ficam na sessão do navegador para chamadas ao Microsoft Graph / OneDrive; ao sair, a sessão é limpa quando possível.',
  storageTransfer:
    'Não transferimos dados de usuário da Microsoft a terceiros, salvo o necessário para o visualizador no seu navegador, ou quando exigido por lei ou investigações de segurança.',
  apiTitle: 'Termos das APIs',
  apiBefore: 'O uso pelo App de informações recebidas das APIs da Microsoft segue os',
  apiLink: 'Termos de Uso das APIs da Microsoft',
  apiAfter: '.',
  choicesTitle: 'Suas escolhas',
  choicesSignOut: 'Você pode desconectar o App a qualquer momento com Sair.',
  choicesRevokeBefore: 'Você também pode revogar o acesso em',
  choicesRevokeLink: 'permissões da conta Microsoft',
  choicesRevokeAfter: '.',
  contactTitle: 'Contato',
  contactBefore: 'Dúvidas sobre esta política ou o App:',
  contactIssues: 'Issues no GitHub'
}

const ru: PrivacyCopy = {
  documentTitle: 'Политика конфиденциальности — просмотр CAD в OneDrive',
  back: '← Назад к просмотру CAD в OneDrive',
  title: 'Политика конфиденциальности',
  meta: 'Обновлено: 17 августа 2026 г. · Продукт: просмотр CAD в OneDrive (MLightCAD)',
  introHtml:
    'Эта Политика конфиденциальности описывает, как <strong>OneDrive CAD Viewer</strong> («Приложение») получает доступ к данным пользователя Microsoft, использует и обрабатывает их при подключении учётной записи Microsoft. Приложение предоставляется MLightCAD и предназначено для просмотра чертежей CAD (DWG/DXF) из OneDrive в браузере.',
  accessTitle: 'Какие данные пользователя Microsoft мы запрашиваем',
  accessLead: 'С вашего согласия Приложение запрашивает следующие разрешения Microsoft Graph / OneDrive:',
  accessFiles:
    '<code>Files.Read</code> (и связанные области чтения OneDrive / SharePoint, используемые выбором файлов) — доступ к файлам, которые вы выбираете в этом Приложении, без массового экспорта всего OneDrive.',
  accessUser:
    '<code>User.Read</code> — чтобы показать имя учётной записи, адрес электронной почты и фото профиля в интерфейсе.',
  useTitle: 'Как мы используем данные пользователя Microsoft',
  useDownload:
    'Скачиваем выбранный файл CAD, чтобы показать его во встроенном просмотрщике в браузере (встраивание MLightCAD).',
  useAccount: 'Показываем, какая учётная запись Microsoft выполнила вход.',
  useOnly:
    'Данные пользователя Microsoft используются только для этих пользовательских функций. Мы не продаём их, не используем для рекламы и не применяем для оценки кредитоспособности.',
  storageTitle: 'Хранение, передача и обмен',
  storageFile:
    'Содержимое файла скачивается в браузере с помощью маркера доступа Microsoft и передаётся во встроенный просмотрщик через <code>postMessage</code>. Приложение не загружает ваши файлы OneDrive на наши серверы для хранения.',
  storageHandler:
    'Когда OneDrive или SharePoint открывает чертёж в предпросмотре File Handler, он отправляет POST со ссылкой Microsoft Graph на этот файл. Небольшой пограничный скрипт принимает этот POST и передаёт ссылку в браузер (хранилище сеанса или фрагмент URL). На сервере она не сохраняется.',
  storageTokens:
    'Маркеры доступа хранятся в сеансе браузера для вызовов Microsoft Graph / OneDrive; при выходе сеанс по возможности очищается.',
  storageTransfer:
    'Мы не передаём данные пользователя Microsoft третьим лицам, кроме случаев, необходимых для работы просмотрщика в вашем браузере, либо по требованию закона или расследования инцидентов безопасности.',
  apiTitle: 'Условия API',
  apiBefore: 'Использование Приложением сведений, полученных из API Microsoft, соответствует',
  apiLink: 'Условиям использования API Microsoft',
  apiAfter: '.',
  choicesTitle: 'Ваш выбор',
  choicesSignOut: 'Вы можете отключить Приложение в любой момент через «Выйти».',
  choicesRevokeBefore: 'Вы также можете отозвать доступ в',
  choicesRevokeLink: 'разрешениях учётной записи Microsoft',
  choicesRevokeAfter: '.',
  contactTitle: 'Контакты',
  contactBefore: 'Вопросы об этой политике или Приложении:',
  contactIssues: 'задачи GitHub'
}

const cs: PrivacyCopy = {
  documentTitle: 'Zásady ochrany soukromí — OneDrive CAD prohlížeč',
  back: '← Zpět na OneDrive CAD prohlížeč',
  title: 'Zásady ochrany soukromí',
  meta: 'Naposledy aktualizováno: 17. srpna 2026 · Produkt: OneDrive CAD prohlížeč (MLightCAD)',
  introHtml:
    'Tyto zásady ochrany soukromí popisují, jak <strong>OneDrive CAD Viewer</strong> („Aplikace“) přistupuje k datům uživatele Microsoft, jak je používá a zpracovává, když připojíte účet Microsoft. Aplikaci poskytuje MLightCAD a slouží k zobrazení výkresů CAD (DWG/DXF) z OneDrive v prohlížeči.',
  accessTitle: 'K jakým datům uživatele Microsoft přistupujeme',
  accessLead: 'S vaším souhlasem Aplikace požaduje tato oprávnění Microsoft Graph / OneDrive:',
  accessFiles:
    '<code>Files.Read</code> (a související rozsahy čtení OneDrive / SharePoint používané výběrem souborů) — přístup k souborům, které v této Aplikaci vyberete, nikoli hromadný export celého OneDrive.',
  accessUser:
    '<code>User.Read</code> — pro zobrazení názvu účtu, e-mailu a profilového obrázku v rozhraní.',
  useTitle: 'Jak používáme data uživatele Microsoft',
  useDownload:
    'Stáhnout vybraný soubor CAD, aby se zobrazil ve vestavěném CAD prohlížeči (vložení MLightCAD).',
  useAccount: 'Zobrazit, který účet Microsoft je přihlášen.',
  useOnly:
    'Data uživatele Microsoft používáme pouze k těmto funkcím pro uživatele. Neprodáváme je, nepoužíváme je k reklamě ani k posuzování úvěruschopnosti.',
  storageTitle: 'Uložení, sdílení a přenos',
  storageFile:
    'Obsah souboru se stáhne ve vašem prohlížeči pomocí přístupového tokenu Microsoft a předá se vestavěnému prohlížeči přes <code>postMessage</code>. Aplikace nenahrává soubory OneDrive na naše servery k uložení.',
  storageHandler:
    'Když OneDrive nebo SharePoint otevře výkres v náhledu File Handler, odešle POST s odkazem Microsoft Graph na tento soubor. Malý okrajový skript POST přijme a předá odkaz do prohlížeče (úložiště relace nebo fragment URL). Na serveru se neukládá.',
  storageTokens:
    'Přístupové tokeny se uchovávají v relaci prohlížeče pro volání Microsoft Graph / OneDrive; odhlášení relaci podle možností vymaže.',
  storageTransfer:
    'Data uživatele Microsoft nepředáváme třetím stranám, kromě případů nutných pro prohlížeč ve vašem prohlížeči, nebo pokud to vyžaduje zákon či bezpečnostní šetření.',
  apiTitle: 'Podmínky API',
  apiBefore: 'Použití informací získaných z rozhraní API Microsoft v Aplikaci se řídí',
  apiLink: 'Podmínkami použití rozhraní API Microsoft',
  apiAfter: '.',
  choicesTitle: 'Vaše volby',
  choicesSignOut: 'Aplikaci můžete kdykoli odpojit pomocí Odhlásit se.',
  choicesRevokeBefore: 'Přístup můžete také odebrat v',
  choicesRevokeLink: 'oprávněních účtu Microsoft',
  choicesRevokeAfter: '.',
  contactTitle: 'Kontakt',
  contactBefore: 'Dotazy k těmto zásadám nebo k Aplikaci:',
  contactIssues: 'GitHub issues'
}

const dictionaries: Record<Locale, PrivacyCopy> = { en, zh, ja, ko, es, pt, ru, cs }

export function privacyCopy(locale: Locale): PrivacyCopy {
  return dictionaries[locale]
}
