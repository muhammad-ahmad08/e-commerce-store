const whatsappNumber = (process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER ?? "").replace(
  /\D/g,
  "",
);

export const STORE_TIME_ZONE = "Asia/Karachi";

export const storeConfig = {
  whatsappNumber,
  jazzCashAccountNumber: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER?.trim() ?? "",
  jazzCashAccountName: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME?.trim() ?? "",
};
