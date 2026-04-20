import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import Customer from "@/models/CustomerModel";
import CompanyUser from "@/models/CompanyUser";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Import BankHead model if you need it for population
// If you don't have BankHead model, comment out the population
// import BankHead from "@/models/BankHead";

export const runtime = "nodejs";

/* -------------------------------
   🔐 Role-Based Access Check
-------------------------------- */
function isAuthorized(user) {
  if (!user) return false;

  if (user.type === "company") return true;

  const allowedRoles = [
    "admin",
    "crm",
    "sales manager",
    "purchase manager",
    "inventory manager",
    "accounts manager",
    "hr manager",
    "support executive",
    "production head",
    "project manager",
  ];

  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : [];

  return userRoles.some(role =>
    allowedRoles.includes(role.trim().toLowerCase())
  );
}

/* ✅ Validate User Helper */
async function validateUser(req) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return { error: "No token provided", status: 401 };

    const decoded = verifyJWT(token);
    if (!decoded) return { error: "Invalid token", status: 401 };

    return { user: decoded, error: null, status: 200 };
  } catch (err) {
    console.log("validateUser error:", err);
    return { error: "Authentication failed", status: 401 };
  }
}

export async function GET(req) {
  await dbConnect();

  const { user, error, status } = await validateUser(req);
  if (error)
    return NextResponse.json({ success: false, message: error }, { status });

  if (!isAuthorized(user)) {
    return NextResponse.json(
      { success: false, message: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    // ✅ OPTION 1: Remove population if BankHead model doesn't exist
    const customers = await Customer.find({
      companyId: user.companyId,
    })
    .populate("assignedAgents", "name email")
    // .populate("glAccount", "accountName accountCode"); // ❌ Comment this out if BankHead missing

    // ✅ OPTION 2: Or populate without selecting specific fields
    // .populate("glAccount");

    return NextResponse.json({ success: true, data: customers }, { status: 200 });
  } catch (err) {
    console.error("GET /customers error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

/* ========================================
   ✏️ POST /api/customers
======================================== */
export async function POST(req) {
  await dbConnect();

  try {
    const token = getTokenFromHeader(req);
    const user = await verifyJWT(token);

    if (!user || !isAuthorized(user)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ success: false, message: "Invalid content type" }, { status: 400 });
    }

    const body = await req.json();

    // Auto-generate customer code
    const lastCustomer = await Customer.findOne({ 
      companyId: user.companyId 
    }).sort({ customerCode: -1 }).limit(1);
    
    let nextCode = "CUST-0001";
    if (lastCustomer && lastCustomer.customerCode) {
      const match = lastCustomer.customerCode.match(/\d+$/);
      if (match) {
        const lastNum = parseInt(match[0], 10);
        nextCode = `CUST-${String(lastNum + 1).padStart(4, "0")}`;
      }
    }

    // Remove customerCode from body if sent
    const { customerCode, ...customerData } = body;

    const customer = new Customer({
      ...customerData,
      customerCode: nextCode,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await customer.save();

    // ✅ Remove population or fix it
    const populated = await Customer.findById(customer._id)
      .populate("assignedAgents", "name email");
      // .populate("glAccount"); // ❌ Comment out if BankHead missing

    return NextResponse.json({ success: true, data: populated }, { status: 201 });

  } catch (error) {
    console.error("POST /customers error:", error);
    
    if (error.code === 11000) {
      if (error.message.includes("customer code")) {
        return NextResponse.json({ 
          success: false, 
          message: "Customer code already exists. Please try again." 
        }, { status: 409 });
      } else if (error.message.includes("email")) {
        return NextResponse.json({ 
          success: false, 
          message: "Email already registered for this company" 
        }, { status: 409 });
      }
      return NextResponse.json({ 
        success: false, 
        message: "Duplicate entry. Please check customer data." 
      }, { status: 409 });
    }
    
    return NextResponse.json({ success: false, message: "Failed to create customer" }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db.js";
// import Customer from "@/models/CustomerModel";

// export async function GET() {
//   await dbConnect();
//   const customers = await Customer.find({})
//   return NextResponse.json(customers);
// }
// export async function POST(req) {
//   await dbConnect();
//   try {
//     const body = await req.json();
//     // const data = await req.json();
//     console.log("Received customer data:", body);
//     const customer = new Customer(body);
//     await customer.save();
//     const populated = await Customer.findById(customer._id).populate("glAccount");
//     return NextResponse.json(populated, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ message: error.message }, { status: 500 });
//   }
// }































































// export async function GET() {
//   await dbConnect();
//   try {
//     // const customers = await Customer.find({});
//     const customers = await Customer.find().populate("glAccount");
//   return NextResponse.json(customers);
   
//   } catch (error) {
//     return NextResponse.json({ error: "Error fetching customers" }, { status: 400 });
//   }
// }

// export async function POST(req) {
//   await dbConnect();
//   try {
//     const data = await req.json();
//     console.log('Received customer data:', data);
//     const customer = await Customer.create(data);
//     return NextResponse.json(customer, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: "Error creating customer" }, { status: 400 });
//   }
// }
