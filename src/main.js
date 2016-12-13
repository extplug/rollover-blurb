import $ from 'jquery';
import { before, after } from 'meld';
import Plugin from 'extplug/Plugin';
import rolloverView from 'plug/views/users/userRolloverView';

import getBlurb from './blurb';

const emoji = $('<span />').addClass('emoji-glow')
  .append($('<span />').addClass('emoji emoji-1f4dd'));

const opening = Symbol('currently loading blurb');

const RolloverBlurb = Plugin.extend({
  name: 'Rollover Blurb',
  description: 'Show user "Blurb" / bio in rollover popups.',

  style: {
    '.extplug-blurb': {
      'padding': '10px',
      'position': 'absolute',
      'top': '3px',
      'background': '#282c35',
      'width': '100%',
      'box-sizing': 'border-box',
      'display': 'none'
    },
    '.expand .extplug-blurb': {
      'display': 'block'
    }
  },

  enable() {
    this.showAdvice = after(rolloverView, 'showModal', this.addBlurb);
    this.hideAdvice = before(rolloverView, 'hide', this.removeBlurb);
  },

  disable() {
    this.showAdvice.remove();
    this.hideAdvice.remove();
  },

  // these advice methods are not bound, so their context is the rollover View instance
  addBlurb() {
    // we're already loading the blurb for this user, don't load it again
    if (this[opening] === this.user) {
      return;
    }
    this.$('.extplug-blurb-wrap').remove();
    let span = $('<span />').addClass('extplug-blurb');
    let div = $('<div />').addClass('info extplug-blurb-wrap').append(span);
    this[opening] = this.user;
    getBlurb(this.user).then(blurb => {
      // ensure that the same rollover is still open
      if (blurb && this[opening] === this.user) {
        this[opening] = null;
        // `this` == the RolloverView
        this.$('.actions').before(div);
        span.append(emoji, ` ${blurb}`);
        let height = span[0].offsetHeight + 6;
        div.height(height);
        if (this.$el.hasClass('upwards')) {
          this.$el.css('top', (parseInt(this.$el.css('top'), 10) - height) + 'px');
        }
      }
    });
  },
  removeBlurb() {
    // `this` == the RolloverView
    this.$('.extplug-blurb-wrap').remove();
  }
});

export default RolloverBlurb;