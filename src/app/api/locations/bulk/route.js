import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Location from "../schema";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("location")
  );
}

async function validateUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return { error: "Token missing", status: 401 };

  try {
    const user = await verifyJWT(token);
    if (!user) return { error: "Invalid token", status: 401 };
    if (!isAuthorized(user)) return { error: "Unauthorized", status: 403 };
    return { user, error: null, status: 200 };
  } catch (err) {
    console.error("JWT Verification Failed:", err);
    return { error: "Invalid token", status: 401 };
  }
}

// POST /api/locations/bulk
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { names } = await req.json();

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Please provide an array of location names" 
      }, { status: 400 });
    }

    // Remove duplicates and empty strings
    const uniqueNames = [...new Set(names.map(name => name.trim()).filter(name => name.length > 0))];
    
    if (uniqueNames.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No valid location names provided" 
      }, { status: 400 });
    }

    // Find existing locations
    const existingLocations = await Location.find({
      companyId: user.companyId,
      name: { $in: uniqueNames }
    });

    const existingNames = new Set(existingLocations.map(loc => loc.name));
    const newNames = uniqueNames.filter(name => !existingNames.has(name));
    
    if (newNames.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "All provided location names already exist" 
      }, { status: 400 });
    }

    // Bulk insert
    const locationsToInsert = newNames.map(name => ({
      name: name,
      companyId: user.companyId,
      createdBy: user.id,
      isActive: true
    }));

    const result = await Location.insertMany(locationsToInsert, { ordered: false });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${result.length} locations`,
      addedCount: result.length,
      failedCount: uniqueNames.length - result.length,
      skippedNames: Array.from(existingNames),
      data: result
    }, { status: 201 });
    
  } catch (error) {
    console.error("POST /locations/bulk error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Some locations already exist in the system"
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to add locations" 
    }, { status: 500 });
  }
}