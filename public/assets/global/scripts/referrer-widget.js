window.onload = function() {
  var bitMoonRefElement = document.getElementById('bitmoon-ref');
  var Widget = Object.create({
    create: function create() {
      var wdg = document.createElement('div');
      var userId = bitMoonRefElement.getAttribute('data-user-id');
      var domain = bitMoonRefElement.getAttribute('data-link');
      var size = bitMoonRefElement.getAttribute('data-size');
      var refUrl = domain + '/register/referer/' + userId;

      wdg.classList.add('ref-container');
      wdg.innerHTML =
        '<a href="' +
        refUrl +
        '" target="_blank"><img style="width: 100%;" src="' +
        domain +
        '/assets/global/img/bitmoon/bitmoon_ref_' +
        size +
        '.png"/></a>';
      return wdg;
    },
  });
  var referrerWidget = Widget.create();

  if (bitMoonRefElement) {
    bitMoonRefElement.appendChild(referrerWidget);
  }
};
