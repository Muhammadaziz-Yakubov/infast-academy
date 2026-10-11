import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import { Trophy, Award, Flame, Sparkles } from 'lucide-react-native';

export default function LeaderboardScreen() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scope, setScope] = useState<'course' | 'all'>('course');

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/student/leaderboard?scope=${scope}`);
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Leaderboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Reyting yuklanmoqda...</Text>
      </View>
    );
  }

  const leaderboard = data?.leaderboard || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }} tintColor={COLORS.primary} />
      }
    >
      {/* Apple Large Title Header */}
      <View style={styles.header}>
        <Text style={styles.categoryLabel}>PESHQADAMLAR</Text>
        <Text style={styles.largeTitle}>Reyting</Text>
      </View>

      {/* Apple iOS Segmented Control */}
      <View style={styles.segmentedControlContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, scope === 'course' && styles.segmentBtnActive]}
            onPress={() => setScope('course')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, scope === 'course' && styles.segmentTextActive]}>
              Mening Kursim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, scope === 'all' && styles.segmentBtnActive]}
            onPress={() => setScope('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, scope === 'all' && styles.segmentTextActive]}>
              Barcha Filiallar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User's Current Rank Card (Apple Widget) */}
      <View style={styles.myRankCard}>
        <View style={styles.myRankLeft}>
          <View style={styles.myRankBadge}>
            <Trophy size={18} color="#FF9500" />
          </View>
          <View>
            <Text style={styles.myRankLabel}>Sizning o'rningiz</Text>
            <Text style={styles.myRankSub}>Barcha topshirilgan darslar va testlar asosida</Text>
          </View>
        </View>
        <Text style={styles.myRankValue}>#{data?.myRank || 1}</Text>
      </View>

      {/* Leaderboard Inset Grouped Table */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PESHQADAMLAR RO'YXATI</Text>
      </View>

      <View style={styles.groupedCard}>
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Reyting ma'lumotlari mavjud emas</Text>
          </View>
        ) : (
          leaderboard.map((item: any, idx: number) => {
            const isTop1 = item.rank === 1;
            const isTop2 = item.rank === 2;
            const isTop3 = item.rank === 3;

            return (
              <React.Fragment key={item._id || idx}>
                {idx > 0 && <View style={styles.separator} />}

                <View style={[styles.rankRow, item.isCurrentStudent && styles.rankRowCurrent]}>
                  {/* Rank Badge */}
                  <View style={[
                    styles.rankNumberBox,
                    isTop1 && styles.rankGold,
                    isTop2 && styles.rankSilver,
                    isTop3 && styles.rankBronze,
                  ]}>
                    <Text style={[
                      styles.rankNumberText,
                      (isTop1 || isTop2 || isTop3) && styles.rankTopText,
                    ]}>
                      {item.rank}
                    </Text>
                  </View>

                  {/* Avatar */}
                  <View style={[
                    styles.avatar,
                    isTop1 ? { backgroundColor: '#FF9500' } : { backgroundColor: '#E5E5EA' }
                  ]}>
                    <Text style={[
                      styles.avatarText,
                      isTop1 ? { color: '#FFFFFF' } : { color: '#000000' }
                    ]}>
                      {item.firstName?.[0] || 'O'}{item.lastName?.[0] || 'Q'}
                    </Text>
                  </View>

                  {/* Name and Group */}
                  <View style={styles.nameCol}>
                    <Text style={styles.studentName} numberOfLines={1}>
                      {item.firstName} {item.lastName}
                      {item.isCurrentStudent && " (Siz)"}
                    </Text>
                    <Text style={styles.groupMeta} numberOfLines={1}>
                      {item.groupName || item.branchName || "InFast Student"}
                    </Text>
                  </View>

                  {/* XP Capsule */}
                  <View style={styles.xpCapsule}>
                    <Flame size={13} color="#FF9500" />
                    <Text style={styles.xpText}>{item.xp || 0} XP</Text>
                  </View>
                </View>
              </React.Fragment>
            );
          })
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
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
    paddingBottom: 14,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  segmentedControlContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#636366',
  },
  segmentTextActive: {
    fontWeight: '600',
    color: '#000000',
  },
  myRankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...APPLE_SHADOW,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  myRankLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  myRankSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  myRankValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: -0.5,
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  groupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    overflow: 'hidden',
    ...APPLE_SHADOW,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rankRowCurrent: {
    backgroundColor: '#FFF9F2',
  },
  rankNumberBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankGold: {
    backgroundColor: '#FFD700',
  },
  rankSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
  },
  rankNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },
  rankTopText: {
    color: '#FFFFFF',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  nameCol: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  groupMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  xpCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 64,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
