import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ShopProduct, ShopOrder } from '@/models/ShopProduct';
import { StudentProgress } from '@/models/StudentProgress';
import { getSession } from '@/lib/auth';

// GET all products and recent orders for admin
export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const products = await ShopProduct.find().sort({ createdAt: -1 }).lean();
    const orders = await ShopOrder.find()
      .populate('studentId', 'firstName lastName phone studentCode')
      .populate('productId', 'title priceXCoin category imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      products,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Admin do'kon ma'lumotlarini olishda xatolik" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Faqat Super Admin mahsulot qo'sha oladi" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { title, description, priceXCoin, stock, category, imageUrl } = body;

    if (!title || !priceXCoin) {
      return NextResponse.json(
        { error: "Mahsulot nomi va narxi (XCoin) kiritilishi shart" },
        { status: 400 }
      );
    }

    const newProduct = await ShopProduct.create({
      title,
      description: description || 'InFast IT-Academy sovg‘asi',
      priceXCoin: Number(priceXCoin),
      stock: Number(stock || 10),
      category: category || 'MERCH',
      imageUrl: imageUrl || '',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Yangi mahsulot do'konga qo'shildi!",
      product: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Mahsulot yaratishda xatolik" },
      { status: 500 }
    );
  }
}

// PATCH update order status (FULFILLED, CANCELLED) or product
export async function PATCH(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { orderId, status, productId, isActive, stock, priceXCoin } = body;

    // 1. Update order status
    if (orderId && status) {
      const order = await ShopOrder.findById(orderId);
      if (!order) {
        return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
      }

      // If cancelling order, refund XCoins to student
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        await StudentProgress.findOneAndUpdate(
          { studentId: order.studentId },
          { $inc: { xcoin: order.priceXCoin } }
        );
        // Return product stock
        await ShopProduct.findByIdAndUpdate(order.productId, { $inc: { stock: 1 } });
      }

      order.status = status;
      await order.save();

      return NextResponse.json({
        success: true,
        message: `Buyurtma holati "${status}" ga o'zgartirildi`,
        order,
      });
    }

    // 2. Update product
    if (productId) {
      const updated = await ShopProduct.findByIdAndUpdate(
        productId,
        {
          ...(isActive !== undefined && { isActive }),
          ...(stock !== undefined && { stock: Number(stock) }),
          ...(priceXCoin !== undefined && { priceXCoin: Number(priceXCoin) }),
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: "Mahsulot yangilandi",
        product: updated,
      });
    }

    return NextResponse.json({ error: "Parametrlar yetarli emas" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Yangilashda xatolik" },
      { status: 500 }
    );
  }
}

// DELETE product from shop
export async function DELETE(request: Request) {
  try {
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Faqat Super Admin mahsulotni o'chira oladi" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: "Mahsulot ID si ko'rsatilmadi" }, { status: 400 });
    }

    await ShopProduct.findByIdAndDelete(productId);

    return NextResponse.json({
      success: true,
      message: "Mahsulot muvaffaqiyatli o'chirildi",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Mahsulotni o'chirishda xatolik" },
      { status: 500 }
    );
  }
}

