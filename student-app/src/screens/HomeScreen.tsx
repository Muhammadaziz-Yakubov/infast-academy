import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { COLORS, SPACING } from '../constants/theme';
import {
  Award,
  Coins,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

interface HomeScreenProps {
  onNavigateToLearning: (lessonId?: string) => void;
  onNavigateToShop: () => void;
}

export default function HomeScreen({ onNavigateToLearning, onNavigateToShop }: HomeScreenProps) {
  const { student, logout } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiRequest('/api/student/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Ma'lumotlar yuklanmoqda...</Text>
      </View>
    );
  }

  const progress = data?.progress || {
    xp: 0,
    xcoin: 0,
    level: 1,
    completedCount: 0,
    totalLessonsCount: 0,
    percent: 0,
    rank: 1,
    currentLesson: null,
  };

  const studentProfile = data?.student || student;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Top Header Card */}
      <View style={styles.headerRow}>
        <View style={styles.userBadgeRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {studentProfile?.firstName?.[0] || 'I'}
              {studentProfile?.lastName?.[0] || 'N'}
            </Text>
          </View>
          <View style={styles.userInfoCol}>
            <Text style={styles.greetingText}>Assalomu alaykum,</Text>
            <Text style={styles.userNameText}>
              {studentProfile?.firstName} {studentProfile?.lastName}
            </Text>
            <Text style={styles.userBranchText}>
              {studentProfile?.branch?.name || 'InFast IT-Academy'} &bull; {studentProfile?.group?.name || 'Guruh'}
            </Text>
          </View>
        </View>
      </View>

      {/* Gamification Stats Row (XP, XCoin, Level, Rank) */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <View style={styles.statIconRow}>
            <Coins size={18} color="#D97706" />
            <Text style={styles.statLabel}>XCOIN</Text>
          </View>
          <Text style={[styles.statValue, { color: '#B45309' }]}>{progress.xcoin}</Text>
          <TouchableOpacity onPress={onNavigateToShop} style={styles.statActionLink}>
            <Text style={styles.statActionText}>Do'kon &rarr;</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFEDD5' }]}>
          <View style={styles.statIconRow}>
            <Award size={18} color="#EA580C" />
            <Text style={styles.statLabel}>XP BAL</Text>
          </View>
          <Text style={[styles.statValue, { color: '#C2410C' }]}>{progress.xp}</Text>
          <Text style={styles.statSubText}>{progress.level}-Daraja</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
          <View style={styles.statIconRow}>
            <Flame size={18} color="#4F46E5" />
            <Text style={styles.statLabel}>O'RIN</Text>
          </View>
          <Text style={[styles.statValue, { color: '#3730A3' }]}>#{progress.rank}</Text>
          <Text style={styles.statSubText}>Reytingda</Text>
        </View>
      </View>

      {/* Main Action Banner: Continue Current Lesson (Inspired by reference screenshot) */}
      <View style={styles.currentLessonCard}>
        <View style={styles.currentLessonBadge}>
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.currentLessonBadgeText}>Bugungi Dars</Text>
        </View>

        <Text style={styles.currentLessonTitle}>
          {progress.currentLesson?.title || "Darslar boshlanmoqda"}
        </Text>

        <Text style={styles.currentLessonSubtitle}>
          {progress.currentLesson
            ? `${progress.currentLesson.order}-Dars &bull; +${progress.currentLesson.xpReward} XP / +${progress.currentLesson.xcoinReward} XCoin`
            : "O'quv rejasidagi darslarni o'zlashtirishni boshlang"}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, progress.percent)}%` }]} />
        </View>

        <View style={styles.progressDetailRow}>
          <Text style={styles.progressPercentText}>{progress.percent}% yakunlandi</Text>
          <Text style={styles.progressCountText}>
            {progress.completedCount} / {progress.totalLessonsCount} dars
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => onNavigateToLearning(progress.currentLesson?._id)}
        >
          <Text style={styles.continueButtonText}>Darsni Davom Ettirish</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Summary Grid: Attendance & Payments */}
      <View style={styles.summaryGrid}>
        {/* Attendance Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconCircle}>
            <Calendar size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.summaryTitle}>Davomat</Text>
          <Text style={styles.summaryValue}>{data?.attendanceSummary?.percent || 100}%</Text>
          <Text style={styles.summarySubText}>
            {data?.attendanceSummary?.presentCount || 0} ta qatnashgan
          </Text>
        </View>

        {/* Payments Card */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <CreditCard size={18} color={COLORS.accentGreen} />
          </View>
          <Text style={styles.summaryTitle}>Oylik To'lov</Text>
          <Text style={[styles.summaryValue, { color: COLORS.accentGreen }]}>
            {studentProfile?.status === 'ACTIVE' ? "To'langan" : "Kutilmoqda"}
          </Text>
          <Text style={styles.summarySubText}>Har oy {studentProfile?.paymentDueDay}-sanada</Text>
        </View>
      </View>

      {/* Announcements Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Bell size={18} color={COLORS.textPrimary} />
          <Text style={styles.sectionTitle}>Oxirgi E'lonlar</Text>
        </View>
      </View>

      {(data?.announcements || []).length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Hozircha yangi e'lonlar mavjud emas.</Text>
        </View>
      ) : (
        (data?.announcements || []).map((item: any, idx: number) => (
          <View key={item._id || idx} style={styles.announcementCard}>
            <Text style={styles.announcementTitle}>{item.title || "Akademiya Xabarnomasi"}</Text>
            <Text style={styles.announcementBody}>{item.message}</Text>
            <Text style={styles.announcementDate}>
              {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
            </Text>
          </View>
        ))
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  headerRow: {
    marginBottom: SPACING.lg,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  userInfoCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '900',
  },
  userBranchText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 2,
  },
  statSubText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statActionLink: {
    marginTop: 2,
  },
  statActionText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  currentLessonCard: {
    backgroundColor: '#0F172A', // Dark sleek card matching reference
    borderRadius: 28,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  currentLessonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },
  currentLessonBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  currentLessonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  currentLessonSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: SPACING.lg,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  progressPercentText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  progressCountText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  summaryTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  summarySubText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  announcementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  announcementDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  emptyBox: {
    padding: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
