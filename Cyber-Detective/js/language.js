// Language handling (EN/AR, RTL) + UI strings. Database content is bilingual JSON ({en, ar}); use pick().
const STR = {
 en:{
  brand:"Cyber Detective", skip:"Skip to content",
  heroTitle:"Think Before You Click.",
  heroText:"Step into the detective's coat. Twenty realistic digital situations, one decision each, and a case file that explains what really happened.",
  ctaStart:"Start Your Investigation", ctaHow:"How It Works",
  missionTitle:"Your mission",
  missionText:"Scams rarely look like scams. They look like a message from your university, a call from your bank, a parcel notice. Cyber Detective drops you into these moments, asks what you would do, and shows the attack behind each choice.",
  casesTitle:"Four stages, twenty cases", casesText:"The cases get harder as you go. Every one teaches a different attack.",
  stage1:"Digital Awareness", stage2:"Smart Decisions", stage3:"Cyber Investigation", stage4:"Expert Detective",
  stage1l:"Phishing, texts, calls, attachments, fake updates", stage2l:"Passwords, MFA, stolen logins, social engineering, privacy",
  stage3l:"Wi-Fi, sniffing, interception, malware, USB bait", stage4l:"QR scams, spear phishing, ransomware, hijacked sessions, response",
  cases:"cases", caseWord:"Case",
  howTitle:"How it works",
  how1t:"Pick a nickname", how1:"No email, no password. Just a detective name.",
  how2t:"Investigate", how2:"Choose the best response in each situation.",
  how3t:"Learn", how3:"Every answer reveals the threat and why it works.",
  how4t:"Compare", how4:"See your rank among all detectives.",
  footer1:"Cyber Detective is a cybersecurity awareness project.", footer2:"Scenarios are fictional. Scores and rankings are verified on the server.",
  nickTitle:"Choose your detective name", nickText:"Other detectives will see this on the leaderboard. Don't use your real name.",
  nickLabel:"Nickname", nickHint:"3 to 20 characters.", nickBtn:"Join the agency",
  nickShort:"Your nickname needs at least 3 characters.", nickLong:"Your nickname can have at most 20 characters.",
  nickInvalid:"Please avoid special symbols like < or >.", nickTaken:"That nickname is already taken. Try another one.",
  nickAlready:"You already have a nickname on this device.", nickNet:"Couldn't reach the server. Check your connection and try again.",
  nickChecking:"Registering...",
  setupTitle:"Backend not configured yet",
  setupText:"Add your Supabase URL and publishable key in js/config.js (see README.md). Until then, nothing can be saved or ranked.",
  missionPageTitle:"Mission briefing", missionHi:"Welcome, Detective",
  mission1:"You will investigate twenty realistic digital situations: messages, calls, networks and devices.",
  mission2:"Every decision has consequences. After each answer you will see what the attacker was after.",
  mission3:"Your final score and time will be compared with other detectives around the world.",
  begin:"Open the first case",
  quizTitle:"Investigation", loading:"Loading the case files...", loadError:"We couldn't load the cases. Please refresh and try again.",
  questionOf:"Question {n} of {t}", stageWord:"Stage",
  submit:"Submit answer", next:"Next case", finish:"Close the case",
  goodTitle:"Good call, detective.", badTitle:"That choice puts you at risk.",
  threat:"Threat", whyBest:"Why this is the best move", whyRisky:"Why your choice is risky", bestIs:"The safest response is {l}.",
  tooFast:"That attempt was finished too quickly to be verified, so it wasn't ranked. Take your time and try again.",
  rateLimited:"Too many attempts in a short time. Please wait a little and try again.",
  genericError:"Something went wrong. Please try again.", retry:"Try again",
  resultsTitle:"Case report", stamp:"Mission completed", detective:"Detective", score:"Score", percent:"Percentage",
  correctCount:"Correct answers", time:"Time taken", best:"Personal best", rank:"Global rank", of:"of",
  newBest:"New personal best", msg90:"Outstanding. You think like an investigator and spot the tricks before they land.",
  msg70:"Sharp work. A few traps got through, so review the lessons you missed and go again.",
  msg50:"A promising start. Scams rely on rushing you, so slow down and verify through another channel.",
  msg0:"Every detective starts somewhere. Retake the investigation and watch for urgency, pressure and unexpected requests.",
  viewBoard:"View leaderboard", tryAgain:"Try again", noResult:"No recent report found. Start a new investigation to get one.",
  boardTitle:"Global leaderboard", boardText:"Best result per detective. Ties go to the faster time, then the earlier finish.",
  participants:"Detectives ranked", colRank:"Rank", colName:"Detective", colScore:"Score", colTime:"Time",
  you:"You", yourRank:"Your rank", boardEmpty:"No one is ranked yet. Finish an investigation to be the first.",
  noEntry:"Finish an investigation to appear on the board.", backHome:"Back to start"
 },
 ar:{
  brand:"المحقق الإلكتروني", skip:"تخطَّ إلى المحتوى",
  heroTitle:"فكّر قبل أن تنقر.",
  heroText:"ارتدِ معطف المحقق. عشرون موقفًا رقميًا واقعيًا، وقرار واحد في كل موقف، وملف قضية يشرح ما حدث فعلًا.",
  ctaStart:"ابدأ تحقيقك", ctaHow:"كيف تعمل اللعبة",
  missionTitle:"مهمتك",
  missionText:"نادرًا ما تبدو عمليات الاحتيال كذلك. تأتي كرسالة من جامعتك، أو مكالمة من مصرفك، أو إشعار طرد. يضعك المحقق الإلكتروني في هذه اللحظات، ويسألك عمّا ستفعله، ثم يكشف الهجوم الكامن وراء كل خيار.",
  casesTitle:"أربع مراحل، عشرون قضية", casesText:"تزداد القضايا صعوبة تدريجيًا، وكل قضية تعلّمك هجومًا مختلفًا.",
  stage1:"الوعي الرقمي", stage2:"قرارات ذكية", stage3:"التحقيق الإلكتروني", stage4:"المحقق الخبير",
  stage1l:"التصيّد، الرسائل، المكالمات، المرفقات، التحديثات المزيفة", stage2l:"كلمات المرور، المصادقة، سرقة الدخول، الهندسة الاجتماعية، الخصوصية",
  stage3l:"الواي فاي، التنصّت، الاعتراض، البرمجيات الخبيثة، طُعم USB", stage4l:"رموز QR، التصيّد الموجّه، الفدية، اختطاف الجلسات، الاستجابة",
  cases:"قضايا", caseWord:"القضية",
  howTitle:"كيف تعمل اللعبة",
  how1t:"اختر لقبًا", how1:"بلا بريد وبلا كلمة مرور. لقب محقق فقط.",
  how2t:"حقّق", how2:"اختر أفضل تصرف في كل موقف.",
  how3t:"تعلّم", how3:"كل إجابة تكشف التهديد وسبب نجاحه.",
  how4t:"قارن", how4:"اعرف ترتيبك بين كل المحققين.",
  footer1:"المحقق الإلكتروني مشروع للتوعية بالأمن السيبراني.", footer2:"السيناريوهات خيالية. النتائج والترتيب يتم التحقق منها على الخادم.",
  nickTitle:"اختر اسمك كمحقق", nickText:"سيراه المحققون الآخرون في لوحة الصدارة. لا تستخدم اسمك الحقيقي.",
  nickLabel:"اللقب", nickHint:"من 3 إلى 20 حرفًا.", nickBtn:"انضم إلى الوكالة",
  nickShort:"يجب أن يتكون اللقب من 3 أحرف على الأقل.", nickLong:"يجب ألا يزيد اللقب على 20 حرفًا.",
  nickInvalid:"يُرجى تجنب الرموز الخاصة مثل < أو >.", nickTaken:"هذا اللقب مستخدم بالفعل. جرّب لقبًا آخر.",
  nickAlready:"لديك لقب مسجّل على هذا الجهاز بالفعل.", nickNet:"تعذّر الوصول إلى الخادم. تحقق من الاتصال وحاول مجددًا.",
  nickChecking:"جارٍ التسجيل...",
  setupTitle:"الخلفية غير مُعدّة بعد",
  setupText:"أضف رابط Supabase والمفتاح العام في js/config.js (راجع README.md). إلى ذلك الحين لا يمكن حفظ النتائج أو ترتيبها.",
  missionPageTitle:"إحاطة المهمة", missionHi:"أهلًا أيها المحقق",
  mission1:"ستحقق في عشرين موقفًا رقميًا واقعيًا: رسائل ومكالمات وشبكات وأجهزة.",
  mission2:"لكل قرار عواقبه. بعد كل إجابة سترى ما كان يسعى إليه المهاجم.",
  mission3:"ستُقارن نتيجتك ووقتك النهائيان بمحققين آخرين حول العالم.",
  begin:"افتح القضية الأولى",
  quizTitle:"التحقيق", loading:"جارٍ تحميل ملفات القضايا...", loadError:"تعذّر تحميل القضايا. حدّث الصفحة وحاول مجددًا.",
  questionOf:"السؤال {n} من {t}", stageWord:"المرحلة",
  submit:"أرسل الإجابة", next:"القضية التالية", finish:"أغلق القضية",
  goodTitle:"قرار سليم أيها المحقق.", badTitle:"هذا الخيار يعرّضك للخطر.",
  threat:"التهديد", whyBest:"لماذا هذا أفضل تصرف", whyRisky:"لماذا خيارك محفوف بالمخاطر", bestIs:"الاستجابة الأأمن هي {l}.",
  tooFast:"أُنهيت هذه المحاولة بسرعة لا يمكن التحقق منها، فلم تُدرج في الترتيب. خذ وقتك وحاول مجددًا.",
  rateLimited:"محاولات كثيرة في وقت قصير. انتظر قليلًا ثم حاول مجددًا.",
  genericError:"حدث خطأ ما. حاول مجددًا.", retry:"حاول مجددًا",
  resultsTitle:"تقرير القضية", stamp:"اكتملت المهمة", detective:"المحقق", score:"النتيجة", percent:"النسبة المئوية",
  correctCount:"الإجابات الصحيحة", time:"الوقت المستغرق", best:"أفضل نتيجة لك", rank:"الترتيب العالمي", of:"من",
  newBest:"رقم قياسي شخصي جديد", msg90:"أداء ممتاز. تفكر كمحقق وتكشف الحيل قبل أن تنجح.",
  msg70:"عمل بارع. نجت بعض الفخاخ، فراجع الدروس التي فاتتك وأعد المحاولة.",
  msg50:"بداية واعدة. يعتمد المحتالون على استعجالك، فتمهّل وتحقق عبر قناة أخرى.",
  msg0:"كل محقق يبدأ من مكان ما. أعد التحقيق وانتبه للاستعجال والضغط والطلبات غير المتوقعة.",
  viewBoard:"عرض لوحة الصدارة", tryAgain:"حاول مجددًا", noResult:"لا يوجد تقرير حديث. ابدأ تحقيقًا جديدًا للحصول على واحد.",
  boardTitle:"لوحة الصدارة العالمية", boardText:"أفضل نتيجة لكل محقق. عند التعادل يفوز الأسرع، ثم الأسبق إنهاءً.",
  participants:"محققون مصنَّفون", colRank:"الترتيب", colName:"المحقق", colScore:"النتيجة", colTime:"الوقت",
  you:"أنت", yourRank:"ترتيبك", boardEmpty:"لا أحد مصنّف بعد. أنهِ تحقيقًا لتكون الأول.",
  noEntry:"أنهِ تحقيقًا لتظهر على اللوحة.", backHome:"العودة إلى البداية"
 }
};
const KEY = "cd-lang";
let lang = (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
try { const s = localStorage.getItem(KEY); if (s === "en" || s === "ar") lang = s; } catch {}
const listeners = [];
export const getLang = () => lang;
export const t = (k, vars = {}) => (STR[lang][k] ?? STR.en[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
export const pick = (obj) => (obj && (obj[lang] ?? obj.en)) || "";
export const onLangChange = (fn) => listeners.push(fn);
export const letter = (i) => (lang === "ar" ? ["أ", "ب", "ج", "د"] : ["A", "B", "C", "D"])[i];
export const num = (n) => new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(n);
export function formatTime(ms) {
  const s = Math.round(ms / 1000), m = Math.floor(s / 60), r = s % 60;
  return num(m) + ":" + (lang === "ar" ? num(r).padStart(2, "٠") : String(r).padStart(2, "0"));
}
export function applyI18n(root = document) {
  document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  root.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  const ti = document.querySelector("title[data-i18n]"); if (ti) ti.textContent = t(ti.dataset.i18n) + " | " + t("brand");
}
export function setLang(l) {
  lang = l; try { localStorage.setItem(KEY, l); } catch {}
  applyI18n(); listeners.forEach((fn) => fn(l));
}
export function initLanguage() {
  applyI18n();
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (b) setLang(b.dataset.lang); });
}
