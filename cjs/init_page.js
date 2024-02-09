let nC = (m, s) => m.charAt(m.indexOf(s) + s.length);
let th = nC(document.cookie, "eme=");
th = th == "A" ? window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches ? 1 : 0 : 0 : th == "d" ? 1 : 0;
if (th) { document.documentElement.setAttribute("color_theme", "dark"); }