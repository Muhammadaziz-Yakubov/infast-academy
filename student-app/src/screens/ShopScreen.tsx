import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import { Coins, Sparkles, Gift, CheckCircle2, PackageCheck } from 'lucide-react-native';

export default function ShopScreen() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/student/shop');
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Shop fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBuy = (product: any) => {
    if ((data?.balanceXCoin || 0) < product.priceXCoin) {
      Alert.alert(
        'Tangalar yetarli emas',
        `Sizda ${data?.balanceXCoin || 0} XCoin bor. Ushbu sovg'a narxi esa ${product.priceXCoin} XCoin. Darslar, tadbirlar va testlarni topshirib ko'proq tanga to'plang!`
      );
      return;
    }

    Alert.alert(
      'Xaridni tasdiqlash',
      `"${product.title}" mahsulotini ${product.priceXCoin} XCoin evaziga xarid qilishni xohlaysizmi?\n\nBuyurtmangiz admin tomonidan qabul qilinadi va sizga topshiriladi.`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Sotib olish',
          onPress: async () => {
            try {
              setPurchasingId(product._id);
              const res = await apiRequest('/api/student/shop', {
                method: 'POST',
                body: { productId: product._id },
              });
              if (res.success) {
                Alert.alert('🎉 Xarid amalga oshirildi!', res.message);
                fetchShop();
              }
            } catch (err: any) {
              Alert.alert('Xatolik', err.message || 'Xarid amalga oshmadi');
            } finally {
              setPurchasingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Do'kon yuklanmoqda...</Text>
      </View>
    );
  }

  const products = data?.products || [];
  const orders = data?.orders || [];
  const balance = data?.balanceXCoin || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchShop();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Apple Large Title Header */}
      <View style={styles.header}>
        <Text style={styles.categoryLabel}>SOVG'ALAR VA AKSESSUARLAR</Text>
        <Text style={styles.largeTitle}>Do'kon</Text>
      </View>

      {/* Apple Wallet Style Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceLeft}>
          <View style={styles.coinIconCircle}>
            <Coins size={22} color="#FFD60A" />
          </View>
          <View>
            <Text style={styles.balanceLabel}>XCoin Balansingiz</Text>
            <Text style={styles.balanceValue}>{balance} XCoin</Text>
          </View>
        </View>
        <View style={styles.balanceTag}>
          <Sparkles size={13} color="#FFD60A" />
          <Text style={styles.balanceTagText}>Jonli hisob</Text>
        </View>
      </View>

      {/* Product Catalog Grid (1 qatorda 2 tadan yoki nafis visual card) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MAVSUMIY SOVG'ALAR ({products.length})</Text>
      </View>

      <View style={styles.productsGrid}>
        {products.map((product: any) => {
          const canAfford = balance >= product.priceXCoin;
          const isBuying = purchasingId === product._id;
          const inStock = (product.stock || 0) > 0;

          return (
            <View key={product._id} style={styles.productCard}>
              {/* Product Photo */}
              <View style={styles.productImageWrapper}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={styles.productPlaceholder}>
                    <Gift size={32} color="#FF9500" />
                  </View>
                )}
                <View style={styles.stockBadge}>
                  <Text style={styles.stockBadgeText}>
                    {inStock ? `${product.stock} dona` : 'Tugagan'}
                  </Text>
                </View>
              </View>

              {/* Product Details */}
              <View style={styles.productInfoCol}>
                <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description || "InFast IT-Academy dasturchilar uchun original mahsuloti"}
                </Text>
              </View>

              {/* Buy Row */}
              <View style={styles.productFooter}>
                <View style={styles.priceRow}>
                  <Coins size={14} color="#FFD60A" />
                  <Text style={styles.priceText}>{product.priceXCoin}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    (!canAfford || !inStock) && styles.buyBtnDisabled,
                  ]}
                  disabled={isBuying || !canAfford || !inStock}
                  onPress={() => handleBuy(product)}
                  activeOpacity={0.8}
                >
                  {isBuying ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={[styles.buyBtnText, (!canAfford || !inStock) && styles.buyBtnTextDisabled]}>
                      {!inStock ? "Tugagan" : "Olish"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Orders Inset Grouped Card */}
      {orders.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BUYURTMALAR TARIXI</Text>
          </View>

          <View style={styles.groupedCard}>
            {orders.map((order: any, idx: number) => {
              const isFulfilled = order.status === 'FULFILLED';
              const isCancelled = order.status === 'CANCELLED';

              return (
                <React.Fragment key={order._id || idx}>
                  {idx > 0 && <View style={styles.separator} />}

                  <View style={styles.orderRow}>
                    <View style={styles.orderLeftCol}>
                      {order.productId?.imageUrl ? (
                        <Image source={{ uri: order.productId.imageUrl }} style={styles.orderThumb} />
                      ) : (
                        <View style={styles.orderThumbPlaceholder}>
                          <PackageCheck size={18} color="#FF9500" />
                        </View>
                      )}
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderTitle} numberOfLines={1}>
                          {order.productId?.title || order.productTitle || "Mahsulot"}
                        </Text>
                        <Text style={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('uz-UZ')} • {order.priceXCoin} XCoin
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.orderBadge,
                        isFulfilled
                          ? styles.orderBadgeSuccess
                          : isCancelled
                          ? styles.orderBadgeCancelled
                          : styles.orderBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderBadgeText,
                          isFulfilled
                            ? styles.orderBadgeTextSuccess
                            : isCancelled
                            ? styles.orderBadgeTextCancelled
                            : styles.orderBadgeTextPending,
                        ]}
                      >
                        {isFulfilled ? "Yetkazildi" : isCancelled ? "Bekor qilingan" : "Kutilmoqda"}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Apple OLED True Black
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  balanceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 214, 10, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  balanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  balanceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD60A',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  /* 2-columns Product Grid */
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    ...APPLE_SHADOW,
  },
  productImageWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: '#2C2C2E',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productInfoCol: {
    padding: 12,
    paddingBottom: 6,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  productDescription: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFD60A',
  },
  buyBtn: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  buyBtnTextDisabled: {
    color: '#636366',
  },
  groupedCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  orderLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  orderThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
  },
  orderThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  orderDate: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  orderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderBadgeSuccess: {
    backgroundColor: 'rgba(48, 209, 88, 0.16)',
  },
  orderBadgePending: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
  },
  orderBadgeCancelled: {
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderBadgeTextSuccess: {
    color: '#30D158',
  },
  orderBadgeTextPending: {
    color: '#FF9500',
  },
  orderBadgeTextCancelled: {
    color: '#FF453A',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 60,
  },
});
