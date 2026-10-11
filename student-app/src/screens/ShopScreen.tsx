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
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING } from '../constants/theme';
import { ShoppingBag, Coins, Sparkles, Check, PackageCheck } from 'lucide-react-native';

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
        'Mablag‘ yetarli emas',
        `Sizda ${data?.balanceXCoin || 0} XCoin bor. Ushbu mahsulot narxi esa ${product.priceXCoin} XCoin. Darslar va testlarni bajarib ko‘proq tanga yig‘ing!`
      );
      return;
    }

    Alert.alert(
      'Xaridni tasdiqlash',
      `"${product.title}" mahsulotini ${product.priceXCoin} XCoin evaziga xarid qilishni xohlaysizmi?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, sotib olish',
          onPress: async () => {
            try {
              setPurchasingId(product._id);
              const res = await apiRequest('/api/student/shop', {
                method: 'POST',
                body: { productId: product._id },
              });
              if (res.success) {
                Alert.alert('🎉 Xarid muvaffaqiyatli!', res.message);
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
        <ActivityIndicator size="large" color={COLORS.primary} />
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchShop(); }} colors={[COLORS.primary]} />
      }
    >
      {/* Balance Top Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Mavjud Balans</Text>
            <Text style={styles.balanceValue}>{balance} XCoin</Text>
          </View>
          <View style={styles.coinIconCircle}>
            <Coins size={28} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.balanceSubtitle}>
          Tangalaringizni esdalik sovg'alar va texnik mahsulotlarga almashtiring!
        </Text>
      </View>

      {/* Product Catalog Grid */}
      <Text style={styles.sectionTitle}>Sovg'alar Katalogi</Text>

      <View style={styles.productsGrid}>
        {products.map((item: any) => {
          const isBuying = purchasingId === item._id;
          const canAfford = balance >= item.priceXCoin;

          return (
            <View key={item._id} style={styles.productCard}>
              <View style={styles.productBadge}>
                <Text style={styles.productBadgeText}>{item.category}</Text>
              </View>

              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.priceRow}>
                <Coins size={16} color="#D97706" />
                <Text style={styles.priceText}>{item.priceXCoin} XCoin</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.buyBtn,
                  !canAfford && styles.buyBtnDisabled,
                ]}
                disabled={isBuying || item.stock <= 0}
                onPress={() => handleBuy(item)}
                activeOpacity={0.8}
              >
                {isBuying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buyBtnText}>
                    {item.stock <= 0 ? "Qolmagan" : "Sotib olish"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Orders History */}
      {orders.length > 0 && (
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Mening Buyurtmalarim</Text>
          {orders.map((ord: any) => (
            <View key={ord._id} style={styles.orderCard}>
              <PackageCheck size={20} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={styles.orderTitle}>{ord.productId?.title || "Mahsulot"}</Text>
                <Text style={styles.orderMeta}>
                  {ord.priceXCoin} XCoin &bull; {new Date(ord.createdAt).toLocaleDateString('uz-UZ')}
                </Text>
              </View>
              <View style={styles.orderStatusBadge}>
                <Text style={styles.orderStatusText}>{ord.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#D97706',
    borderRadius: 24,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#FEF3C7',
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  coinIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: SPACING.md,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  productBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.surface,
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ordersSection: {
    marginTop: SPACING.xl,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  orderMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  orderStatusBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
});
