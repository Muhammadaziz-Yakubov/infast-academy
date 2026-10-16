import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import {
  Flame,
  Coins,
  Sparkles,
  Trophy,
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  Gift,
  Calendar,
  GraduationCap,
  Award,
  AlertTriangle,
  Layers,
  Play,
} from 'lucide-react-native';

interface HomeScreenProps {
  onNavigateToLearning: (lessonId?: string) => void;
  onNavigateToShop: () => void;
  onNavigateToEvents?: () => void;
}

export default function HomeScreen({
  onNavigateToLearning,
  onNavigateToShop,
  onNavigateToEvents,
}: HomeScreenProps) {
  const { student } = useAuth();
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
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  const progress = data?.progress || {
    xp: 280,
    xcoin: 45,
    level: 2,
    completedCount: 6,
    totalLessonsCount: 30,
    percent: 20,
    rank: 3,
    currentLesson: null,
  };

  const studentProfile = data?.student || student;
  const currentLesson = progress.currentLesson;

  const todayDateStr = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Apple Large Title Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={styles.dateLabel}>{todayDateStr.toUpperCase()}</Text>
          <Text style={styles.largeTitle}>Bosh sahifa</Text>
        </View>
        <View style={styles.avatar}>
          {studentProfile?.avatarUrl ? (
            <Image source={{ uri: studentProfile.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>
              {studentProfile?.firstName?.[0] || 'I'}
              {studentProfile?.lastName?.[0] || 'N'}
            </Text>
          )}
        </View>
      </View>

      {/* 2x2 Grid: To'rtburchak Cardlar (Tajriba bali, XCoin, Daraja, O'rin) */}
      <View style={styles.statsGrid}>
        {/* Card 1: Tajriba bali (XP) */}
        <View style={styles.statSquareCard}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
              <Flame size={20} color="#FF9500" strokeWidth={2.4} />
            </View>
            <Text style={styles.statBadgeTag}>XP</Text>
          </View>
          <View style={styles.statCardBody}>
            <Text style={styles.statBigValue}>{progress.xp || 0}</Text>
            <Text style={styles.statTitleLabel}>Tajriba bali</Text>
          </View>
        </View>

        {/* Card 2: XCoin balansi */}
        <TouchableOpacity
          style={styles.statSquareCard}
          onPress={onNavigateToShop}
          activeOpacity={0.75}
        >
          <View style={styles.statCardHeader}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(255, 214, 10, 0.15)' }]}>
              <Coins size={20} color="#FFD60A" strokeWidth={2.4} />
            </View>
            <Text style={[styles.statBadgeTag, { color: '#FFD60A' }]}>Tangalar</Text>
          </View>
          <View style={styles.statCardBody}>
            <Text style={styles.statBigValue}>{progress.xcoin || 0}</Text>
            <Text style={styles.statTitleLabel}>XCoin balansi</Text>
          </View>
        </TouchableOpacity>

        {/* Card 3: Daraja (Level) */}
        <View style={styles.statSquareCard}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(94, 92, 230, 0.18)' }]}>
              <Sparkles size={20} color="#5E5CE6" strokeWidth={2.4} />
            </View>
            <Text style={[styles.statBadgeTag, { color: '#5E5CE6' }]}>Bosqich</Text>
          </View>
          <View style={styles.statCardBody}>
            <Text style={styles.statBigValue}>Lv. {progress.level || 1}</Text>
            <Text style={styles.statTitleLabel}>Daraja</Text>
          </View>
        </View>

        {/* Card 4: O'rin (Rank) */}
        <View style={styles.statSquareCard}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(10, 132, 255, 0.16)' }]}>
              <Trophy size={20} color="#0A84FF" strokeWidth={2.4} />
            </View>
            <Text style={[styles.statBadgeTag, { color: '#0A84FF' }]}>Lider</Text>
          </View>
          <View style={styles.statCardBody}>
            <Text style={styles.statBigValue}>#{progress.rank || 1}</Text>
            <Text style={styles.statTitleLabel}>Guruhdagi o'rin</Text>
          </View>
        </View>
      </View>

      {/* 1. JORIY MASHG'ULOT (Ixcham & Chiroyli Apple "Now Playing" Widget) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>JORIY MAShG'ULOT</Text>
      </View>

      <TouchableOpacity
        style={styles.heroLessonCard}
        onPress={() => onNavigateToLearning(currentLesson?._id)}
        activeOpacity={0.82}
      >
        <View style={styles.lessonCardLeft}>
          <View style={styles.lessonPlayBadge}>
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>

        <View style={styles.lessonCardMid}>
          <View style={styles.lessonMetaRow}>
            <View style={styles.lessonOrderPill}>
              <Text style={styles.lessonOrderPillText}>
                {currentLesson ? `${currentLesson.order || 1}-DARS` : 'KURS DARS'}
              </Text>
            </View>
            <Text style={styles.lessonModuleTitle} numberOfLines={1}>
              {currentLesson?.module?.title || studentProfile?.course?.name || "Dasturlash"}
            </Text>
          </View>

          <Text style={styles.lessonTitleText} numberOfLines={1}>
            {currentLesson?.title || "Navbatdagi darsni boshlash"}
          </Text>

          {/* Slim Apple Progress Bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrackBg}>
              <View style={[styles.progressTrackFill, { width: `${Math.min(100, Math.max(10, progress.percent || 15))}%` }]} />
            </View>
            <Text style={styles.progressPercentText}>{progress.percent || 0}%</Text>
          </View>
        </View>

        <View style={styles.lessonCardRight}>
          <View style={styles.lessonStartCircle}>
            <ArrowRight size={16} color="#FF9500" strokeWidth={2.6} />
          </View>
        </View>
      </TouchableOpacity>

      {/* 2. FEATURELAR */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>FEATURELAR</Text>
      </View>

      {onNavigateToEvents && (
        <TouchableOpacity
          style={styles.eventFeatureCard}
          onPress={onNavigateToEvents}
          activeOpacity={0.82}
        >
          <View style={styles.eventCardHeader}>
            <View style={styles.eventIconBadge}>
              <Calendar size={22} color="#0A84FF" strokeWidth={2.4} />
            </View>
            <View style={styles.eventBonusBadge}>
              <Coins size={14} color="#FFD60A" />
              <Text style={styles.eventBonusText}>+500 / -500 XCoin</Text>
            </View>
          </View>

          <View style={styles.eventCardBody}>
            <Text style={styles.eventCardTitle}>Akademiya Tadbirlari</Text>
            <Text style={styles.eventCardSubtitle}>
              Master-klasslar, hackathonlar va ochiq darslar. Ishtirok eting va XCoin jamg'aring!
            </Text>
          </View>

          <View style={styles.eventCardFooter}>
            <View style={styles.eventActionBtn}>
              <Text style={styles.eventActionText}>Ro'yxatdan o'tish</Text>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.eventStatusIndicator}>
              <View style={styles.eventPulseDot} />
              <Text style={styles.eventStatusText}>Faol tadbirlar</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* 3. GURUH VA FILIAL */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>GURUH VA FILIAL</Text>
      </View>

      <View style={styles.groupedCard}>
        <View style={styles.groupedRow}>
          <View style={[styles.rowIconBox, { backgroundColor: 'rgba(10, 132, 255, 0.15)' }]}>
            <Building2 size={18} color="#0A84FF" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Filial</Text>
            <Text style={styles.rowValue}>{studentProfile?.branch?.name || "InFast IT-Academy Toshkent"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.groupedRow}>
          <View style={[styles.rowIconBox, { backgroundColor: 'rgba(94, 92, 230, 0.15)' }]}>
            <GraduationCap size={18} color="#5E5CE6" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Guruh</Text>
            <Text style={styles.rowValue}>{studentProfile?.group?.name || "FS-Guruh"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {(() => {
          const isOverdue =
            studentProfile?.paymentStatus === 'OVERDUE' ||
            studentProfile?.status === 'BLOCKED' ||
            studentProfile?.status === 'BLOCK' ||
            studentProfile?.status === 'QARZDOR' ||
            (studentProfile?.totalDebt && studentProfile.totalDebt > 0);

          const formatMoney = (amount?: number) => {
            if (!amount || isNaN(amount)) return '';
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " so'm";
          };

          const debtSum = studentProfile?.totalDebt || 0;
          const statusText = isOverdue
            ? debtSum > 0 ? `Qarzdor (${formatMoney(debtSum)})` : "Qarzdor"
            : studentProfile?.paymentStatus === 'PARTIAL'
            ? `Kutilmoqda (${formatMoney(debtSum)})`
            : "Faol (To'langan)";

          const statusColor = isOverdue
            ? '#FF453A'
            : studentProfile?.paymentStatus === 'PARTIAL'
            ? '#FF9500'
            : '#30D158';

          const statusBg = isOverdue
            ? 'rgba(255, 69, 58, 0.15)'
            : studentProfile?.paymentStatus === 'PARTIAL'
            ? 'rgba(255, 149, 0, 0.15)'
            : 'rgba(48, 209, 88, 0.15)';

          return (
            <View style={styles.groupedRow}>
              <View style={[styles.rowIconBox, { backgroundColor: statusBg }]}>
                {isOverdue ? (
                  <AlertTriangle size={18} color={statusColor} />
                ) : (
                  <Award size={18} color={statusColor} />
                )}
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>To'lov holati</Text>
                <Text style={[styles.rowValue, { color: statusColor, fontWeight: '700' }]}>
                  {statusText}
                </Text>
              </View>
            </View>
          );
        })()}
      </View>

      <View style={{ height: 24 }} />
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTextCol: {
    flex: 1,
  },
  dateLabel: {
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  /* 2x2 Square / Rectangular Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statSquareCard: {
    width: '48%',
    backgroundColor: '#1C1C1E', // Apple Dark Card
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    minHeight: 128,
    ...APPLE_SHADOW,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadgeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.3,
  },
  statCardBody: {
    justifyContent: 'flex-end',
  },
  statBigValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 2,
  },
  statTitleLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },

  /* Section Title */
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  /* Current Lesson Card: Compact & Sleek Apple "Now Playing" Card */
  heroLessonCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    ...APPLE_SHADOW,
  },
  lessonCardLeft: {
    marginRight: 12,
  },
  lessonPlayBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  lessonCardMid: {
    flex: 1,
    marginRight: 10,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  lessonOrderPill: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  lessonOrderPillText: {
    color: '#FF9500',
    fontSize: 10,
    fontWeight: '800',
  },
  lessonModuleTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  lessonTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrackBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 2,
  },
  progressPercentText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
  },
  lessonCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonStartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Feature: Tadbirlar Apple Dark Card */
  eventFeatureCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 214, 10, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.3)',
  },
  eventBonusText: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '700',
  },
  eventCardBody: {
    marginBottom: 14,
  },
  eventCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  eventCardSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  eventActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A84FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  eventActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  eventStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#30D158',
  },
  eventStatusText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },

  /* Inset Grouped Info Card */
  groupedCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginLeft: 66,
  },
});
