
exports.HTML = {
  ELEMENT_WIDGET_HOLDER: "div#solo-2-holder",
  ELEMENT_WIDGET: 'body',
  ELEMENT_WIDGET_TITLE: "div.tvp-cta-text",
  ELEMENT_MODAL_HOLDER: "div#tvp-modal-solo-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-solo-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-solo-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-solo-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-solo-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-solo-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-solo-2',
  ELEMENT_PLAYER_HOLDER: "div.player-holder",
  ELEMENT_VIDEO_CONTENT: 'body',
  ELEMENT_FIRST_VIDEO: 'div.tvp-cta-overlay',
  IFRAME_WIDGET: 0,
};

exports.data = {
  BASE_URL: "https://widgets.goodlookingbean.com/test/",
  SLA: 10000,
  BROWSERHEIGHT: 1080,
  BROWSEWIDTH: 1920,
  WIDGET_TYPE: 'solo',
  WIDGET_CI: {MIN:0, MAX:1},
  LOGIN_ID: 1758799,
  CHANNEL_ID: 66133904,
  SKIP_INIT_COUNT: true
};

exports.product = {
  ID: 83102933,
  URL: "http://www.gourmia.com/item.asp?item=10096",
  SECURE_URL: "http://http://www.gourmia.com/item.asp?item=10096",
  TITLE_REGEX: /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
  IMG: "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
  PRICE: "$199.99"
};

exports.analytic_events = [
  ['ci','vv','vt','vtp']
];

exports.analytics = [
  {
    VIDS: [65981962,83106081,83093960],
    // VIDS: [65981962,83106081],
    PKIDS: [
      {VID:65981962, PKID:83102933},
      {VID:83106081, PKID:83102606}
    ],
    // List of VID and PIDS pair (video id and product ids)
    PIDS: [
      {VID: 65981962, PIDS: [83102933,83102936,83102939,83102914,83102916,83102920,83102919,83102921,83102918,83102928,83102927,83102923]},
      {VID: 83106081, PIDS: [83102606,83096473,83096474,83102585,83102603,83106094]},
      {VID: 83093960, PIDS: [83102883,83102877,83102926,83102922,83102610]}
    ],
    VDRS: [
      {VID: 65981962, VDR: {MIN:6, MAX:7}},
      {VID: 83106081, VDR: 423},
      {VID: 83093960, VDR: 83}
    ],
    VTPS: [
      {VID: 65981962, VTP: {MIN:50, MAX:100}}, // Min && Max value of VT percent
      {VID: 83106081, VTP: {MIN:25, MAX:85}}, // Based on playing time / video length
      {VID: 83093960, VTP: {MIN:25, MAX:85}}
    ],
    COUNTS: {"ci": 1, "vv": 2, "vt": {MIN: 22, MAX: 27}, "vtp": {MIN:1, MAX: 3}},
    SKIP_CHECK_ELEMENT: true,
    SKIP_CID: true
    // COUNTS: {"ci": 2, "pi": 18, "vv": 2, "pk": 1}
  }
];
