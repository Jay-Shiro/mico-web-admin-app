import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/admins`, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields and trim values
    const requiredFields = ["username", "role", "email", "password"];
    const validationErrors = [];

    for (const field of requiredFields) {
      if (!body[field]?.trim()) {
        validationErrors.push(`${field} is required`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          detail: validationErrors.map((msg) => ({ msg })),
        },
        { status: 422 }
      );
    }

    // Convert to FormData
    const formData = new URLSearchParams();
    formData.append("username", body.username.trim());
    formData.append("email", body.email.trim());
    formData.append("password", body.password.trim());
    formData.append("role", body.role.trim().toLowerCase());

    const response = await fetch(`${BASE_URL}/admin/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    const responseText = await response.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error("Failed to parse response:", responseText);
      return NextResponse.json(
        { error: "Invalid server response", detail: responseText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      const errorMessage =
        data.detail?.[0]?.msg || data.detail || "Failed to create admin";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Admin created successfully",
      data,
    });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
