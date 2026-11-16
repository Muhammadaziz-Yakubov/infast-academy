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
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  Flame,
  Coins,
  Trophy,
  Play,
  ChevronRight,
  Building2,
  GraduationCap,
  Sparkles,
  Gift,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
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
        <ActivityIndicator size="small" color="#FF9500" />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
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
    groupRank: 1,
    currentLesson: null,
  };

  const studentProfile = data?.student || student;
  const currentLesson = progress.currentLesson;
  const attendanceSummary = data?.attendanceSummary || { percent: 100, presentCount: 0, totalCount: 0 };

  const todayDateStr = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const displayRank = progress.groupRank || progress.rank || 1;
  const firstName = studentProfile?.firstName || 'Dasturchi';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF9500"
          />
        }
      >
        {/* Friendly & Energetic Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Salom, {firstName}! 🚀</Text>
            </View>
            <Text style={styles.subGreeting}>
              {studentProfile?.course?.name ? `${studentProfile.course.name} • ` : ''}Bugun yangi marralarni zabt etamiz!
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.avatarBorder}>
              {studentProfile?.avatarUrl ? (
                <Image source={{ uri: studentProfile.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {studentProfile?.firstName?.[0] || 'I'}
                    {studentProfile?.lastName?.[0] || 'N'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Hero Card: Joriy Mashg'ulot (Energetic & Gamified) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroModuleBadge}>
              <Zap size={13} color="#FF9500" fill="#FF9500" />
              <Text style={styles.heroModuleText} numberOfLines={1}>
                {currentLesson?.module?.title || "Dasturlash asoslari"}
              </Text>
            </View>

            <View style={styles.heroRewardsRow}>
              <View style={styles.rewardPillOrange}>
                <Flame size={12} color="#FF9500" fill="#FF9500" />
                <Text style={styles.rewardPillOrangeText}>+{currentLesson?.xpReward || 50} XP</Text>
              </View>
              <View style={styles.rewardPillGold}>
                <Coins size={12} color="#FFD60A" fill="#FFD60A" />
                <Text style={styles.rewardPillGoldText}>+{currentLesson?.xcoinReward || 15}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroLessonTitle} numberOfLines={2}>
            {currentLesson ? `${currentLesson.order || 1}-dars: ${currentLesson.title}` : "Navbatdagi darsni davom ettiring"}
          </Text>

          {/* Gamified Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(8, progress.percent || 12))}%` },
                ]}
              />
            </View>
            <View style={styles.progressNumbersRow}>
              <Text style={styles.progressFraction}>
                {progress.completedCount || 0} / {progress.totalLessonsCount || 0} dars tugatildi
              </Text>
              <Text style={styles.progressPercent}>{progress.percent || 0}% tayyor</Text>
            </View>
          </View>

          {/* Punchy Energetic CTA Button */}
          <TouchableOpacity
            style={styles.heroCtaBtn}
            onPress={() => onNavigateToLearning(currentLesson?._id)}
            activeOpacity={0.88}
          >
            <View style={styles.heroCtaInner}>
              <View style={styles.playIconContainer}>
                <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <Text style={styles.heroCtaBtnText}>Darsni boshlash 🚀</Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* 2x2 Gamified Bento Grid (Rich, Colorful & Cheerful) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>YUTUQLARINGIZ</Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>{todayDateStr.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.bentoGrid}>
          {/* Card 1: XP */}
          <View style={[styles.bentoCard, styles.bentoCardOrange]}>
            <View style={styles.bentoTop}>
              <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(255, 149, 0, 0.18)' }]}>
                <Flame size={19} color="#FF9500" fill="#FF9500" />
              </View>
              <Text style={[styles.bentoBadgeTag, { color: '#FF9500' }]}>XP</Text>
            </View>
            <Text style={styles.bentoBigNumber}>{progress.xp || 0}</Text>
            <View style={styles.bentoFooterRow}>
              <Sparkles size={12} color="#FF9500" />
              <Text style={styles.bentoSubText}>Lv. {progress.level || 1} Bosqich</Text>
            </View>
          </View>

          {/* Card 2: XCoin */}
          <TouchableOpacity
            style={[styles.bentoCard, styles.bentoCardGold]}
            onPress={onNavigateToShop}
            activeOpacity={0.78}
          >
            <View style={styles.bentoTop}>
              <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(255, 214, 10, 0.18)' }]}>
                <Coins size={19} color="#FFD60A" fill="#FFD60A" />
              </View>
              <Text style={[styles.bentoBadgeTag, { color: '#FFD60A' }]}>Tangalar</Text>
            </View>
            <Text style={styles.bentoBigNumber}>{progress.xcoin || 0}</Text>
            <View style={styles.bentoFooterRow}>
              <Text style={[styles.bentoSubText, { color: '#FFD60A', fontWeight: '600' }]}>
                Do'konga o'tish › 🎁
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 3: Reyting */}
          <View style={[styles.bentoCard, styles.bentoCardBlue]}>
            <View style={styles.bentoTop}>
              <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(10, 132, 255, 0.18)' }]}>
                <Trophy size={19} color="#0A84FF" />
              </View>
              <Text style={[styles.bentoBadgeTag, { color: '#0A84FF' }]}>Reyting</Text>
            </View>
            <Text style={styles.bentoBigNumber}>#{displayRank}</Text>
            <View style={styles.bentoFooterRow}>
              <Text style={styles.bentoSubText}>
                {displayRank === 1 ? "Guruh yetakchisi 👑" : "Guruhda o'rningiz"}
              </Text>
            </View>
          </View>

          {/* Card 4: Davomat */}
          <View style={[styles.bentoCard, styles.bentoCardGreen]}>
            <View style={styles.bentoTop}>
              <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(48, 209, 88, 0.18)' }]}>
                <CheckCircle2 size={19} color="#30D158" strokeWidth={2.4} />
              </View>
              <Text style={[styles.bentoBadgeTag, { color: '#30D158' }]}>Davomat</Text>
            </View>
            <Text style={styles.bentoBigNumber}>{attendanceSummary.percent || 100}%</Text>
            <View style={styles.bentoFooterRow}>
              <Text style={styles.bentoSubText}>
                {attendanceSummary.presentCount || 0} dars qatnashilgan 🎯
              </Text>
            </View>
          </View>
        </View>

        {/* Fun & Motivating Shortcuts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>QIZIQARLI IMKONIYATLAR</Text>
        </View>

        <View style={styles.shortcutsList}>
          {/* Shop Card */}
          <TouchableOpacity
            style={styles.featurePillCard}
            onPress={onNavigateToShop}
            activeOpacity={0.82}
          >
            <View style={[styles.featureIconBadge, { backgroundColor: 'rgba(255, 149, 0, 0.14)' }]}>
              <Gift size={20} color="#FF9500" />
            </View>
            <View style={styles.featureContent}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>Sovg'alar do'koni</Text>
                <View style={styles.featureMiniTag}>
                  <Text style={styles.featureMiniTagText}>XCoin</Text>
                </View>
              </View>
              <Text style={styles.featureSubtitle}>
                Tangalaringizni ajoyib sovg'a va aksessuarlarga almashtiring!
              </Text>
            </View>
            <ChevronRight size={18} color="#8E8E93" />
          </TouchableOpacity>

          {/* Events Card */}
          {onNavigateToEvents && (
            <TouchableOpacity
              style={styles.featurePillCard}
              onPress={onNavigateToEvents}
              activeOpacity={0.82}
            >
              <View style={[styles.featureIconBadge, { backgroundColor: 'rgba(10, 132, 255, 0.14)' }]}>
                <Calendar size={20} color="#0A84FF" />
              </View>
              <View style={styles.featureContent}>
                <View style={styles.featureTitleRow}>
                  <Text style={styles.featureTitle}>Akademiya tadbirlari</Text>
                  <View style={[styles.featureMiniTag, { backgroundColor: 'rgba(10, 132, 255, 0.18)' }]}>
                    <Text style={[styles.featureMiniTagText, { color: '#0A84FF' }]}>+500 XCoin</Text>
                  </View>
                </View>
                <Text style={styles.featureSubtitle}>
                  Master-klasslar, hackathonlar va ochiq darslarda qatnashing!
                </Text>
              </View>
              <ChevronRight size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Group and Branch Status Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>GURUH VA MASHG'ULOTLAR</Text>
        </View>

        <View style={styles.groupInfoCard}>
          <View style={styles.groupInfoRow}>
            <View style={[styles.groupIconBox, { backgroundColor: 'rgba(94, 92, 230, 0.14)' }]}>
              <GraduationCap size={16} color="#5E5CE6" />
            </View>
            <View style={styles.groupTextCol}>
              <Text style={styles.groupLabel}>Guruh nomi</Text>
              <Text style={styles.groupValue} numberOfLines={1}>
                {studentProfile?.group?.name || "Frontend Guruh"}
              </Text>
            </View>
          </View>

          <View style={styles.groupDivider} />

          <View style={styles.groupInfoRow}>
            <View style={[styles.groupIconBox, { backgroundColor: 'rgba(10, 132, 255, 0.14)' }]}>
              <Building2 size={16} color="#0A84FF" />
            </View>
            <View style={styles.groupTextCol}>
              <Text style={styles.groupLabel}>Filial</Text>
              <Text style={styles.groupValue} numberOfLines={1}>
                {studentProfile?.branch?.name || "InFast IT-Academy"}
              </Text>
            </View>
          </View>

          <View style={styles.groupDivider} />

          {/* Payment Status Row */}
          {(() => {
            const isOverdue =
              studentProfile?.paymentStatus === 'OVERDUE' ||
              studentProfile?.status === 'BLOCKED' ||
              studentProfile?.status === 'BLOCK' ||
              studentProfile?.status === 'QARZDOR' ||
              (studentProfile?.totalDebt && studentProfile.totalDebt > 0);

            const formatMoney = (amount?: number) => {
              if (!amount || isNaN(amount)) return '';
              return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
            };

            const debtSum = studentProfile?.totalDebt || 0;
            const statusText = isOverdue
              ? debtSum > 0 ? `To'lov kutilmoqda (${formatMoney(debtSum)})` : "To'lov kutilmoqda"
              : "To'langan (Faol o'quvchi) ✨";

            const statusColor = isOverdue ? '#FF9500' : '#30D158';
            const statusBg = isOverdue ? 'rgba(255, 149, 0, 0.14)' : 'rgba(48, 209, 88, 0.14)';
            const StatusIcon = isOverdue ? Clock : CheckCircle2;

            return (
              <View style={styles.groupInfoRow}>
                <View style={[styles.groupIconBox, { backgroundColor: statusBg }]}>
                  <StatusIcon size={16} color={statusColor} />
                </View>
                <View style={styles.groupTextCol}>
                  <Text style={styles.groupLabel}>To'lov holati</Text>
                  <Text style={[styles.groupValue, { color: statusColor, fontWeight: '700' }]}>
                    {statusText}
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#8E8E93',
  },

  /* Cheerful Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  subGreeting: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 3,
    fontWeight: '500',
  },
  headerRight: {},
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FF9500',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Hero Card: Joriy Mashg'ulot */
  heroCard: {
    marginHorizontal: 16,
    backgroundColor: '#16191E',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.22)',
    marginBottom: 20,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroModuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '55%',
  },
  heroModuleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
  },
  heroRewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardPillOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  rewardPillOrangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
  },
  rewardPillGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 214, 10, 0.14)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  rewardPillGoldText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD60A',
  },
  heroLessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 24,
    marginBottom: 14,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 3,
  },
  progressNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressFraction: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
  },
  heroCtaBtn: {
    backgroundColor: '#FF9500',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
  },
  dateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
  },

  /* 2x2 Bento Grid */
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  bentoCard: {
    width: '48.5%',
    backgroundColor: '#16191E',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  bentoCardOrange: {
    borderColor: 'rgba(255, 149, 0, 0.18)',
  },
  bentoCardGold: {
    borderColor: 'rgba(255, 214, 10, 0.18)',
  },
  bentoCardBlue: {
    borderColor: 'rgba(10, 132, 255, 0.18)',
  },
  bentoCardGreen: {
    borderColor: 'rgba(48, 209, 88, 0.18)',
  },
  bentoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bentoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoBadgeTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  bentoBigNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  bentoFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bentoSubText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },

  /* Shortcuts */
  shortcutsList: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  featurePillCard: {
    backgroundColor: '#16191E',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  featureIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
    marginRight: 6,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  featureMiniTag: {
    backgroundColor: 'rgba(255, 149, 0, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  featureMiniTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
  },

  /* Group Info Inset Card */
  groupInfoCard: {
    marginHorizontal: 16,
    backgroundColor: '#16191E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  groupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  groupIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupTextCol: {
    flex: 1,
  },
  groupLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  groupValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 1,
  },
  groupDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 60,
  },
});
