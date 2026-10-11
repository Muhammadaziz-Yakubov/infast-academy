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
import { COLORS, SPACING } from '../constants/theme';
import { Trophy, Award, Flame, Users } from 'lucide-react-native';

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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Reyting yuklanmoqda...</Text>
      </View>
    );
  }

  const leaderboard = data?.leaderboard || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }} colors={[COLORS.primary]} />
      }
    >
      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.trophyIcon}>
          <Trophy size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.bannerTitle}>O'quvchilar Reytingi</Text>
        <Text style={styles.bannerSubtitle}>
          Darslar va testlarni a'lo topshirib, eng yuqori o'rinlarni egallang!
        </Text>

        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Sizning O'rningiz:</Text>
          <Text style={styles.myRankValue}>#{data?.myRank || 1}</Text>
        </View>
      </View>

      {/* Scope Selector */}
      <View style={styles.scopeRow}>
        <TouchableOpacity
          style={[styles.scopeBtn, scope === 'course' && styles.scopeBtnActive]}
          onPress={() => setScope('course')}
        >
          <Text style={[styles.scopeText, scope === 'course' && styles.scopeTextActive]}>
            Mening Kursim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scopeBtn, scope === 'all' && styles.scopeBtnActive]}
          onPress={() => setScope('all')}
        >
          <Text style={[styles.scopeText, scope === 'all' && styles.scopeTextActive]}>
            Barcha Filiallar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      <View style={styles.listCard}>
        {leaderboard.map((item: any, idx: number) => {
          const isTop3 = item.rank <= 3;

          return (
            <View
              key={item.studentId || idx}
              style={[
                styles.itemRow,
                item.isMe && styles.itemRowMe,
                idx === leaderboard.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View
                style={[
                  styles.rankBadge,
                  item.rank === 1 && { backgroundColor: '#F59E0B' },
                  item.rank === 2 && { backgroundColor: '#94A3B8' },
                  item.rank === 3 && { backgroundColor: '#B45309' },
                ]}
              >
                <Text style={styles.rankBadgeText}>{item.rank}</Text>
              </View>

              <View style={styles.userAvatar}>
                <Text style={styles.avatarLetter}>
                  {item.firstName?.[0] || 'I'}
                </Text>
              </View>

              <View style={{ flex: 1, marginHorizontal: SPACING.sm }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.firstName} {item.lastName} {item.isMe ? " (Siz)" : ""}
                </Text>
                <Text style={styles.userBranch}>{item.branchName}</Text>
              </View>

              <View style={styles.scoreCol}>
                <Text style={styles.scoreXp}>{item.xp} XP</Text>
                <Text style={styles.scoreLevel}>{item.level}-Daraja</Text>
              </View>
            </View>
          );
        })}
      </View>
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
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  trophyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 14,
    gap: 6,
  },
  myRankLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  myRankValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FEF08A',
  },
  scopeRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.md,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  scopeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scopeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  scopeTextActive: {
    color: COLORS.primaryDark,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemRowMe: {
    backgroundColor: COLORS.primarySoft,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userBranch: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreXp: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  scoreLevel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
