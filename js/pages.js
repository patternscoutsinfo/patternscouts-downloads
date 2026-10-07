/* =====================================================================
   Which page does a product open?

   Most products get the generic product.html, which is drawn entirely
   from ps_product(). A product that has earned a hand-written page --
   Crow, with its toolbox, its live visitor counts and its own FAQ --
   is listed here and opens that page instead.

   Adding a third product needs no change here: leave it out of the map
   and it gets the generic page for free. Give it a bespoke page later
   by adding one line.
   ===================================================================== */

(function (global) {
  "use strict";

  /* Crow's hand-written crow.html is for Crow 1.x (its own download and
     in-app payment). Crow 2.0 is bought on buy.html and installed from
     Bird Flew, so it uses the generic page like every other product. */
  var BESPOKE = {};

  global.PSPages = {
    /* The URL for a product's own page. */
    href: function (slug) {
      return BESPOKE[slug] || ("product.html?p=" + encodeURIComponent(slug));
    },

    /* Does this slug have a hand-written page of its own? */
    isBespoke: function (slug) {
      return Object.prototype.hasOwnProperty.call(BESPOKE, slug);
    }
  };
})(window);
