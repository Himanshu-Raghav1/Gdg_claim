"use server";

import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "dguhwbhc1";
const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? "gdg-akinator-polaroids";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

// ---------------------------------------------------------------------------
// Input validation: 6-char alphanumeric, uppercase
// ---------------------------------------------------------------------------
function isValidOtp(otp: string): boolean {
  return /^[A-Z0-9]{6}$/.test(otp.trim().toUpperCase());
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------
export interface FetchPhotoSuccess {
  success: true;
  imageUrl: string;
  downloadUrl: string;
  otp: string;
}

export interface FetchPhotoError {
  success: false;
  error: string;
}

export type FetchPhotoResult = FetchPhotoSuccess | FetchPhotoError;

// ---------------------------------------------------------------------------
// fetchPhoto
// Looks up the Cloudinary asset for a given 6-char OTP code.
// Uses direct Cloudinary CDN HEAD check first (fastest, requires zero API keys),
// falling back to signed Cloudinary URLs.
// ---------------------------------------------------------------------------
export async function fetchPhoto(rawOtp: string): Promise<FetchPhotoResult> {
  const otp = rawOtp.trim().toUpperCase();

  if (!isValidOtp(otp)) {
    return {
      success: false,
      error: "Invalid code format. Please enter the 6-character code from your kiosk screen.",
    };
  }

  // Direct CDN URL
  const cdnUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${FOLDER}/polaroid_${otp}.png`;
  const cdnJpgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${FOLDER}/polaroid_${otp}.jpg`;
  const downloadUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_attachment/${FOLDER}/polaroid_${otp}`;

  try {
    // 1. First test PNG CDN URL
    const pngHead = await fetch(cdnUrl, { method: "HEAD", cache: "no-store" });
    if (pngHead.status === 200) {
      return { success: true, imageUrl: cdnUrl, downloadUrl: `${downloadUrl}.png`, otp };
    }

    // 2. Test JPEG CDN URL
    const jpgHead = await fetch(cdnJpgUrl, { method: "HEAD", cache: "no-store" });
    if (jpgHead.status === 200) {
      return { success: true, imageUrl: cdnJpgUrl, downloadUrl: `${downloadUrl}.jpg`, otp };
    }

    // 3. Fallback: try Admin API if keys are present
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const publicId = `${FOLDER}/polaroid_${otp}`;
      await cloudinary.api.resource(publicId, { resource_type: "image" });
      const imageUrl = cloudinary.url(publicId, { secure: true, fetch_format: "png" });
      return { success: true, imageUrl, downloadUrl: `${downloadUrl}.png`, otp };
    }

    // 4. Photo genuinely not found
    return {
      success: false,
      error: `No photo found for code "${otp}". Make sure you complete the game on the kiosk first to generate your code.`,
    };
  } catch (err: any) {
    const status = err?.error?.http_code ?? err?.http_code ?? err?.status;
    const msg = err?.error?.message ?? err?.message ?? "";

    if (status === 404 || msg.toLowerCase().includes("not found")) {
      return {
        success: false,
        error: `No photo found for code "${otp}". Make sure you complete the game on the kiosk first to generate your code.`,
      };
    }

    console.error("[fetchPhoto] Error fetching photo:", err);
    return {
      success: false,
      error: `Photo not found for code "${otp}". Please check the code on your kiosk screen and try again.`,
    };
  }
}
