import { NextResponse } from "next/server";

/* ========================================
   GET /api/pincode-lookup?pincode=400001
   Uses India Post API to fetch pincode details with timeout and retry
======================================== */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const pincode = url.searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json({ 
        success: false, 
        message: "Pincode is required" 
      }, { status: 400 });
    }

    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return NextResponse.json({ 
        success: false, 
        message: "Please enter a valid 6-digit pincode" 
      }, { status: 400 });
    }

    // Try multiple times with timeout
    let lastError = null;
    const maxRetries = 3;
    const timeoutMs = 5000; // 5 seconds timeout

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        // Call India Post API with timeout
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
          // Add cache: 'no-store' to always get fresh data
          cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data[0] || data[0].Status !== "Success") {
          return NextResponse.json({ 
            success: false, 
            message: data[0]?.Message || "No details found for this pincode" 
          }, { status: 404 });
        }

        const postOffice = data[0].PostOffice[0];
        
        const locationData = {
          pincode: pincode,
          city: postOffice.Name || "",
          district: postOffice.District || "",
          state: postOffice.State || "",
          country: postOffice.Country || "",
          block: postOffice.Block || "",
          region: postOffice.Region || "",
          division: postOffice.Division || "",
          circle: postOffice.Circle || ""
        };

        return NextResponse.json({ 
          success: true, 
          data: locationData 
        }, { status: 200 });

      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed for pincode ${pincode}:`, error.message);
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // If all retries failed
    console.error("All retry attempts failed for pincode:", pincode, lastError);
    return NextResponse.json({ 
      success: false, 
      message: "Unable to fetch pincode details. Please try again later." 
    }, { status: 503 });

  } catch (error) {
    console.error("Pincode lookup error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch pincode details" 
    }, { status: 500 });
  }
}