export default {
  hello: "Bonjour",
  welcome: "Bonjour {name} !",
  about: {
    you: "Bonjour {name} ! Vous avez {age} ans"
  },
  scope: {
    test: "Un domaine",
    more: {
      test: "Un domaine",
      param: "Un domaine avec {param}",
      and: {
        more: {
          test: "Un domaine"
        }
      },
      "stars#one": "1 étoile sur GitHub",
      "stars#other": "{count} étoiles sur GitHub"
    }
  },
  missing: {
    translation: {
      "in": {
        fr: "Ça devrait fonctionner"
      }
    }
  },
  "cows#one": "Une vache",
  "cows#other": "{count} vaches",
  languine: {
    hello: "Bonjour Languine"
  },
  test: {
    hello: "Bonjour"
  }
} as const;
