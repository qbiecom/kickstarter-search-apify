const categories = [
  {
    "id": 1,
    "slug": "art"
  },
  {
    "id": 287,
    "slug": "art/ceramics"
  },
  {
    "id": 20,
    "slug": "art/conceptual art"
  },
  {
    "id": 21,
    "slug": "art/digital art"
  },
  {
    "id": 22,
    "slug": "art/illustration"
  },
  {
    "id": 288,
    "slug": "art/installations"
  },
  {
    "id": 54,
    "slug": "art/mixed media"
  },
  {
    "id": 23,
    "slug": "art/painting"
  },
  {
    "id": 24,
    "slug": "art/performance art"
  },
  {
    "id": 53,
    "slug": "art/public art"
  },
  {
    "id": 25,
    "slug": "art/sculpture"
  },
  {
    "id": 289,
    "slug": "art/textiles"
  },
  {
    "id": 290,
    "slug": "art/video art"
  },
  {
    "id": 3,
    "slug": "comics"
  },
  {
    "id": 249,
    "slug": "comics/anthologies"
  },
  {
    "id": 250,
    "slug": "comics/comic books"
  },
  {
    "id": 251,
    "slug": "comics/events"
  },
  {
    "id": 252,
    "slug": "comics/graphic novels"
  },
  {
    "id": 253,
    "slug": "comics/webcomics"
  },
  {
    "id": 26,
    "slug": "crafts"
  },
  {
    "id": 343,
    "slug": "crafts/candles"
  },
  {
    "id": 344,
    "slug": "crafts/crochet"
  },
  {
    "id": 345,
    "slug": "crafts/diy"
  },
  {
    "id": 346,
    "slug": "crafts/embroidery"
  },
  {
    "id": 347,
    "slug": "crafts/glass"
  },
  {
    "id": 348,
    "slug": "crafts/knitting"
  },
  {
    "id": 350,
    "slug": "crafts/pottery"
  },
  {
    "id": 351,
    "slug": "crafts/printing"
  },
  {
    "id": 352,
    "slug": "crafts/quilts"
  },
  {
    "id": 353,
    "slug": "crafts/stationery"
  },
  {
    "id": 354,
    "slug": "crafts/taxidermy"
  },
  {
    "id": 355,
    "slug": "crafts/weaving"
  },
  {
    "id": 356,
    "slug": "crafts/woodworking"
  },
  {
    "id": 6,
    "slug": "dance"
  },
  {
    "id": 254,
    "slug": "dance/performances"
  },
  {
    "id": 255,
    "slug": "dance/residencies"
  },
  {
    "id": 256,
    "slug": "dance/spaces"
  },
  {
    "id": 257,
    "slug": "dance/workshops"
  },
  {
    "id": 7,
    "slug": "design"
  },
  {
    "id": 258,
    "slug": "design/architecture"
  },
  {
    "id": 259,
    "slug": "design/civic design"
  },
  {
    "id": 27,
    "slug": "design/graphic design"
  },
  {
    "id": 260,
    "slug": "design/interactive design"
  },
  {
    "id": 28,
    "slug": "design/product design"
  },
  {
    "id": 261,
    "slug": "design/typography"
  },
  {
    "id": 9,
    "slug": "fashion"
  },
  {
    "id": 262,
    "slug": "fashion/accessories"
  },
  {
    "id": 263,
    "slug": "fashion/apparel"
  },
  {
    "id": 264,
    "slug": "fashion/childrenswear"
  },
  {
    "id": 265,
    "slug": "fashion/couture"
  },
  {
    "id": 266,
    "slug": "fashion/footwear"
  },
  {
    "id": 267,
    "slug": "fashion/jewelry"
  },
  {
    "id": 268,
    "slug": "fashion/pet fashion"
  },
  {
    "id": 269,
    "slug": "fashion/ready-to-wear"
  },
  {
    "id": 11,
    "slug": "film & video"
  },
  {
    "id": 291,
    "slug": "film & video/action"
  },
  {
    "id": 29,
    "slug": "film & video/animation"
  },
  {
    "id": 292,
    "slug": "film & video/comedy"
  },
  {
    "id": 30,
    "slug": "film & video/documentary"
  },
  {
    "id": 293,
    "slug": "film & video/drama"
  },
  {
    "id": 294,
    "slug": "film & video/experimental"
  },
  {
    "id": 330,
    "slug": "film & video/family"
  },
  {
    "id": 296,
    "slug": "film & video/fantasy"
  },
  {
    "id": 295,
    "slug": "film & video/festivals"
  },
  {
    "id": 297,
    "slug": "film & video/horror"
  },
  {
    "id": 298,
    "slug": "film & video/movie theaters"
  },
  {
    "id": 299,
    "slug": "film & video/music videos"
  },
  {
    "id": 31,
    "slug": "film & video/narrative film"
  },
  {
    "id": 300,
    "slug": "film & video/romance"
  },
  {
    "id": 301,
    "slug": "film & video/science fiction"
  },
  {
    "id": 32,
    "slug": "film & video/shorts"
  },
  {
    "id": 303,
    "slug": "film & video/television"
  },
  {
    "id": 302,
    "slug": "film & video/thrillers"
  },
  {
    "id": 33,
    "slug": "film & video/webseries"
  },
  {
    "id": 10,
    "slug": "food"
  },
  {
    "id": 304,
    "slug": "food/bacon"
  },
  {
    "id": 305,
    "slug": "food/community gardens"
  },
  {
    "id": 306,
    "slug": "food/cookbooks"
  },
  {
    "id": 307,
    "slug": "food/drinks"
  },
  {
    "id": 308,
    "slug": "food/events"
  },
  {
    "id": 310,
    "slug": "food/farmer's markets"
  },
  {
    "id": 309,
    "slug": "food/farms"
  },
  {
    "id": 311,
    "slug": "food/food trucks"
  },
  {
    "id": 312,
    "slug": "food/restaurants"
  },
  {
    "id": 313,
    "slug": "food/small batch"
  },
  {
    "id": 314,
    "slug": "food/spaces"
  },
  {
    "id": 315,
    "slug": "food/vegan"
  },
  {
    "id": 12,
    "slug": "games"
  },
  {
    "id": 270,
    "slug": "games/gaming hardware"
  },
  {
    "id": 271,
    "slug": "games/live games"
  },
  {
    "id": 272,
    "slug": "games/mobile games"
  },
  {
    "id": 273,
    "slug": "games/playing cards"
  },
  {
    "id": 274,
    "slug": "games/puzzles"
  },
  {
    "id": 34,
    "slug": "games/tabletop games"
  },
  {
    "id": 35,
    "slug": "games/video games"
  },
  {
    "id": 13,
    "slug": "journalism"
  },
  {
    "id": 357,
    "slug": "journalism/audio"
  },
  {
    "id": 358,
    "slug": "journalism/photo"
  },
  {
    "id": 359,
    "slug": "journalism/print"
  },
  {
    "id": 360,
    "slug": "journalism/video"
  },
  {
    "id": 361,
    "slug": "journalism/web"
  },
  {
    "id": 14,
    "slug": "music"
  },
  {
    "id": 316,
    "slug": "music/blues"
  },
  {
    "id": 317,
    "slug": "music/chiptune"
  },
  {
    "id": 36,
    "slug": "music/classical music"
  },
  {
    "id": 386,
    "slug": "music/comedy"
  },
  {
    "id": 37,
    "slug": "music/country & folk"
  },
  {
    "id": 38,
    "slug": "music/electronic music"
  },
  {
    "id": 318,
    "slug": "music/faith"
  },
  {
    "id": 39,
    "slug": "music/hip-hop"
  },
  {
    "id": 40,
    "slug": "music/indie rock"
  },
  {
    "id": 41,
    "slug": "music/jazz"
  },
  {
    "id": 319,
    "slug": "music/kids"
  },
  {
    "id": 320,
    "slug": "music/latin"
  },
  {
    "id": 241,
    "slug": "music/metal"
  },
  {
    "id": 42,
    "slug": "music/pop"
  },
  {
    "id": 321,
    "slug": "music/punk"
  },
  {
    "id": 322,
    "slug": "music/r&b"
  },
  {
    "id": 43,
    "slug": "music/rock"
  },
  {
    "id": 44,
    "slug": "music/world music"
  },
  {
    "id": 15,
    "slug": "photography"
  },
  {
    "id": 275,
    "slug": "photography/animals"
  },
  {
    "id": 276,
    "slug": "photography/fine art"
  },
  {
    "id": 277,
    "slug": "photography/nature"
  },
  {
    "id": 278,
    "slug": "photography/people"
  },
  {
    "id": 280,
    "slug": "photography/photobooks"
  },
  {
    "id": 279,
    "slug": "photography/places"
  },
  {
    "id": 18,
    "slug": "publishing"
  },
  {
    "id": 323,
    "slug": "publishing/academic"
  },
  {
    "id": 324,
    "slug": "publishing/anthologies"
  },
  {
    "id": 45,
    "slug": "publishing/art books"
  },
  {
    "id": 325,
    "slug": "publishing/calendars"
  },
  {
    "id": 46,
    "slug": "publishing/children's books"
  },
  {
    "id": 387,
    "slug": "publishing/comedy"
  },
  {
    "id": 47,
    "slug": "publishing/fiction"
  },
  {
    "id": 349,
    "slug": "publishing/letterpress"
  },
  {
    "id": 326,
    "slug": "publishing/literary journals"
  },
  {
    "id": 48,
    "slug": "publishing/nonfiction"
  },
  {
    "id": 49,
    "slug": "publishing/periodicals"
  },
  {
    "id": 50,
    "slug": "publishing/poetry"
  },
  {
    "id": 239,
    "slug": "publishing/radio & podcasts"
  },
  {
    "id": 327,
    "slug": "publishing/translations"
  },
  {
    "id": 328,
    "slug": "publishing/young adult"
  },
  {
    "id": 329,
    "slug": "publishing/zines"
  },
  {
    "id": 389,
    "slug": "publishing/literary spaces"
  },
  {
    "id": 16,
    "slug": "technology"
  },
  {
    "id": 331,
    "slug": "technology/3d printing"
  },
  {
    "id": 332,
    "slug": "technology/apps"
  },
  {
    "id": 333,
    "slug": "technology/camera equipment"
  },
  {
    "id": 334,
    "slug": "technology/diy electronics"
  },
  {
    "id": 335,
    "slug": "technology/fabrication tools"
  },
  {
    "id": 336,
    "slug": "technology/flight"
  },
  {
    "id": 337,
    "slug": "technology/gadgets"
  },
  {
    "id": 52,
    "slug": "technology/hardware"
  },
  {
    "id": 362,
    "slug": "technology/makerspaces"
  },
  {
    "id": 338,
    "slug": "technology/robots"
  },
  {
    "id": 51,
    "slug": "technology/software"
  },
  {
    "id": 339,
    "slug": "technology/sound"
  },
  {
    "id": 340,
    "slug": "technology/space exploration"
  },
  {
    "id": 341,
    "slug": "technology/wearables"
  },
  {
    "id": 342,
    "slug": "technology/web"
  },
  {
    "id": 17,
    "slug": "theater"
  },
  {
    "id": 388,
    "slug": "theater/comedy"
  },
  {
    "id": 281,
    "slug": "theater/experimental"
  },
  {
    "id": 282,
    "slug": "theater/festivals"
  },
  {
    "id": 283,
    "slug": "theater/immersive"
  },
  {
    "id": 284,
    "slug": "theater/musical"
  },
  {
    "id": 285,
    "slug": "theater/plays"
  },
  {
    "id": 286,
    "slug": "theater/spaces"
  }
];

const statuses = {
  All: '',
  Live: 'live',
  Successful: 'successful', 
};
const pledged = ["All", "< $1,000 pledged", "$1,000 to $10,000 pledged", "$10,000 to $100,000 pledged", "$100,000 to $1,000,000 pledged", "> $1,000,000 pledged"];
const goals = ["All", "< $1,000 goal", "$1,000 to $10,000 goal", "$10,000 to $100,000 goal", "$100,000 to $1,000,000 goal", "> $1,000,000 goal"];
const raised = ["All", "< 75% raised", "75% to 100% raised", "> 100% raised"];

module.exports = {
  categories,
  statuses,
  pledged,
  goals,
  raised,
};