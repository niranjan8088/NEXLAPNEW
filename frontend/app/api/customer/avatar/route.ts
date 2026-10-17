import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

function getAuthUser(cookieStore: any) {
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;
  if (!userSession) return null;
  const parts = userSession.split(":");
  return { id: parts[1] || parts[0], email: parts[2] || parts[0] };
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Allowed mime types validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed formats: JPG, JPEG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    // Size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file size exceeds the 5MB maximum limit." },
        { status: 400 }
      );
    }

    // Convert file to Base64 Data URL for instant rendering / DB storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Save avatar_url to authenticated user profile
    await dbHelper.profiles.update(authUser.id, { avatar_url: base64Data });

    return NextResponse.json({
      success: true,
      message: "Profile photo uploaded successfully.",
      avatarUrl: base64Data,
    });
  } catch (err: any) {
    console.error("Avatar Upload Error:", err);
    return NextResponse.json({ error: "Failed to upload profile photo." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Remove avatar_url
    await dbHelper.profiles.update(authUser.id, { avatar_url: "" });

    return NextResponse.json({
      success: true,
      message: "Profile photo removed.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to remove photo." }, { status: 500 });
  }
}
