# Spec: JazzCash Payment Details + WhatsApp Click-to-Chat

**Spec ID:** SPEC-011
**Phase:** Phase 8 — Orders, Payments & Admin
**Depends on:** SPEC-010

## 1. Goal
For orders paid by JazzCash, show the store's JazzCash account details on
the order confirmation page and give the customer a button that opens
WhatsApp to the store with a ready-written message about their order.
No payment gateway, no messaging API, no credentials.

## 2. Scope
### In scope
- A single store configuration module holding the store's public contact
  and payment details, read from environment variables, so each client's
  deployment only changes `.env` values, not code
- A JazzCash instructions block on the confirmation page, shown only when
  `payment_method = 'jazzcash'`
- A "Send payment screenshot on WhatsApp" button that opens a `wa.me` link
  with a pre-filled message
- Documenting the new variables in `.env.example`
- Updating `CONTEXT.md`

### Out of scope
- Any automatic or server-sent WhatsApp/SMS message
- Phone number verification or extra phone validation beyond what checkout
  already does
- Tracking whether a JazzCash payment was received
- Any change for COD orders — the confirmation page stays as it is

## 3. Files to create/modify
- `src/config/store.ts` — new file, the store config module
- `src/app/(shop)/order-confirmation/[orderId]/page.tsx` — add the
  JazzCash block
- `.env.example` — document new variables
- `CONTEXT.md` — document the config module

## 4. Requirements
1. Add three environment variables, all safe to expose publicly because
   customers see them anyway:
   - `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER` — international format, digits
     only, for example `923001234567`
   - `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER`
   - `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME`
2. `src/config/store.ts` exports these values. It must strip any spaces,
   dashes, or a leading `+` from the WhatsApp number before use, because
   `wa.me` links need digits only, with no `+` or leading zeros.
3. On the confirmation page, for JazzCash orders only, show: the account
   name, the account number, the exact amount to send (the order's stored
   `total_amount`, formatted as Rs.), and the order reference, with a
   note to quote it when sending the payment.
4. The WhatsApp button links to
   `https://wa.me/<number>?text=<url-encoded message>`. The message must
   include the order reference and the amount, for example: "Hi, I placed
   order ABC12345 and sent Rs. 7,000 via JazzCash. Screenshot attached."
   Build it with `encodeURIComponent`. Open it in a new tab with
   `rel="noopener noreferrer"`.
5. If any of the three variables is missing or empty, do not show broken
   or blank details. Show a fallback line instead ("The store will contact
   you with payment details") and hide the WhatsApp button.
6. Do not hardcode the number or account details anywhere in components.
7. Use existing design tokens for the new block.

## 5. Acceptance Criteria (definition of "done")
- [ ] A JazzCash order's confirmation page shows the account name, account
      number, correct amount, and order reference
- [ ] The WhatsApp button opens a chat with the configured number and the
      message pre-filled with the right reference and amount
- [ ] A COD order's confirmation page shows no JazzCash block or button
- [ ] With the three variables removed from `.env.local`, the fallback
      line appears and nothing is broken or blank
- [ ] The WhatsApp number works whether it is written as `923001234567`,
      `+92 300 1234567`, or `+92-300-1234567` in `.env.local`
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add JazzCash details and WhatsApp click-to-chat`
