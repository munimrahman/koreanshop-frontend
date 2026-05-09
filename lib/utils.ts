import crypto from "crypto";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.koreanskincareshopbd.com";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateEventId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const hashSHA256 = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
