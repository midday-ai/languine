export default {
  hello: "Bonjour",
  welcome: "Bonjour {name} !",
  about: {
    you: "Bonjour {name} ! Vous avez {age} ans",
  },
  scope: {
    test: "Une portée",
    more: {
      test: "Une portée",
      param: "Une portée avec {param}",
      and: {
        more: {
          test: "Une portée",
        },
      },
      "stars#one": "1 étoile sur GitHub",
      "stars#other": "{count} étoiles sur GitHub",
    },
  },
  missing: {
    translation: {
      in: {
        fr: "Cela devrait fonctionner",
      },
    },
  },
  "cows#one": "Une vache",
  "cows#other": "{count} vaches",
  languine: {
    hello: "Bonjour Languine",
  },
  "hello.world": "test",
} as const;
