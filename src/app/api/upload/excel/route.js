//import { writeFile, mkdir } from "fs/promises";
//import path from "path";
//
//export const dynamic = "force-dynamic";
//export const runtime = "nodejs";
//
//export async function POST(req) {
//  try {
//    const formData = await req.formData();
//    const file = formData.get("file");
//
//    if (!file) {
//      return new Response(
//        JSON.stringify({ success: false, error: "No file uploaded" }),
//        { status: 400 }
//      );
//    }
//
//    const arrayBuffer = await file.arrayBuffer();
//    const buffer = Buffer.from(arrayBuffer);
//
//    // ✅ FIX: Use /tmp for serverless, /uploads for local
//    const uploadDir = process.env.VERCEL
//      ? "/tmp"
//      : path.join(process.cwd(), "uploads");
//
//    // Ensure folder exists
//    await mkdir(uploadDir, { recursive: true });
//
//    const filename = Date.now() + "-" + file.name;
//    const filepath = path.join(uploadDir, filename);
//
//    // Write to disk
//    await writeFile(filepath, buffer);
//
//    return new Response(
//      JSON.stringify({
//        success: true,
//
//        // Public path (only works locally or if mapped)
//        filePath: process.env.VERCEL ? null : `/uploads/${filename}`,
//
//        // Actual path on server (this is what failed before)
//        fullPath: filepath
//      }),
//      { status: 200 }
//    );
//
//  } catch (err) {
//    console.error("UPLOAD ERROR:", err);
//
//    return new Response(
//      JSON.stringify({ success: false, error: err.message }),
//      { status: 500 }
//    );
//  }
//}

/////avdhut///////
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    console.log("📤 Upload API started");
    
    const formData = await req.formData();
    console.log("✅ FormData received");
    
    const file = formData.get("file");
    const section = formData.get("section") || "general";
    const field = formData.get("field") || "file";

    if (!file) {
      console.log("❌ No file in request");
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log(`📁 File details:`, {
      name: file.name,
      type: file.type,
      size: file.size,
      section,
      field
    });

    // Determine upload type based on section or field
    let uploadType = section;
    if (field === "memo") {
      uploadType = "memo";
    } else if (field === "voice") {
      uploadType = "voice";
    }

    // File type validation based on upload type
    if (uploadType === "memo") {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Only PDF and image files are allowed for memos" },
          { status: 400 }
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Memo file size should be less than 5MB" },
          { status: 400 }
        );
      }
    } else if (uploadType === "voice") {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Only audio files are allowed for voice notes" },
          { status: 400 }
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Audio file size should be less than 10MB" },
          { status: 400 }
        );
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`✅ Buffer created: ${buffer.length} bytes`);

    // Create upload directory in public folder
    const uploadDir = path.join(process.cwd(), "public", "uploads", uploadType);
    console.log(`📂 Upload directory: ${uploadDir}`);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    console.log(`✅ Directory ensured`);

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeFileName}`;
    const filepath = path.join(uploadDir, filename);
    console.log(`💾 Saving to: ${filepath}`);

    // Save file
    await writeFile(filepath, buffer);
    console.log(`✅ File saved successfully`);

    // Return public URL path
    const publicPath = `/uploads/${uploadType}/${filename}`;
    const fullPath = path.join(process.cwd(), "public", "uploads", uploadType, filename);

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      fullPath: fullPath,
      filename: filename,
      section: uploadType,
      field,
      message: "File uploaded successfully"
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Upload API is working" 
  });
}


/////avdhut/////
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return new Response(JSON.stringify({ success: false, error: "No file uploaded" }), {
//         status: 400,
//       });
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // SAFE UPLOAD DIRECTORY
//     const uploadDir = path.join(process.cwd(), "uploads");

//     // Ensure folder exists
//     await mkdir(uploadDir, { recursive: true });

//     // Save filename
//     const filename = Date.now() + "-" + file.name;
//     const filepath = path.join(uploadDir, filename);

//     // Write to disk
//     await writeFile(filepath, buffer);

//     return new Response(
//       JSON.stringify({
//         success: true,
//         filePath: `/uploads/${filename}`, // << saved for DB
//         fullPath: filepath, // useful for CRON debugging
//       }),
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("UPLOAD ERROR:", err);
//     return new Response(
//       JSON.stringify({ success: false, error: err.message }),
//       { status: 500 }
//     );
//   }
// }
