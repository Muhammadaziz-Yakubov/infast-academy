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
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import {
  Flame,
  Coins,
  Sparkles,
  Trophy,
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  Building2,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';

interface HomeScreenProps {
  onNavigateToLearning: (lessonId?: string) => void;
  onNavigateToShop: () => void;
}

export default function HomeScreen({ onNavigateToLearning, onNavigateToShop }: HomeScreenProps) {
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
          <Text style={styles.avatarText}>
            {studentProfile?.firstName?.[0] || 'I'}
            {studentProfile?.lastName?.[0] || 'N'}
          </Text>
        </View>
      </View>

      {/* Apple Fitness Style Widget Grid (XP, Coins, Level, Rank) */}
      <View style={styles.widgetsGrid}>
        {/* Widget 1: XP */}
        <View style={styles.widgetCard}>
          <View style={[styles.widgetIconCircle, { backgroundColor: '#FFF4E6' }]}>
            <Flame size={18} color="#FF9500" strokeWidth={2.4} />
          </View>
          <Text style={styles.widgetValue}>{progress.xp || 0} XP</Text>
          <Text style={styles.widgetLabel}>Tajriba bali</Text>
        </View>

        {/* Widget 2: XCoin */}
        <TouchableOpacity style={styles.widgetCard} onPress={onNavigateToShop} activeOpacity={0.7}>
          <View style={[styles.widgetIconCircle, { backgroundColor: '#FFFBE6' }]}>
            <Coins size={18} color="#E5A100" strokeWidth={2.4} />
          </View>
          <Text style={styles.widgetValue}>{progress.xcoin || 0}</Text>
          <Text style={styles.widgetLabel}>XCoin balansi</Text>
        </TouchableOpacity>

        {/* Widget 3: Level */}
        <View style={styles.widgetCard}>
          <View style={[styles.widgetIconCircle, { backgroundColor: '#F0EEFF' }]}>
            <Sparkles size={18} color="#5856D6" strokeWidth={2.4} />
          </View>
          <Text style={styles.widgetValue}>Lv. {progress.level || 1}</Text>
          <Text style={styles.widgetLabel}>Daraja</Text>
        </View>

        {/* Widget 4: Rank */}
        <View style={styles.widgetCard}>
          <View style={[styles.widgetIconCircle, { backgroundColor: '#EBF5FF' }]}>
            <Trophy size={18} color="#007AFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.widgetValue}>#{progress.rank || 1}</Text>
          <Text style={styles.widgetLabel}>Guruhdagi o'rin</Text>
        </View>
      </View>

      {/* Apple App Store "Today" Feature Card: Current Lesson */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>JORIY MAShG'ULOT</Text>
      </View>

      <View style={styles.heroLessonCard}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroPill}>
            <BookOpen size={12} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.heroPillText}>
              {currentLesson ? `${currentLesson.order || 1}-DARS` : 'KURS DARS'}
            </Text>
          </View>
          <Text style={styles.heroModuleText}>
            {currentLesson?.module?.title || studentProfile?.course?.name || "Dasturlash Asoslari"}
          </Text>
        </View>

        <Text style={styles.heroLessonTitle}>
          {currentLesson?.title || 'Navbatdagi darsni davom ettiring'}
        </Text>
        <Text style={styles.heroLessonDescription} numberOfLines={2}>
          {currentLesson?.description || "Nazariy qo'llanma, 9 ta test savoli va interaktiv topshiriqlarni bajaring."}
        </Text>

        {/* Progress track */}
        <View style={styles.progressTrackRow}>
          <View style={styles.progressTrackBg}>
            <View style={[styles.progressTrackFill, { width: `${Math.min(100, Math.max(10, progress.percent || 15))}%` }]} />
          </View>
          <Text style={styles.progressPercentText}>{progress.percent || 0}% tugatildi</Text>
        </View>

        {/* Apple Rounded CTA Button */}
        <TouchableOpacity
          style={styles.heroCtaButton}
          onPress={() => onNavigateToLearning(currentLesson?._id)}
          activeOpacity={0.8}
        >
          <Text style={styles.heroCtaText}>Darsni boshlash</Text>
          <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Apple Inset Grouped List: O'quvchi ma'lumotlari */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>GURUH VA FILIAL</Text>
      </View>

      <View style={styles.groupedCard}>
        <View style={styles.groupedRow}>
          <View style={[styles.rowIconBox, { backgroundColor: '#EBF5FF' }]}>
            <Building2 size={18} color="#007AFF" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Filial</Text>
            <Text style={styles.rowValue}>{studentProfile?.branch?.name || "InFast IT-Academy Toshkent"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.groupedRow}>
          <View style={[styles.rowIconBox, { backgroundColor: '#F0EEFF' }]}>
            <BookOpen size={18} color="#5856D6" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Guruh</Text>
            <Text style={styles.rowValue}>{studentProfile?.group?.name || "FS-Guruh"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.groupedRow}>
          <View style={[styles.rowIconBox, { backgroundColor: '#EAF8EE' }]}>
            <CreditCard size={18} color="#34C759" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>To'lov holati</Text>
            <Text style={[styles.rowValue, { color: '#34C759', fontWeight: '700' }]}>Faol (To'langan)</Text>
          </View>
        </View>
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>TEZKOR BO'LIMLAR</Text>
      </View>

      <View style={styles.groupedCard}>
        <TouchableOpacity
          style={styles.groupedActionRow}
          onPress={() => onNavigateToLearning()}
          activeOpacity={0.6}
        >
          <View style={[styles.rowIconBox, { backgroundColor: '#FFF4E6' }]}>
            <BookOpen size={18} color="#FF9500" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.actionRowTitle}>O'quv xaritasi (LMS)</Text>
            <Text style={styles.actionRowSubtitle}>Barcha modullar va darslar bosqichi</Text>
          </View>
          <ChevronRight size={18} color="#C7C7CC" />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.groupedActionRow}
          onPress={onNavigateToShop}
          activeOpacity={0.6}
        >
          <View style={[styles.rowIconBox, { backgroundColor: '#FFFBE6' }]}>
            <Coins size={18} color="#E5A100" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.actionRowTitle}>XCoin Sovg'alar Do'koni</Text>
            <Text style={styles.actionRowSubtitle}>To'plangan tangalarni sovg'alarga almashtiring</Text>
          </View>
          <ChevronRight size={18} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Apple standard grouped background
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
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  widgetCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    ...APPLE_SHADOW,
  },
  widgetIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  widgetValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
  },
  widgetLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  heroLessonCard: {
    backgroundColor: '#1C1C1E', // Apple Dark Slate Surface
    borderRadius: 22,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroModuleText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  heroLessonTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroLessonDescription: {
    color: '#AEAEC2',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressTrackRow: {
    marginBottom: 16,
  },
  progressTrackBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressPercentText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
  },
  heroCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  groupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...APPLE_SHADOW,
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  groupedActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    color: '#000000',
    fontWeight: '600',
    marginTop: 1,
  },
  actionRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  actionRowSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 64,
  },
});
