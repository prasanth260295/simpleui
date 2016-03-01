$(function () {

  'use strict';

  var $window = $(window);
  var $body = $(document.body);
  var $sidebar = $('.pg-sidebar');
  var minWidth = 991;
  var windowWidth;
  var offset;

  function escapeHTML(html) {
    var regexp = /^\s+/;
    var spaces = html.match(regexp);
    var start = spaces ? spaces[0].length - 1 : 0;

    return $.trim(html).replace(/[^\n]+/g, function (line) {
      if (regexp.test(line)) {
        line = start > 0 ? line.substring(start) : line.replace(regexp, '');
      }

      return line;
    }).replace(/&"'<>/g, function (char) {
      switch (char) {
        case '&':
          return '&amp;';

        case '"':
          return '&quot;';

        case '\'':
          return '&#039;';

        case '<':
          return '&lt;';

        case '>':
          return '&gt;';
      }
    });
  }

  $window.on({
    resize: function () {
      offset = $sidebar.offset();
      windowWidth = $window.width();
      $window.triggerHandler('scroll');
    },
    scroll: function () {
      $sidebar.toggleClass(
        'fixed',
        windowWidth > minWidth && $body.scrollTop() > offset.top
      );
    }
  }).triggerHandler('resize');

  $('.pg-demo').each(function () {
    var $this = $(this);
    var $code = $('<div class="pg-code"></div>');
    var code = escapeHTML($this.html().replace('<pre class="prettyprint">', '<pre>'));

    $code.append($('<pre class="prettyprint"></pre>').text(code));
    $this.after($code);
  });

  // Google Code Prettify
  if (window.prettyPrint) {
    window.prettyPrint();
  }

  // Copy to clipboard
  var clipboard;

  if (window.Clipboard) {
    $('.pg-code').prepend('<span class="pg-copy">Copy</span>');

    clipboard = new window.Clipboard('.pg-copy', {
      text: function (trigger) {
        return $(trigger).next('pre').text();
      }
    });

    clipboard.on('success', function (e) {
      var $copy = $(e.trigger);

      $copy.text('Copied!');

      setTimeout(function () {
        $copy.text('Copy');
      }, 3000);
    });
  }

});
