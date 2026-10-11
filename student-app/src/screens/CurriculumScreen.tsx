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
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  Sparkles,
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
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>O'quv dasturi yuklanmoqda...</Text>
      </View>
    );
  }

  const course = data?.course || {
    name: 'Frontend Development',
    description: "Zamonaviy veb va mobil ilovalar yaratish bo'yicha to'liq kurs.",
  };

  const modules = data?.modules || [];
  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce(
    (acc: number, m: any) =>
      acc + (m.lessons?.filter((l: any) => l.isCompleted)?.length || 0),
    0
  );
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
            fetchCurriculum();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Apple Large Title Header */}
      <View style={styles.header}>
        <Text style={styles.categoryLabel}>O'QUV DASTURI</Text>
        <Text style={styles.largeTitle}>LMS Xaritasi</Text>
      </View>

      {/* Course Overview Card */}
      <View style={styles.courseCard}>
        <View style={styles.courseBadgeRow}>
          <View style={styles.coursePill}>
            <Text style={styles.coursePillText}>ASOSIY KURS</Text>
          </View>
          <Text style={styles.progressPercentText}>{percent}% O'zlashtirildi</Text>
        </View>

        <Text style={styles.courseTitle}>{course.name}</Text>
        <Text style={styles.courseSubtitle}>{course.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.max(5, percent)}%` }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressCountText}>
            {completedLessons} / {totalLessons} dars yakunlangan
          </Text>
          <Text style={styles.progressCountText}>
            {modules.length} ta modul
          </Text>
        </View>
      </View>

      {/* Modules List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MODULLAR VA DARSLAR</Text>
      </View>

      {modules.map((module: any, mIdx: number) => {
        const isExpanded = !!expandedModules[module._id];
        const lessons = module.lessons || [];
        const modCompleted = lessons.filter((l: any) => l.isCompleted).length;

        return (
          <View key={module._id} style={styles.moduleCard}>
            {/* Module Accordion Header */}
            <TouchableOpacity
              style={styles.moduleHeader}
              onPress={() => toggleModule(module._id)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleNumberBadge}>
                <Text style={styles.moduleNumberText}>{mIdx + 1}</Text>
              </View>

              <View style={styles.moduleHeaderInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleMeta}>
                  {lessons.length} ta dars • {modCompleted}/{lessons.length} yakunlandi
                </Text>
              </View>

              {isExpanded ? (
                <ChevronUp size={20} color="#8E8E93" />
              ) : (
                <ChevronDown size={20} color="#8E8E93" />
              )}
            </TouchableOpacity>

            {/* Lessons Inset Group */}
            {isExpanded && (
              <View style={styles.lessonsContainer}>
                {lessons.map((lesson: any, lIdx: number) => {
                  const isLocked = !lesson.isUnlocked;
                  const isCompleted = lesson.isCompleted;

                  return (
                    <React.Fragment key={lesson._id}>
                      {lIdx > 0 && <View style={styles.separator} />}

                      <TouchableOpacity
                        style={[styles.lessonRow, isLocked && styles.lessonRowLocked]}
                        disabled={isLocked}
                        onPress={() => onSelectLesson(lesson._id)}
                        activeOpacity={0.6}
                      >
                        {/* Status Icon */}
                        <View style={styles.statusIconBox}>
                          {isCompleted ? (
                            <CheckCircle2 size={22} color="#30D158" />
                          ) : isLocked ? (
                            <Lock size={18} color="#636366" />
                          ) : (
                            <PlayCircle size={22} color="#FF9500" />
                          )}
                        </View>

                        {/* Lesson Info */}
                        <View style={styles.lessonTextCol}>
                          <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>
                            {lesson.order || lIdx + 1}. {lesson.title}
                          </Text>
                          <Text style={styles.lessonSub}>
                            {lesson.xpReward || 30} XP • {isCompleted ? "Yakunlangan" : isLocked ? "Qulflangan" : "Boshlashga tayyor"}
                          </Text>
                        </View>

                        {!isLocked && (
                          <ChevronRight size={18} color="#636366" />
                        )}
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

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
  courseCard: {
    backgroundColor: '#1C1C1E', // Apple Dark Slate
    borderRadius: 22,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  courseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  coursePill: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coursePillText: {
    color: '#FF9500',
    fontSize: 11,
    fontWeight: '700',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  courseSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCountText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
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
  moduleCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  moduleNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moduleHeaderInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  moduleMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  lessonsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  lessonRowLocked: {
    opacity: 0.45,
  },
  statusIconBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lessonTextCol: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  lessonTitleLocked: {
    color: '#8E8E93',
  },
  lessonSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 58,
  },
});
