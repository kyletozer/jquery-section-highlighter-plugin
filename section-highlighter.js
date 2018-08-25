'use strict';


(function($) {

  function Plugin(element, options) {
    this.element = $(element);
    this.options = options;
    this.targetNavItem = null;
    this.currentSection = null;
    this.sections = null;
    this.$root = $('html, body');
    this.navOffset = null;
  }


  Plugin.prototype.init = function() {

    // defaults
    this.options = $.extend({
      targetSection: '.section',
      menuItemElement: 'li',
      activeSectionClass: 'active',
      anchor: 'a[href^="#"]',
      scrollSpeed: 500,
      offsetNavigation: true
    }, this.options || {});

    this.setup();
    this.scrollHandler.call(this);
    this.smoothScrolling();
    this.offsetNavigation();
  }


  Plugin.prototype.offsetNavigation = function() {
    var self = this;

    this.sections.each(function(i) {
      var currentTopPad = Number($(this).css('padding-top').replace(/\D/g, ''));
      var style = { 'padding-top': self.navOffset + currentTopPad + 'px' };

      // will not apply anchor offset to the first section
      if(i !== 0) {
        style['margin-top'] = '-' + self.navOffset + 'px';
      }

      $(this).css(style);
    });
  }


  Plugin.prototype.modifyPushState = function() {
    
    // check for history API
    if(!history.pushState) {
      return;
    }

    var stateObj = {};

    this.currentSection = '#' + this.targetNavItem[0].href.split('#')[1]

    if(location.hash !== this.currentSection) {
      stateObj.currentSection = this.currentSection;
      stateObj.url = location.origin + '/' + this.currentSection;
      history.pushState(stateObj, stateObj.section, stateObj.url);
    }
  }


  Plugin.prototype.smoothScrolling = function() {
    var anchors = this.element.find(this.options.anchor);
    var self = this;

    anchors.on('click', function(e) {
      e.preventDefault();
      
      // implement smooth scrolling
      self.$root.animate({
        scrollTop: $($.attr(e.currentTarget, 'href') ).offset().top
      }, self.options.scrollSpeed);
    });
  }


  Plugin.prototype.setup = function() {
    
    this.sections = $(this.options.targetSection);
    
    // make menu position fixed
    this.element.addClass('fixed');

    // allow menu expanded past window to be scrollable
    this.element.css('max-height', $(window).height() + 'px');

    this.navOffset = this.element.outerHeight();
    
    $(document).on('scroll', this.scrollHandler.bind(this));
  }


  Plugin.prototype.scrollHandler = function() {
    var position = $(window).scrollTop();
    var navItems = this.element.find(this.options.menuItemElement);
    var activeSectionClass = this.options.activeSectionClass;
    var self = this;

    // remove all active menu classes
    navItems.removeClass(activeSectionClass);

    this.sections.each(function() {
      var sectionHeight = Math.round($(this).outerHeight());
      var sectionTop = Math.round($(this).offset().top) - 10;
      var sectionBottom = sectionTop + sectionHeight;
      var navItem = $(navItems[$(this).index()]);

      // highlight last nav item when scroll bottom
      if((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        self.targetNavItem = $(navItems[self.sections.length - 1]);

      // highlight first nav item when scroll top
      } else if(position === 0 && position < (self.sections.first().outerHeight() + self.sections.first().offset().top)) {
        self.targetNavItem = $(navItems[0])

      // otherwise highlight the appropriate section
      } else if(position >= sectionTop && position < sectionBottom) {
        self.targetNavItem = navItem
      }
    });

    // add the active class to the appropriate nav item
    this.targetNavItem.addClass(activeSectionClass);

    this.modifyPushState();
  }


  $.fn.sectionHighlighter = function(options) {
    var plugin = new Plugin(this, options);
    plugin.init();
    return this;
  };

})(jQuery);