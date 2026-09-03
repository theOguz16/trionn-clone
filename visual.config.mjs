export const visualConfig = {
  referenceUrl: "https://trionn.com/",
  cloneUrl: "http://localhost:3000/",
  cloneRangeMode: "reference",
  outputRoot: ".visual-comparison",
  checkpoints: [0, 0.25, 0.5, 0.75, 1],
  viewports: {
    mobile: {
      width: 390,
      height: 844,
    },
    tablet: {
      width: 768,
      height: 1024,
    },
    desktopShort: {
      width: 1280,
      height: 720,
    },
    desktopWide: {
      width: 1440,
      height: 900,
    },
  },
  sections: [
    {
      id: "hero",
      label: "Hero",
      cloneSelectors: ["[data-home-hero]"],
      masks: ["hero-word", "model-interior"],
      liveRanges: {
        mobile: [0, 4220],
        tablet: [0, 5120],
        desktopShort: [0, 3655],
        desktopWide: [0, 4500],
      },
    },
    {
      id: "about",
      label: "About intro",
      cloneSelectors: ["[data-home-about]"],
      liveRanges: {
        mobile: [844, 1688],
        tablet: [1024, 2048],
        desktopShort: [720, 1495],
        desktopWide: [900, 1800],
      },
    },
    {
      id: "vision",
      label: "Vision / stripe transition",
      cloneSelectors: ["[data-home-stripe-wipe]"],
      masks: ["model-interior"],
      liveRanges: {
        mobile: [1688, 4220],
        tablet: [2048, 5120],
        desktopShort: [1495, 3655],
        desktopWide: [1800, 4500],
      },
    },
    {
      id: "key-facts",
      label: "Key Facts and partners",
      cloneSelectors: ["[data-home-key-facts]"],
      videoSyncProgress: 0.25,
      liveRanges: {
        mobile: [3376, 5064],
        tablet: [4096, 5120],
        desktopShort: [2935, 3895],
        desktopWide: [3600, 4679],
      },
    },
    {
      id: "selected-work",
      label: "Selected Work",
      cloneSelectors: [
        "[data-desktop-selected-work]",
        "[data-mobile-selected-work]",
      ],
      videoSyncProgress: 0.25,
      liveRanges: {
        mobile: [4220, 6393],
        tablet: [5120, 9216],
        desktopShort: [3895, 6775],
        desktopWide: [4679, 8279],
      },
    },
    {
      id: "services",
      label: "Services",
      cloneSelectors: ["[data-home-services-showcase]"],
      masks: ["model-interior"],
      liveRanges: {
        mobile: [6393, 13145],
        tablet: [9216, 18944],
        desktopShort: [6775, 13615],
        desktopWide: [8279, 16829],
      },
    },
    {
      id: "testimonials",
      label: "Client Stories",
      cloneSelectors: ["[data-home-client-stories]"],
      videoSyncProgress: 0.25,
      liveRanges: {
        mobile: [13145, 14001],
        tablet: [18944, 19978],
        desktopShort: [13615, 14489],
        desktopWide: [16829, 17812],
      },
    },
    {
      id: "design-motion",
      label: "Design in Motion",
      cloneSelectors: ["[data-home-design-motion]"],
      videoSyncProgress: 0.25,
      liveRanges: {
        mobile: [13999, 18641],
        tablet: [19977, 27657],
        desktopShort: [14487, 19887],
        desktopWide: [17810, 24560],
      },
    },
    {
      id: "footer",
      label: "Footer",
      cloneSelectors: ["[data-home-audio-footer]"],
      masks: ["clock"],
      liveRanges: {
        mobile: [17799, 18643],
        tablet: [26634, 27658],
        desktopShort: [19169, 20001],
        desktopWide: [23662, 24597],
      },
    },
  ],
};
