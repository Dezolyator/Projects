/* ===== Примеры работ =====
   Пути к изображениям задаются в before / after.
   Если путь пустой, показывается заглушка. */
var WORKS = [
    {
        title: "Объединение кухни и комнаты",
        text: "Снесена перегородка, пространство стало единым",
        kind: "wall",
        before: "img/works/kitchen-living-before.webp",
        after: "img/works/kitchen-living-after.webp"
    },
    {
        title: "Перепланировка двухкомнатной",
        text: "Новая планировка под семью с ребёнком",
        kind: "plan",
        before: "img/works/two-room-layout-before.webp",
        after: "img/works/two-room-layout-after.webp"
    },
    {
        title: "Заливка пола в квартире",
        text: "Ровное основание под ламинат",
        kind: "floor",
        before: "img/works/apartment-screed-before.webp",
        after: "img/works/apartment-screed-after.webp"
    },
    {
        title: "Балкон с утеплением",
        text: "Утеплённый пол, заливка, готов к отделке",
        kind: "warm",
        before: "img/works/insulated-balcony-before.webp",
        after: "img/works/insulated-balcony-after.webp"
    },
    {
        title: "Балкон без утепления",
        text: "Заливка ровной стяжки",
        kind: "floor",
        before: "img/works/balcony-screed-before.webp",
        after: "img/works/balcony-screed-after.webp"
    },
    {
        title: "Укладка плитки в ванной",
        text: "Плитка на пол и стены, ровные швы",
        kind: "tile",
        before: "img/works/bathroom-tile-before.webp",
        after: "img/works/bathroom-tile-after.webp"
    }
];

function placeholder(kind, isAfter) {
    var bg = isAfter ? "#fde7b0" : "#d3d3cf";
    var ink = isAfter ? "#d97706" : "#8a8a86";
    var s = '<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Заглушка">';
    s += '<rect width="200" height="250" fill="' + bg + '"/>';
    s += '<rect y="170" width="200" height="80" fill="' + (isAfter ? "#f3cf7a" : "#bdbdb8") + '"/>';
    if (kind === "tile" || (isAfter && kind === "floor")) {
        for (var i = 0; i <= 200; i += 25) { s += '<path d="M' + i + ' 170V250" stroke="' + ink + '" stroke-opacity=".35"/>'; }
        for (var j = 170; j <= 250; j += 20) { s += '<path d="M0 ' + j + 'H200" stroke="' + ink + '" stroke-opacity=".35"/>'; }
    }
    if (!isAfter) {
        s += '<path d="M20 190l30 14-12 22 40-10 18 20" stroke="' + ink + '" stroke-width="2" fill="none" opacity=".6"/>';
    }
    if (kind === "wall") {
        if (!isAfter) { s += '<rect x="90" y="20" width="20" height="150" fill="' + ink + '" opacity=".7"/>'; }
        else { s += '<rect x="30" y="50" width="140" height="60" rx="4" fill="#fff" opacity=".55"/>'; }
    } else if (kind === "plan") {
        s += '<path d="M20 30H180V170H20Z M100 30V170 M20 100H100" fill="none" stroke="' + ink + '" stroke-width="' + (isAfter ? 3 : 5) + '" opacity=".8"/>';
        if (isAfter) { s += '<path d="M100 100H180" stroke="' + ink + '" stroke-width="3" opacity=".8"/>'; }
    } else if (kind === "warm") {
        s += '<rect x="25" y="30" width="150" height="110" rx="4" fill="#fff" opacity=".5"/><path d="M100 30V140M25 85H175" stroke="' + ink + '" stroke-width="3" opacity=".7"/>';
        if (isAfter) { s += '<path d="M30 160h140" stroke="#fff" stroke-width="4" stroke-dasharray="10 6" opacity=".8"/>'; }
    } else if (kind === "tile") {
        s += '<rect x="55" y="30" width="90" height="130" rx="3" fill="#fff" opacity=".5"/>';
    } else {
        s += '<rect x="40" y="40" width="120" height="100" rx="4" fill="#fff" opacity=".45"/>';
    }
    s += '</svg>';
    return s;
}

function shot(label, src, work, isAfter) {
    var alt = work.title + (isAfter ? " — после ремонта" : " — до ремонта");
    var inner = src
        ? '<img src="' + src + '" alt="' + alt + '" width="640" height="800" loading="lazy">'
        : placeholder(work.kind, isAfter);
    return '<div class="shot' + (isAfter ? ' after' : '') + '">' + inner + '<em>' + label + '</em></div>';
}

document.getElementById("worksGrid").innerHTML = WORKS.map(function (w) {
    return '<article class="work"><div class="pair">'
        + shot("До", w.before, w, false)
        + shot("После", w.after, w, true)
        + '</div><div class="info"><h3>' + w.title + '</h3><p>' + w.text + '</p></div></article>';
}).join("");

/* ===== Тема ===== */
(function () {
    var root = document.documentElement, btn = document.getElementById("theme");
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) { }
    var dark = saved ? saved === "dark" : window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    function apply() { root.setAttribute("data-theme", dark ? "dark" : "light"); btn.textContent = dark ? "☀" : "☾"; }
    apply();
    btn.addEventListener("click", function () {
        dark = !dark; apply();
        try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) { }
    });
})();
