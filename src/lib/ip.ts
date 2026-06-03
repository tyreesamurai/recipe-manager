const ipv4StrictRegex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export const isLocalIp = (ip: string) => {
  if (ip === "::1") {
    return true;
  }

  if (!ip.match(ipv4StrictRegex)) {
    return false;
  }

  const [firstOctet, secondOctet, _thirdOctet, _fourthOctet] = ip.split(".");

  const first = Number(firstOctet);
  const second = Number(secondOctet);

  if (first === 127 || first === 10) {
    return true;
  }

  if (first === 192 && second === 168) {
    return true;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  return false;
};

export const isTailscaleIp = (ip: string) => {
  if (!ip.match(ipv4StrictRegex)) {
    return false;
  }

  const [firstOctet, secondOctet, _thirdOctet, _fourthOctet] = ip.split(".");

  const first = Number(firstOctet);
  const second = Number(secondOctet);

  if (first === 100 && second >= 64 && second <= 127) {
    return true;
  }

  return false;
};

const normalizeIp = (ip: string): string =>
  ip.startsWith("::ffff:") ? ip.slice(7) : ip;

export const extractClientIp = (request: Request): string | null => {
  const cloudflareConnectingIp = request.headers.get("cf-connecting-ip");

  if (cloudflareConnectingIp) {
    const normalized = normalizeIp(cloudflareConnectingIp.trim());
    if (normalized.match(ipv4StrictRegex)) return normalized;
  }

  const xRealIp = request.headers.get("x-real-ip");

  if (xRealIp) {
    const normalized = normalizeIp(xRealIp.trim());
    if (normalized.match(ipv4StrictRegex)) return normalized;
  }

  const xForwardedFor = request.headers.get("x-forwarded-for");

  if (xForwardedFor) {
    const [first] = xForwardedFor.split(",");
    const normalized = normalizeIp(first.trim());
    if (normalized.match(ipv4StrictRegex)) return normalized;
  }

  return null;
};
