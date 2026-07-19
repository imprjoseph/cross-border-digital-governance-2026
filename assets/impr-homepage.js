/* =========================================================
   imPR Conference Website Frontend UX Upgrade v3
   1. Banner 不被資訊列覆蓋
   2. 浮動報名鈕
   3. 地圖/交通資訊收合
   4. 友善錯誤訊息
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initHeroBannerLoading();
    preventHeroInfoOverlap();
    ensureFloatingRegisterButton();
    collapseLongMapInfo();
    softenFrontendErrorMessage();
    enhanceHomepageLabels();
});

/**
 * 01. Banner 圖片載入處理
 */
function initHeroBannerLoading() {
    const heroBanner = document.querySelector(".hero-banner");
    if (!heroBanner) return;

    const img = heroBanner.querySelector("img");

    if (!img) {
        heroBanner.classList.add("has-image-loaded");
        return;
    }

    const shouldShowFullBanner = window.matchMedia("(max-width: 768px)").matches;
    img.style.objectFit = shouldShowFullBanner ? "contain" : "cover";
    img.style.objectPosition = shouldShowFullBanner ? "center center" : "top center";
    img.style.height = shouldShowFullBanner ? "auto" : "100%";
    img.style.maxHeight = "none";

    function markLoaded() {
        heroBanner.classList.add("has-image-loaded");
    }

    if (img.complete && img.naturalWidth > 0) {
        markLoaded();
        return;
    }

    img.addEventListener("load", markLoaded);

    img.addEventListener("error", function () {
        heroBanner.classList.add("has-image-loaded");
        heroBanner.classList.add("image-load-error");
    });
}

/**
 * 02. 強制 Hero 資訊列不要往上壓 Banner
 */
function preventHeroInfoOverlap() {
    const heroBody = document.querySelector(".hero-body");
    const heroBodyWrap = document.querySelector(".hero-body-wrap");
    const heroBanner = document.querySelector(".hero-banner");

    if (heroBanner) {
        heroBanner.style.marginBottom = "0";
        heroBanner.style.zIndex = "1";
    }

    if (heroBodyWrap) {
        heroBodyWrap.style.marginTop = "0";
        heroBodyWrap.style.paddingTop = "18px";
        heroBodyWrap.style.zIndex = "0";
    }

    if (heroBody) {
        heroBody.style.transform = "none";
        heroBody.style.marginTop = "0";
    }
}

/**
 * 03. 恢復浮動立即報名按鈕
 */
