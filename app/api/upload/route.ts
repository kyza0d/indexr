import { extname, join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_\.]/g, "_");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("font") as Blob | null;
  if (!file || typeof file.name !== 'string') {
    return NextResponse.json({ error: "Font file is required." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pathDist: string = join(process.cwd(), "app/fonts"); // Updated path
  const uploadDir = pathDist;

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error("Error creating directory for font upload", e);
      return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
  }

  try {
    const fileExtension = extname(file.name);
    const originalFilename = file.name.replace(/\.[^/.]+$/, "");
    const sanitizedFilename = sanitizeFilename(originalFilename);
    const username = "kyza0d"; // Username for identification
    const filename = `${username}_${sanitizedFilename}${fileExtension}`; // Removed unique suffix
    await writeFile(join(uploadDir, filename), buffer);

    const finalFilePath = `http://localhost:3000/app/fonts/${filename}`;
    return NextResponse.json({ success: "ok", filename: filename, filePath: finalFilePath }, { status: 200 });
  } catch (e) {
    console.error("Error while uploading font", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
