function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/////////////////////////////////////////////////////////////////////////////////
// Determine dark or light theme
/////////////////////////////////////////////////////////////////////////////////
function detectColorScheme() {
  var theme = "";
  //local storage is used to override OS theme settings
  switch (getCookie("theme")) {
    case "dark":
      theme = "dark";
      break;
    case "light":
      break;
    case "Auto":
    case "":
      if (!window.matchMedia) {
        return false;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        theme = "dark";
      }
      break;
    default:
  }
  if (theme == "dark") {
    // Sets in <html> tag, activates CSS variables for dark color theme
    document.documentElement.setAttribute("color_theme", "dark");
  }
}
detectColorScheme();