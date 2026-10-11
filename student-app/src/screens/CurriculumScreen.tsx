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
        <Text style={styles.loadingText}>O'quv rejasi yuklanmoqda...</Text>
      </View>
    );
  }

  const modules = data?.modules || [];
  const progress = data?.progress || { completedLessonCount: 0, totalLessonCount: 0 };
  const percent = progress.totalLessonCount > 0
    ? Math.round((progress.completedLessonCount / progress.totalLessonCount) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCurriculum(); }} tintColor={COLORS.primary} />
      }
    >
      {/* Apple Large Title Navigation Header */}
      <View style={styles.header}>
        <Text style={styles.categoryLabel}>O'QUV DASTURI</Text>
        <Text style={styles.largeTitle}>Ta'lim</Text>
      </View>

      {/* Course Overview Card (Apple Style) */}
      <View style={styles.courseCard}>
        <View style={styles.courseBadgeRow}>
          <View style={styles.coursePill}>
            <Text style={styles.coursePillText}>Asosiy Kurs</Text>
          </View>
          <Text style={styles.progressPercentText}>{percent}% tamomlandi</Text>
        </View>

        <Text style={styles.courseTitle}>{data?.course?.name || "Frontend & Web Dasturlash"}</Text>
        <Text style={styles.courseSubtitle}>
          {data?.course?.description || "Zamonaviy IT ta'limi bo'yicha amaliy darslar va topshiriqlar"}
        </Text>

        {/* Minimal Apple Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.max(5, percent)}%` }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressCountText}>
            {progress.completedLessonCount} / {progress.totalLessonCount} dars yakunlangan
          </Text>
        </View>
      </View>

      {/* Modules List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MODULLAR VA DARSLAR</Text>
      </View>

      {modules.map((module: any, mIdx: number) => {
        const isExpanded = expandedModules[module._id] !== false;
        const lessons = module.lessons || [];
        const completedInModule = lessons.filter((l: any) => l.isCompleted).length;

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
                  {completedInModule}/{lessons.length} dars tugatildi
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
                            <CheckCircle2 size={22} color="#34C759" />
                          ) : isLocked ? (
                            <Lock size={18} color="#C7C7CC" />
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
                          <ChevronRight size={18} color="#C7C7CC" />
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
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 18,
    marginBottom: 24,
    ...APPLE_SHADOW,
  },
  courseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  coursePill: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
    color: '#000000',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5E5EA',
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  moduleHeaderInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  moduleMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  lessonsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  lessonRowLocked: {
    opacity: 0.5,
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
    color: '#000000',
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
    backgroundColor: '#E5E5EA',
    marginLeft: 58,
  },
});
