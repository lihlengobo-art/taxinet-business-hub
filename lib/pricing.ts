// Price of a single Wi-Fi connection at the rank (in Rand).
// Override per-deployment with the CONNECTION_PRICE env var.
export const CONNECTION_PRICE = Number(process.env.CONNECTION_PRICE) || 7

// Long-lived cookie that identifies a returning device so connections can be
// deduplicated per device per day on the financial side.
export const DEVICE_COOKIE = 'tnc_device'
