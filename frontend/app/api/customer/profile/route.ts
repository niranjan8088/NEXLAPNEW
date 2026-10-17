import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

function getAuthUser(cookieStore: any) {
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;
  if (!userSession) return null;
  const parts = userSession.split(":");
  if (parts.length >= 3) {
    return { id: parts[1], email: parts[2] };
  }
  if (parts.length === 2 && parts[0] === "mock-user") {
    return { id: parts[1], email: parts[1] };
  }
  return { id: userSession, email: userSession };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const profile = await dbHelper.profiles.getById(authUser.id);
    if (!profile) {
      // Fallback profile if record is being created
      return NextResponse.json({
        profile: {
          id: authUser.id,
          email: authUser.email,
          full_name: "Customer",
          phone: "9876543210",
          date_of_birth: "1998-05-20",
          avatar_url: "",
          gender: "Not Specified",
          address: "Padmanabhanagar",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560070",
          country: "India",
          role: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Never send password or internal security tokens to client
    const { password, reset_token, reset_token_expiry, ...safeProfile } = profile;

    return NextResponse.json({ profile: safeProfile });
  } catch (err: any) {
    console.error("GET Customer Profile Error:", err);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, gender, address, city, state, pincode, country, avatar_url } = body;

    const updates: any = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone.replace(/\D/g, "");
    if (gender !== undefined) updates.gender = gender;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    if (country !== undefined) updates.country = country;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    // Strict Authorization: WHERE id = authenticated_user.id
    const updated = await dbHelper.profiles.update(authUser.id, updates);

    if (fullName) {
      const response = NextResponse.json({
        success: true,
        message: "Profile updated successfully.",
        profile: updated,
      });
      response.cookies.set("nexbyte_customer_name", encodeURIComponent(fullName), {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated,
    });
  } catch (err: any) {
    console.error("PUT Customer Profile Error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
