export const FBSharing = (params, cb) => {
  window.FB.ui(params, (response) => cb(response));
};
