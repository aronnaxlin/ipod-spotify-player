import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "apps.ipod.menuItems.ipod": "iPod",
          "apps.ipod.menuItems.music": "Music",
          "apps.ipod.menuItems.settings": "Settings",
          "apps.ipod.menuItems.nowPlaying": "Now Playing",
          "apps.ipod.menuItems.allSongs": "All Songs",
          "apps.ipod.menu.unknownArtist": "Unknown Artist",
          "apps.ipod.status.added": "Added",
          "apps.ipod.menuItems.shuffleSongs": "Shuffle Songs",
          "apps.ipod.menuItems.backlight": "Backlight",
          "apps.ipod.menuItems.extras": "Extras",
          "apps.ipod.menuItems.repeat": "Repeat",
          "apps.ipod.menuItems.shuffle": "Shuffle",
          "apps.ipod.menuItems.theme": "Theme",
          "apps.ipod.menu.classic": "Classic",
          "apps.ipod.menu.black": "Black",
          "apps.ipod.menu.u2": "U2",
          "apps.ipod.status.shuffleOn": "Shuffle On",
          "apps.ipod.status.shuffleOff": "Shuffle Off",
          "apps.ipod.status.repeatOff": "Repeat Off",
          "apps.ipod.status.repeatOne": "Repeat One",
          "apps.ipod.status.repeatAll": "Repeat All",
          "apps.ipod.status.lightOn": "Light On",
          "apps.ipod.status.lightOff": "Light Off",
          "apps.ipod.status.themeClassic": "Classic Theme",
          "apps.ipod.status.themeBlack": "Black Theme",
          "apps.ipod.status.themeU2": "U2 Theme",
        }
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
