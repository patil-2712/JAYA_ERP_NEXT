import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import PurchaseType from './schema';
import { getTokenFromHeader, verifyJWT } from '@/lib/auth';

async function validateUser(req) {
  const token = getTokenFromHeader(req);

  if (!token) {
    return { error: 'Token missing', status: 401 };
  }

  const user = await verifyJWT(token);

  if (!user) {
    return { error: 'Invalid token', status: 401 };
  }

  return { user };
}

/* GET */
export async function GET(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const data = await PurchaseType.find({
    companyId: user.companyId,
  }).sort({ name: 1 });

  return NextResponse.json({ success: true, data });
}

/* POST */
export async function POST(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const { name } = await req.json();

  const exists = await PurchaseType.findOne({
    name,
    companyId: user.companyId,
  });

  if (exists) {
    return NextResponse.json({
      success: false,
      message: 'Purchase Type already exists',
    });
  }

  const item = await PurchaseType.create({
    name,
    companyId: user.companyId,
    createdBy: user.id,
  });

  return NextResponse.json({ success: true, data: item });
}

/* PUT */
export async function PUT(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const { id, name } = await req.json();

  const updated = await PurchaseType.findOneAndUpdate(
    {
      _id: id,
      companyId: user.companyId,
    },
    { name },
    { new: true }
  );

  return NextResponse.json({ success: true, data: updated });
}

/* DELETE */
export async function DELETE(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  await PurchaseType.findOneAndDelete({
    _id: id,
    companyId: user.companyId,
  });

  return NextResponse.json({
    success: true,
    message: 'Deleted Successfully',
  });
}