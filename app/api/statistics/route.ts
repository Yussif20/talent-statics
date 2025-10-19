import { NextResponse } from "next/server";

const API_BASE_URL = "https://virilan362-001-site1.rtempurl.com/api/Reports";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let url = `${API_BASE_URL}/summary`;

    // Add date filters if provided
    if (startDate && endDate) {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: "*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
