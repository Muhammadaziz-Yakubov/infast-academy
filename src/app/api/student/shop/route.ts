import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ShopProduct, ShopOrder } from '@/models/ShopProduct';
import { StudentProgress } from '@/models/StudentProgress';
import { StudentActivity } from '@/models/StudentActivity';
import { getStudentSession } from '@/lib/auth';

const DEFAULT_SEEDS = [
  {
    title: "InFast Brendli Futbolka",
    description: "Yuqori sifatli 100% paxta, zamonaviy InFast ramzi tushirilgan qora futbolka",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    priceXCoin: 150,
    stock: 25,
    category: "MERCH",
  },
  {
    title: "InFast Termos Kosa",
    description: "Issiq va sovuqni 12 soat saqlaydigan metall termos krujka",
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=400&q=80",
    priceXCoin: 100,
    stock: 30,
    category: "ACCESSORY",
  },
  {
    title: "InFast Dasturchi Xudi (Hoodie)",
    description: "Issiq va qulay dasturchilar uchun premium oversize xudi",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
    priceXCoin: 300,
    stock: 15,
    category: "MERCH",
  },
  {
    title: "Mexanik Klaviatura (RGB)",
    description: "Kod yozish uchun maxsus tezkor Blue-Switch mexanik klaviatura",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    priceXCoin: 600,
    stock: 5,
    category: "TECH",
  },
  {
    title: "Dasturchi Ryukzaki",
    description: "Noutbuk va aksessuarlar uchun qulay suv o'tkazmaydigan ryukzak",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80",
    priceXCoin: 250,
    stock: 12,
    category: "ACCESSORY",
  },
];

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    // Check products in DB, seed if empty
    let products = await ShopProduct.find({ isActive: true }).sort({ priceXCoin: 1 }).lean();
    if (products.length === 0) {
      await ShopProduct.insertMany(DEFAULT_SEEDS);
      products = await ShopProduct.find({ isActive: true }).sort({ priceXCoin: 1 }).lean();
    } else {
      // Ensure existing seeded items also have imageUrl if missing
      for (const p of products) {
        if (!p.imageUrl) {
          const match = DEFAULT_SEEDS.find((s) => s.title === p.title);
          if (match) {
            await ShopProduct.findByIdAndUpdate(p._id, { imageUrl: match.imageUrl });
          }
        }
      }
      products = await ShopProduct.find({ isActive: true }).sort({ priceXCoin: 1 }).lean();
    }

    // Get student's current XCoin balance
    const progress = await StudentProgress.findOne({
      studentId: session.id,
    }).lean();

    // Get student's order history
    const myOrders = await ShopOrder.find({ studentId: session.id })
      .populate('productId', 'title priceXCoin category imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      balanceXCoin: progress?.xcoin || 0,
      products,
      orders: myOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Do'kon ma'lumotlarini olishda xatolik" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Mahsulot topilmadi yoki faol emas" }, { status: 404 });
    }

    if (product.stock <= 0) {
      return NextResponse.json({ error: "Ushbu mahsulot do'konda qolmagan" }, { status: 400 });
    }

    const progress = await StudentProgress.findOne({ studentId: session.id });
    if (!progress || (progress.xcoin || 0) < product.priceXCoin) {
      return NextResponse.json(
        {
          error: `Tangalaringiz yetarli emas. Sizda ${progress?.xcoin || 0} XCoin bor, mahsulot narxi esa ${product.priceXCoin} XCoin.`,
        },
        { status: 400 }
      );
    }

    // Deduct coins & reduce stock
    progress.xcoin = (progress.xcoin || 0) - product.priceXCoin;
    await progress.save();

    product.stock = product.stock - 1;
    await product.save();

    // Create Order
    const order = await ShopOrder.create({
      studentId: session.id,
      productId: product._id,
      priceXCoin: product.priceXCoin,
      status: "PENDING",
    });

    // Record activity
    await StudentActivity.create({
      studentId: session.id,
      type: "SHOP_PURCHASE",
      title: `Do'kondan xarid: ${product.title}`,
      description: `${product.priceXCoin} XCoin evaziga "${product.title}" buyurtma berildi. Administrator tekshiruvida.`,
      rewardXCoin: -product.priceXCoin,
      metadata: { orderId: order._id, productId: product._id },
    });

    return NextResponse.json({
      success: true,
      message: `"${product.title}" uchun buyurtmangiz qabul qilindi! Administrator uni tez orada topshiradi.`,
      order,
      remainingXCoin: progress.xcoin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Xarid jarayonida xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
