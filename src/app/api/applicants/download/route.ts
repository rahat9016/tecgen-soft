import { NextRequest, NextResponse } from "next/server";

const sanitizeFilename = (filename: string) =>
  filename.replace(/[\\/\r\n"]/g, "_").trim() || "resume.pdf";

const getFilenameFromContentDisposition = (
  contentDisposition: string | null
) => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] || null;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const preferredFilename = searchParams.get("filename");

  if (!fileUrl) {
    return NextResponse.json(
      { message: "File URL is required" },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    return NextResponse.json({ message: "Invalid file URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { message: "Invalid URL protocol" },
      { status: 400 }
    );
  }

  const authorization = request.headers.get("authorization");

  const upstreamResponse = await fetch(parsedUrl.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      ...(authorization ? { Authorization: authorization } : {}),
    },
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { message: "Failed to fetch file" },
      { status: upstreamResponse.status }
    );
  }

  const contentType =
    upstreamResponse.headers.get("content-type") || "application/octet-stream";
  const contentDisposition = upstreamResponse.headers.get(
    "content-disposition"
  );

  const fallbackName =
    decodeURIComponent(parsedUrl.pathname.split("/").pop() || "resume.pdf") ||
    "resume.pdf";

  const fileName = sanitizeFilename(
    preferredFilename ||
      getFilenameFromContentDisposition(contentDisposition) ||
      fallbackName
  );

  if (upstreamResponse.body) {
    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const fileBuffer = await upstreamResponse.arrayBuffer();

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
