const populateManifest = function (shortcuts = []) {
  const manifest = {
    name: 'wembox',
    short_name: 'wembox',
    start_url: '/',
    categories: [
      'education',
      'entertainment',
      'government',
      'lifestyle',
      'news',
      'personalization',
      'photo',
      'social',
      'sports',
      'utilities',
    ],
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    scope: '/',
    description: 'Social networking in a new way',
    icons: [
      {
        src: '/Imgs/app-images/logo-30x30.png',
        sizes: '30x30',
        type: 'image/png',
      },
      {
        src: '/Imgs/app-images/logo-256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/Imgs/app-images/logo-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/Imgs/app-images/logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/Imgs/app-images/logo-1024x1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    screenshots: [
      //   {
      //     src: '/assets/screenshot-home.png',
      //     sizes: '1992x1773',
      //     type: 'image/png',
      //   },
      //   {
      //     src: '/assets/screenshot-tip.png',
      //     sizes: '1992x1773',
      //     type: 'image/png',
      //   },
    ],
    url_handlers: [
      {
        origin: 'https://wembox.ng',
      },
    ],
    display_override: ['window-controls-overlay'],
    edge_side_panel: {
      preferred_width: 376,
    },
    shortcuts,
    share_target: {
      action: '/',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        files: [
          {
            name: 'photo',
            accept: ['image/*'],
          },
        ],
      },
    },
  };

  return manifest;
};

module.exports = { populateManifest };

// [
//   {
//     name: 'wembox inc',
//     url: '/?chats=',
//     description: 'Open and chat with wembox inc',
//     icons: [
//       {
//         src: 'https://wembox.ng/images/user-images/profile-image-66fb27733ad943b98606cea2-1727794460209.jpeg',
//         type: 'image/png',
//         sizes: '500x500',
//       },
//     ],
//   },
//   {
//     name: 'Nwodoh Danie',
//     url: '/?chat',
//     description: 'Open and chat with Nwodoh Danie',
//     icons: [
//       {
//         src: 'https://wembox.ng/images/user-images/default-profile-image.jpg',
//         type: 'image/png',
//         sizes: '500x500',
//       },
//     ],
//   },
//   {
//     name: 'SpaceX',
//     url: '/?chat',
//     description: 'Open and chat with SpaceX',
//     icons: [
//       {
//         src: 'https://wembox.ng/images/user-images/profile-image-66fc19e83ad943b986072921-1727798028790.jpeg',
//         type: 'image/png',
//         sizes: '500x500',
//       },
//     ],
//   },
// ];
