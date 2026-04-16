import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import PaymentTerms from './schema';
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

export async function GET(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const data = await PaymentTerms.find({
    companyId: user.companyId,
  }).sort({ name: 1 });

  return NextResponse.json({ success: true, data });
}

export async function POST(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const { name } = await req.json();

  const exists = await PaymentTerms.findOne({
    name,
    companyId: user.companyId,
  });

  if (exists) {
    return NextResponse.json({
      success: false,
      message: 'Payment Term already exists',
    });
  }

  const item = await PaymentTerms.create({
    name,
    companyId: user.companyId,
    createdBy: user.id,
  });

  return NextResponse.json({ success: true, data: item });
}

export async function PUT(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const { id, name } = await req.json();

  const updated = await PaymentTerms.findOneAndUpdate(
    {
      _id: id,
      companyId: user.companyId,
    },
    { name },
    { new: true }
  );

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req) {
  await connectDb();

  const { user, error, status } = await validateUser(req);

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  await PaymentTerms.findOneAndDelete({
    _id: id,
    companyId: user.companyId,
  });

  return NextResponse.json({
    success: true,
    message: 'Deleted Successfully',
  });
}