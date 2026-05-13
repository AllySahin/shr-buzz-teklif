export interface UserConfig {
  contact: string;
  taxId: string;
  firmaYetkilisi?: string;
  logoPath?: string;
}

export const USER_CONFIGS: Record<string, UserConfig> = {
  ahmet: {
    contact: "+90 552 617 07 06",
    taxId: "9371036402",
    firmaYetkilisi: "Ahmet Yapıcı",
    logoPath: "out/aılogo.jpeg",
  },
};

export const DEFAULT_CONTACT = "+90 533 084 09 48";
export const DEFAULT_TAX_ID = "32047036162";

export function getUserContact(username?: string): string {
  if (username && username in USER_CONFIGS) {
    return USER_CONFIGS[username].contact;
  }
  return DEFAULT_CONTACT;
}

export function getTaxId(username?: string): string {
  if (username && username in USER_CONFIGS) {
    return USER_CONFIGS[username].taxId;
  }
  return DEFAULT_TAX_ID;
}

export function getFirmaYetkilisi(username?: string): string {
  if (username && username in USER_CONFIGS) {
    return USER_CONFIGS[username].firmaYetkilisi || "Serkan Uyar";
  }
  return "Serkan Uyar";
}

export function getLogoPath(username?: string): string {
  if (username && username in USER_CONFIGS) {
    return USER_CONFIGS[username].logoPath || "./logo.png";
  }
  return "./logo.png";
}
