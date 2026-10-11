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
import {
  BookOpen,
  Lock,
  CheckCircle2,
  PlayCircle,
  Award,
  ChevronDown,
  ChevronRight,
  Flame,
  Layers,
} from 'lucide-react-native';

interface CurriculumScreenProps {
  onSelectLesson: (lessonId: string) => void;
}

export default function CurriculumScreen({ onSelectLesson }: CurriculumScreenProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      const res = await apiRequest('/api/student/curriculum');
      if (res.success) {
        setData(res);
        // Expand all modules by default
        const exp: Record<string, boolean> = {};
        (res.modules || []).forEach((m: any) => {
          exp[m._id] = true;
        });
        setExpandedModules(exp);
      }
    } catch (e) {
      console.warn('Curriculum fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>O'quv rejasi yuklanmoqda...</Text>
      </View>
    );
  }

  const modules = data?.modules || [];
  const progress = data?.progress || { completedLessonCount: 0, totalLessonCount: 0 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCurriculum(); }} colors={[COLORS.primary]} />
      }
    >
      {/* Course Banner */}
      <View style={styles.courseHeaderCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Layers size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>Mening Kursim</Text>
          </View>
        </View>

        <Text style={styles.courseName}>{data?.course?.name || "Dasturlash Asoslari"}</Text>
        <Text style={styles.courseDescription}>
          {data?.course?.description || "InFast IT-Academy amaliy darslar va interaktiv vazifalar"}
        </Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Tugatildi: {progress.completedLessonCount} / {progress.totalLessonCount} dars
          </Text>
          <Text style={styles.summaryPercent}>
            {progress.totalLessonCount > 0
              ? Math.round((progress.completedLessonCount / progress.totalLessonCount) * 100)
              : 0}%
          </Text>
        </View>
      </View>

      {/* Modules and Interactive Lessons Map */}
      <Text style={styles.sectionTitle}>Modullar va Darslar Xaritasi</Text>

      {modules.map((mod: any, mIdx: number) => {
        const isExpanded = expandedModules[mod._id];

        return (
          <View key={mod._id} style={styles.moduleCard}>
            {/* Module Accordion Header */}
            <TouchableOpacity
              style={styles.moduleHeader}
              onPress={() => toggleModule(mod._id)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleHeaderLeft}>
                <View style={styles.moduleNumberBadge}>
                  <Text style={styles.moduleNumberText}>{mIdx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                  <Text style={styles.moduleSub}>
                    {mod.completedCount} / {mod.totalCount} dars bajarildi ({mod.completionPercent}%)
                  </Text>
                </View>
              </View>

              {isExpanded ? (
                <ChevronDown size={20} color={COLORS.textMuted} />
              ) : (
                <ChevronRight size={20} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>

            {/* Lesson Items */}
            {isExpanded && (
              <View style={styles.lessonsContainer}>
                {mod.lessons.map((les: any) => {
                  const isCompleted = les.status === 'COMPLETED';
                  const isUnlocked = les.status === 'UNLOCKED' || les.status === 'IN_PROGRESS';
                  const isLocked = les.status === 'LOCKED';

                  return (
                    <TouchableOpacity
                      key={les._id}
                      style={[
                        styles.lessonRow,
                        isCompleted && styles.lessonRowCompleted,
                        isUnlocked && styles.lessonRowUnlocked,
                        isLocked && styles.lessonRowLocked,
                      ]}
                      disabled={isLocked}
                      onPress={() => onSelectLesson(les._id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.lessonStatusIcon}>
                        {isCompleted ? (
                          <CheckCircle2 size={22} color={COLORS.accentGreen} />
                        ) : isUnlocked ? (
                          <PlayCircle size={22} color={COLORS.primary} />
                        ) : (
                          <Lock size={20} color={COLORS.textMuted} />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            isLocked && styles.lessonTitleLocked,
                          ]}
                        >
                          {les.order}. {les.title}
                        </Text>
                        <Text style={styles.lessonMeta}>
                          {isCompleted
                            ? "✅ To'liq yakunlangan"
                            : isUnlocked
                            ? "⏳ Dars ochilgan, bajarish mumkin"
                            : "🔒 Qulflangan (Administrator ochadi)"}
                        </Text>
                      </View>

                      <View style={styles.lessonRewardBadge}>
                        <Text style={styles.lessonRewardText}>+{les.xpReward} XP</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
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
  courseHeaderCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  courseName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: SPACING.md,
    borderRadius: 14,
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryPercent: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  moduleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  moduleNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  moduleNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  moduleSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  lessonsContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  lessonRowCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  lessonRowUnlocked: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  lessonRowLocked: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    opacity: 0.65,
  },
  lessonStatusIcon: {
    marginRight: SPACING.md,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  lessonTitleLocked: {
    color: COLORS.textMuted,
  },
  lessonMeta: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  lessonRewardBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: SPACING.sm,
  },
  lessonRewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
});
