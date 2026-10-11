import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import { Trophy, Flame, Users, Building2, Globe } from 'lucide-react-native';

type LeaderboardScope = 'group' | 'branch' | 'all';

export default function LeaderboardScreen() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scope, setScope] = useState<LeaderboardScope>('group');

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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchLeaderboard();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Apple Large Title Header */}
      <View style={styles.header}>
        <Text style={styles.categoryLabel}>PESHQADAMLAR</Text>
        <Text style={styles.largeTitle}>Reyting</Text>
      </View>

      {/* Apple iOS 3-Segment Control (Guruhim, Filialim, Hamma filiallar) */}
      <View style={styles.segmentedControlContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, scope === 'group' && styles.segmentBtnActive]}
            onPress={() => setScope('group')}
            activeOpacity={0.8}
          >
            <Users size={14} color={scope === 'group' ? '#FFFFFF' : '#8E8E93'} style={{ marginRight: 4 }} />
            <Text style={[styles.segmentText, scope === 'group' && styles.segmentTextActive]}>
              Guruhim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, scope === 'branch' && styles.segmentBtnActive]}
            onPress={() => setScope('branch')}
            activeOpacity={0.8}
          >
            <Building2 size={14} color={scope === 'branch' ? '#FFFFFF' : '#8E8E93'} style={{ marginRight: 4 }} />
            <Text style={[styles.segmentText, scope === 'branch' && styles.segmentTextActive]}>
              Filialim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, scope === 'all' && styles.segmentBtnActive]}
            onPress={() => setScope('all')}
            activeOpacity={0.8}
          >
            <Globe size={14} color={scope === 'all' ? '#FFFFFF' : '#8E8E93'} style={{ marginRight: 4 }} />
            <Text style={[styles.segmentText, scope === 'all' && styles.segmentTextActive]}>
              Hamma filiallar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User's Current Rank Card */}
      <View style={styles.myRankCard}>
        <View style={styles.myRankLeft}>
          <View style={styles.myRankBadge}>
            <Trophy size={20} color="#FF9500" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.myRankLabel}>Sizning o'rningiz</Text>
            <Text style={styles.myRankSub}>
              {scope === 'group' ? "Guruhdagi barcha o'quvchilar orasida" : scope === 'branch' ? "Filialdagi o'quvchilar orasida" : "Akademiya bo'yicha jami o'quvchilar orasida"}
            </Text>
          </View>
        </View>
        <Text style={styles.myRankValue}>#{data?.myRank || 1}</Text>
      </View>

      {/* Leaderboard Inset Grouped Table */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          PESHQADAMLAR RO'YXATI ({leaderboard.length} TA O'QUVCHI)
        </Text>
      </View>

      <View style={styles.groupedCard}>
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ushbu bo'limda o'quvchilar topilmadi</Text>
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
                  <View
                    style={[
                      styles.rankNumberBox,
                      isTop1 && styles.rankGold,
                      isTop2 && styles.rankSilver,
                      isTop3 && styles.rankBronze,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankNumberText,
                        (isTop1 || isTop2 || isTop3) && styles.rankTopText,
                      ]}
                    >
                      {item.rank}
                    </Text>
                  </View>

                  {/* Avatar (Image or Initial) */}
                  <View
                    style={[
                      styles.avatar,
                      isTop1 ? { backgroundColor: '#FF9500' } : { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
                    ]}
                  >
                    {item.avatarUrl ? (
                      <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                      <Text
                        style={[
                          styles.avatarText,
                          isTop1 ? { color: '#FFFFFF' } : { color: '#EBEBF5' },
                        ]}
                      >
                        {item.firstName?.[0] || 'O'}{item.lastName?.[0] || 'Q'}
                      </Text>
                    )}
                  </View>

                  {/* Name and Group */}
                  <View style={styles.nameCol}>
                    <Text style={styles.studentName} numberOfLines={1}>
                      {item.firstName} {item.lastName}
                      {item.isCurrentStudent && " (Siz)"}
                    </Text>
                    <Text style={styles.groupMeta} numberOfLines={1}>
                      {scope === 'all' ? `${item.branchName} • ${item.groupName}` : item.groupName || item.branchName}
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
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  segmentedControlContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#2C2C2E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  myRankCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myRankBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  myRankLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  myRankSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    paddingRight: 6,
  },
  myRankValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: -0.5,
    marginLeft: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rankRowCurrent: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
  },
  rankNumberBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  rankGold: {
    backgroundColor: '#FFD700',
  },
  rankSilver: {
    backgroundColor: '#A0A0A5',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
  },
  rankNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
  },
  rankTopText: {
    color: '#000000',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  nameCol: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 66,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
