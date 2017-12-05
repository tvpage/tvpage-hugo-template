
exports.data = {
  BASE_URL: "https://widgets.goodlookingbean.com/test/",
  SLA: 10000,
  BROWSERHEIGHT: 1080,
  BROWSEWIDTH: 1920,

  WIDGET_TYPE: 'embed',
  WIDGET_CI: {MIN:0, MAX:1},
  LOGIN_ID: 1758799,
  CHANNEL_ID: 0,
  SKIP_INIT_COUNT: true // Skip initial CI event count
};

exports.time = [25, 15];

exports.analytics = [
  {
    VIDS: [83094532,83095027],
    VDRS: [
      {VID: 83094532, VDR: {MIN:179, MAX:180}}
    ],
    VTPS: [
      {VID: 83094532, VTP: {MIN:25, MAX:80}}, // Min && Max value of VT percent
    ],
    COUNTS: {"ci": 1, "vv": 1, "vt": {MIN: 37, MAX: 39}, "vtp": {MIN:2, MAX: 3}},
    SKIP_CHECK_ELEMENT: true,
    SKIP_CID: true
  },
  {
    VIDS: [83095027],
    VDRS: [
      {VID: 83095027, VDR: {MIN:120, MAX:121}},
    ],
    VTPS: [
      {VID: 83095027, VTP: {MIN:25, MAX:85}} // Based on playing time / video length
    ],
    COUNTS: {"ci": 1, "vv": 1, "vt": {MIN: 22, MAX: 25}, "vtp": {MIN:2, MAX: 3}},
    SKIP_CHECK_ELEMENT: true,
    SKIP_CID: true
  }
];
