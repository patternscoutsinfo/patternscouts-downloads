/* =====================================================================
   PatternScouts  --  the only file on the website you ever need to edit.

   The publishable key (sb_publishable_...) is safe to publish. It cannot read a licence, a customer
   or an email address. The only two functions it is allowed to call are
   ps_catalogue() and ps_product(), and both of them return nothing but
   the price list. Everything else in the database is closed to it.
   ===================================================================== */

window.PS = {
  SUPABASE_URL: "https://xnwytzpjzbpecqriwbrc.supabase.co",
  // Supabase -> Settings -> API Keys -> Publishable key (sb_publishable_...)
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_WTWOqpUesb0ciilbEvuL7w_EVTeDc8d",

  // Where the "request a key" form posts. Crow's existing edge function.
  REQUEST_PATH: "/functions/v1/crow-request",

  // The PUBLIC GitHub repository the Bird Flew download comes from (pscore.DOWNLOADS_REPO).
  DOWNLOADS_REPO: "patternscoutsinfo/patternscouts-downloads"
};
