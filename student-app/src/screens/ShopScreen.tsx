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
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import { Coins, Sparkles, Gift } from 'lucide-react-native';

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
        `Sizda ${data?.balanceXCoin || 0} XCoin bor. Ushbu sovg'a narxi esa ${product.priceXCoin} XCoin. Darslar va testlarni topshirib ko'proq tanga to'plang!`
      );
      return;
    }

    Alert.alert(
      'Xaridni tasdiqlash',
      `"${product.title}" mahsulotini ${product.priceXCoin} XCoin evaziga xarid qilishni xohlaysizmi?`,
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

      {/* Product Catalog */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MAVSUMIY SOVG'ALAR</Text>
      </View>

      <View style={styles.productsContainer}>
        {products.map((product: any) => {
          const canAfford = balance >= product.priceXCoin;
          const isBuying = purchasingId === product._id;

          return (
            <View key={product._id} style={styles.productCard}>
              <View style={styles.productIconBox}>
                <Gift size={28} color="#FFD60A" />
              </View>

              <View style={styles.productInfoCol}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description || "InFast IT-Academy dasturchilar uchun original mahsuloti"}
                </Text>
                <Text style={styles.stockText}>Qoldiq: {product.stock || 10} dona</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.buyPillButton,
                  !canAfford && styles.buyPillButtonDisabled,
                ]}
                disabled={isBuying || !canAfford}
                onPress={() => handleBuy(product)}
                activeOpacity={0.7}
              >
                {isBuying ? (
                  <ActivityIndicator size="small" color="#FFD60A" />
                ) : (
                  <Text style={[styles.buyPillText, !canAfford && styles.buyPillTextDisabled]}>
                    {product.priceXCoin} 🪙
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Orders Inset Grouped Card */}
      {orders.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>XARIDLAR TARIXI</Text>
          </View>

          <View style={styles.groupedCard}>
            {orders.map((order: any, idx: number) => {
              const isFulfilled = order.status === 'FULFILLED';

              return (
                <React.Fragment key={order._id || idx}>
                  {idx > 0 && <View style={styles.separator} />}

                  <View style={styles.orderRow}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle}>{order.productTitle || "Mahsulot"}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('uz-UZ')} • {order.priceXCoin} XCoin
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.orderBadge,
                        isFulfilled ? styles.orderBadgeSuccess : styles.orderBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderBadgeText,
                          isFulfilled ? styles.orderBadgeTextSuccess : styles.orderBadgeTextPending,
                        ]}
                      >
                        {isFulfilled ? "Yetkazildi" : "Kutilmoqda"}
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
  productsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  productIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 214, 10, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  productInfoCol: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  productDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 16,
  },
  stockText: {
    fontSize: 11,
    color: '#636366',
    marginTop: 4,
    fontWeight: '600',
  },
  buyPillButton: {
    backgroundColor: '#FFD60A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyPillButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  buyPillText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  buyPillTextDisabled: {
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
    padding: 16,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  orderDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  orderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  orderBadgeSuccess: {
    backgroundColor: 'rgba(48, 209, 88, 0.16)',
  },
  orderBadgePending: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
  },
  orderBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderBadgeTextSuccess: {
    color: '#30D158',
  },
  orderBadgeTextPending: {
    color: '#FF9500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 16,
  },
});