function ensureFloatingRegisterButton() {
    const nativeFloating = document.querySelector(".floating-register");
    const generatedFloating = document.querySelector(".impr-floating-register");
    const activeLang =
        document.querySelector(".lang-btn.active")?.dataset.lang ||
        localStorage.getItem("conference-lang") ||
        (typeof currentLang !== "undefined" ? currentLang : "zh");
    const label = activeLang === "zh" ? "立即報名" : "Register Now";

    if (nativeFloating) {
        if (generatedFloating) generatedFloating.remove();
        const nativeLabel = nativeFloating.querySelector("#floating-btn-label, .floating-btn-label");
        if (nativeLabel) nativeLabel.textContent = label;
        return;
    }

    const existing = document.querySelector(".floating-register-btn, .impr-floating-register");
    if (existing) {
        existing.style.display = "inline-flex";
        const span = existing.querySelector("span");
        if (span) span.textContent = label;
        return;
    }

    const registrationTarget =
        document.querySelector("#registration") ||
        document.querySelector("[id*='register']") ||
        document.querySelector("[id*='報名']");

    if (!registrationTarget || !registrationTarget.id) return;

    const btn = document.createElement("a");
    btn.className = "impr-floating-register";
    btn.href = "#" + registrationTarget.id;
    btn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i><span>${label}</span>`;

    document.body.appendChild(btn);
}

/**
 * 04. 地圖 / 交通資訊過長時收合
 */
function collapseLongMapInfo() {
    const trafficSections = Array.from(document.querySelectorAll("section, div"))
        .filter(function (el) {
            const id = (el.id || "").toLowerCase();
            const cls = (el.className || "").toString().toLowerCase();
            const text = (el.textContent || "").trim();

            const isTrafficArea =
                id.includes("traffic") ||
                id.includes("transport") ||
                id.includes("venue") ||
                id.includes("location") ||
                text.includes("交通資訊") ||
                text.includes("高捷") ||
                text.includes("捷運") ||
                text.includes("高鐵") ||
                text.includes("停車");

            return isTrafficArea && text.length > 80;
        });

    const candidates = [];

    trafficSections.forEach(function (section) {
        const ps = Array.from(section.querySelectorAll("p, li, .traffic-info, .transport-info, .venue-info, .location-info"));
        ps.forEach(function (p) {
            const text = (p.textContent || "").trim();
            if (text.length >= 55 && !p.classList.contains("impr-collapsed-map-text")) {
                candidates.push(p);
            }
        });
    });

    candidates.slice(0, 12).forEach(function (el) {
        el.classList.add("impr-collapsed-map-text");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "impr-map-toggle";
        toggle.textContent = "展開交通資訊";

        toggle.addEventListener("click", function () {
            const expanded = el.classList.toggle("is-expanded");
            toggle.textContent = expanded ? "收合交通資訊" : "展開交通資訊";
        });

        el.insertAdjacentElement("afterend", toggle);
    });
}

/**
 * 05. 前台錯誤訊息友善化
 */
function softenFrontendErrorMessage() {
    const possibleErrorBlocks = Array.from(document.querySelectorAll("section, div, article"))
        .filter(function (el) {
            const text = (el.textContent || "").trim();
            return text.includes("無法連線至伺服器") ||
                   text.includes("GAS 沒有重新部署") ||
                   text.includes("目前 API URL");
        });

    if (!possibleErrorBlocks.length) return;

    possibleErrorBlocks.forEach(function (block) {
        if (document.body.classList.contains("dev-mode")) return;

        block.innerHTML = `
            <div class="frontend-friendly-error">
                <div class="frontend-friendly-error-icon">ℹ</div>
                <div>
                    <h3>資料載入時間較長</h3>
                    <p>目前活動資料與圖片仍在載入中，請稍候片刻。若畫面長時間未更新，請重新整理頁面。</p>
                    <button type="button" class="btn btn-primary" onclick="window.location.reload()">重新整理</button>
                </div>
            </div>
        `;

        block.style.display = "none";

        window.setTimeout(function () {
            block.style.display = "block";
        }, 8000);
    });
}

/**
 * 06. 區塊標題微調
 */
function enhanceHomepageLabels() {
    const sectionMap = [
        { keyword: "最新消息", eyebrow: "NEWS", desc: "掌握活動最新公告與重要提醒" },
        { keyword: "會議介紹", eyebrow: "ABOUT", desc: "了解本次活動目標、議題方向與參與價值" },
        { keyword: "講師介紹", eyebrow: "SPEAKERS", desc: "邀集專業講者分享產業觀點與實務經驗" },
        { keyword: "會議議程", eyebrow: "AGENDA", desc: "查看完整時程安排與各場次重點" },
        { keyword: "線上報名", eyebrow: "REGISTRATION", desc: "填寫報名資料，完成活動參與登記" },
        { keyword: "交通資訊", eyebrow: "VENUE", desc: "活動地點、交通方式與現場資訊" },
        { keyword: "下載專區", eyebrow: "DOWNLOAD", desc: "下載會議簡章、講義與相關文件" },
        { keyword: "常見問題", eyebrow: "FAQ", desc: "快速查詢活動報名與參與相關問題" }
    ];

    sectionMap.forEach(function (item) {
        const h2List = Array.from(document.querySelectorAll(".section-title h2, section h2"));

        h2List.forEach(function (h2) {
            if (!h2.textContent.trim().includes(item.keyword)) return;

            const titleWrap = h2.closest(".section-title");
            if (!titleWrap) return;

            if (!titleWrap.querySelector(".section-eyebrow")) {
                const eyebrow = document.createElement("div");
                eyebrow.className = "section-eyebrow";
                eyebrow.textContent = item.eyebrow;
                titleWrap.insertBefore(eyebrow, h2);
            }

            const p = titleWrap.querySelector("p");
            if (p && (!p.textContent || p.textContent.trim().length < 18)) {
                p.textContent = item.desc;
            }
        });
    });
}
