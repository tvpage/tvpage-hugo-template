
exports.counts = [
  {
    VIDS: [65981962,83106081],
    PKIDS: [
      {VID:65981962, PKID:83102933},
      {VID:83106081, PKID:83102606}
    ],
    // List of VID and PIDS pair (video id and product ids)
    PIDS: [
      {VID: 65981962, PIDS: [83102933,83102936,83102939,83102914,83102916,83102920,83102919,83102921,83102918,83102928,83102927,83102923]},
      {VID: 83106081, PIDS: [83102606,83096473,83096474,83102585,83102603,83106094]},
    ],
    VDRS: [
      {VID: 65981962, VDR: {MIN:6, MAX:7}},
      {VID: 83106081, VDR: 423}
    ],
    VTPS: [
      {VID: 65981962, VTP: {MIN:50, MAX:100}}, // Min && Max value of VT percent
      {VID: 83106081, VTP: {MIN:25, MAX:85}}, // Based on playing time / video length
    ],
    COUNTS: {"ci": {MIN:1, MAX:2}, "vv": 2, "vt": {MIN: 22, MAX: 27}, "vtp": {MIN:1, MAX: 3}, "pi": 18, "pk": 1}
    // COUNTS: {"ci": 2, "pi": 18, "vv": 2, "pk": 1}
  }
];
