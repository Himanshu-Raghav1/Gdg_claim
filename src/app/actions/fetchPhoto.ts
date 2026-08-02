"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? "gdg-akinator-polaroids";

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
// Uses the Admin API (resource info) which only runs server-side.
// Falls back to a URL-based approach to avoid needing the Admin API in
// restricted Cloudinary plans.
// ---------------------------------------------------------------------------
export async function fetchPhoto(rawOtp: string): Promise<FetchPhotoResult> {
  const otp = rawOtp.trim().toUpperCase();

  if (!isValidOtp(otp)) {
    return { success: false, error: "Invalid code. Please enter the 6-character code from your kiosk screen." };
  }

  const publicId = `${FOLDER}/polaroid_${otp}`;

  try {
    // Try to verify the asset exists via Admin API
    await cloudinary.api.resource(publicId, { resource_type: "image" });

    // Build a high-quality public URL (no expiry — public asset)
    const imageUrl = cloudinary.url(publicId, {
      resource_type: "image",
      fetch_format: "auto",
      quality: "auto:best",
      secure: true,
    });

    // Build a direct download URL (forces browser download)
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: "image",
      flags: "attachment",
      fetch_format: "png",
      quality: "auto:best",
      secure: true,
    });

    return { success: true, imageUrl, downloadUrl, otp };
  } catch (err: any) {
    // Cloudinary throws an error if the resource is not found
    const status = err?.http_code ?? err?.status;
    if (status === 404) {
      return {
        success: false,
        error: "Photo not found. Please check your code and try again.",
      };
    }
    console.error("[fetchPhoto] Cloudinary error:", err?.message ?? err);
    return {
      success: false,
      error: "Something went wrong. Please try again in a moment.",
    };
  }
}
