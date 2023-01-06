$(document).ready(function () {
  /*
     * ----------------------------------------------------------------------------------------
     *  CHANGE MENU BACKGROUND JS
     * ----------------------------------------------------------------------------------------
     */
  var headertopoption = $(window);

  headertopoption.on('scroll', function () {
    if (headertopoption.scrollTop() > 200) {
      $('.page-header.navbar-top').addClass('menu-bg');
    } else {
      $('.page-header.navbar-top').removeClass('menu-bg');
    }
  });
  $('.bitmoon-page').on('click', '.page-logo, .link-list li a', function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
  });
  $('.bitmoon-page').on('click', '.navbar-collapse.in ul li a', function () {
    $(this)
      .closest('.navbar-collapse')
      .toggleClass('in');
      $('.page-sidebar-wrapper').removeAttr('style');
  });
  $('.bitmoon-page').on('click', '.menu-toggler', function () {
    $('.page-sidebar-wrapper').slideToggle('collapse');
  });
});
