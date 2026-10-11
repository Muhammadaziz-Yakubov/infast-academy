import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ShopProduct, ShopOrder } from '@/models/ShopProduct';
import { StudentProgress } from '@/models/StudentProgress';
import { StudentActivity } from '@/models/StudentActivity';
import { getStudentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    // Check if initial products exist, if not seed standard default prizes
    let products = await ShopProduct.find({ isActive: true }).sort({ priceXCoin: 1 }).lean();
    if (products.length === 0) {
      await ShopProduct.create([
        {
          title: "InFast Brendli Futbolka",
          description: "Yuqori sifatli 100% paxta, zamonaviy InFast ramzi tushirilgan futbolka",
          priceXCoin: 150,
          stock: 25,
          category: "MERCH",
        },
        {
          title: "InFast Termos Kosa",
          description: "Issiq va sovuqni 12 soat saqlaydigan metall termos krujka",
          priceXCoin: 100,
          stock: 30,
          category: "ACCESSORY",
        },
        {
          title: "InFast Dasturchi Xudi (Hoodie)",
          description: "Issiq va qulay dasturchilar uchun oversize xudi",
          priceXCoin: 300,
          stock: 15,
          category: "MERCH",
        },
        {
          title: "Mexanik Klaviatura (RGB)",
          description: "Kod yozish uchun maxsus tezkor mexanik klaviatura",
          priceXCoin: 600,
          stock: 5,
          category: "TECH",
        },
        {
          title: "Dasturchi Ryukzaki",
          description: "Noutbuk va aksessuarlar uchun qulay suv o'tkazmaydigan ryukzak",
          priceXCoin: 250,
          stock: 12,
          category: "ACCESSORY",
        },
      ]);
      products = await ShopProduct.find({ isActive: true }).sort({ priceXCoin: 1 }).lean();
    }

    // Get student's current XCoin balance
    const progress = await StudentProgress.findOne({
      studentId: session.id,
      courseId: session.courseId,
    }).lean();

    // Get student's order history
    const myOrders = await ShopOrder.find({ studentId: session.id })
      .populate('productId', 'title priceXCoin category')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      balanceXCoin: progress?.xcoin || 0,
      products,
      orders: myOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Do'kon ma'lumotlarini olishda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Mahsulot tanlanmadi" }, { status: 400 });
    }

    const product = await ShopProduct.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Mahsulot topilmadi yoki sotuvda mavjud emas" }, { status: 404 });
    }

    if (product.stock <= 0) {
      return NextResponse.json({ error: "Kechirasiz, ushbu mahsulot qolmagan" }, { status: 400 });
    }

    const progress = await StudentProgress.findOne({
      studentId: session.id,
      courseId: session.courseId,
    });

    if (!progress) {
      return NextResponse.json({ error: "Talaba balansi topilmadi" }, { status: 404 });
    }

    if (progress.xcoin < product.priceXCoin) {
      return NextResponse.json(
        { error: `Mablag' yetarli emas! Sizda ${progress.xcoin} XCoin bor, mahsulot narxi esa ${product.priceXCoin} XCoin.` },
        { status: 400 }
      );
    }

    // Atomic-like deduction and order creation
    progress.xcoin -= product.priceXCoin;
    await progress.save();

    product.stock -= 1;
    await product.save();

    const order = await ShopOrder.create({
      studentId: session.id,
      productId: product._id,
      priceXCoin: product.priceXCoin,
      status: 'PENDING',
    });

    // Log StudentActivity
    await StudentActivity.create({
      studentId: session.id,
      branchId: session.branchId,
      type: 'COIN_EARNED',
      title: `Do'kondan xarid qilindi: ${product.title}`,
      description: `-${product.priceXCoin} XCoin yechildi. Buyurtma qabul qilindi.`,
      metadata: { orderId: order._id, productId: product._id, cost: product.priceXCoin },
    });

    return NextResponse.json({
      success: true,
      message: `Xarid muvaffaqiyatli amalga oshirildi! "${product.title}" buyurtmangiz administratorga yuborildi.`,
      order,
      newBalanceXCoin: progress.xcoin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xarid qilishda xatolik yuz berdi" }, { status: 500 });
  }
}
