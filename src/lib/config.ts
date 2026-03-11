const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/+$/,
  "",
);

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export { apiBaseUrl };
