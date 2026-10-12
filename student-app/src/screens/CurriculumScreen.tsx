import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING } from '../constants/theme';
import {
  Check,
  Lock,
  Play,
  Star,
  Zap,
  Flame,
  Award,
  Crown,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CurriculumScreenProps {
  onSelectLesson: (lessonId: string) => void;
}

export default function CurriculumScreen({ onSelectLesson }: CurriculumScreenProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      const res = await apiRequest('/api/student/curriculum');
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Curriculum fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>O'quv xaritasi yuklanmoqda...</Text>
      </View>
    );
  }

  const course = data?.course || {
    name: 'Frontend Development',
    description: "Zamonaviy veb dasturlash",
  };

  const modules = data?.modules || [];
  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce(
    (acc: number, m: any) =>
      acc + (m.lessons?.filter((l: any) => l.status === 'COMPLETED' || l.isCompleted)?.length || 0),
    0
  );
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const progressInfo = data?.progress || { xp: 0, xcoin: 0, level: 1 };

  // Calculate zigzag X offset for Duolingo path
  const getZigzagOffset = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return 0;
    if (cycle === 1) return 46;
    if (cycle === 2) return 0;
    return -46;
  };

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
          tintColor="#FF9500"
        />
      }
    >
      {/* Duolingo Sticky Top Gamified Stats Bar */}
      <View style={styles.topStatsBar}>
        <View style={styles.statChip}>
          <Flame size={16} color="#FF9500" fill="#FF9500" />
          <Text style={styles.statChipText}>{progressInfo.xp || 0} XP</Text>
        </View>

        <View style={styles.statChip}>
          <Zap size={16} color="#FFD60A" fill="#FFD60A" />
          <Text style={styles.statChipText}>{progressInfo.xcoin || 0} Tangalar</Text>
        </View>

        <View style={styles.statChip}>
          <Crown size={16} color="#5E5CE6" fill="#5E5CE6" />
          <Text style={styles.statChipText}>Lv. {progressInfo.level || 1}</Text>
        </View>
      </View>

      {/* Course Header Banner */}
      <View style={styles.courseHeaderBanner}>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>KURS XARITASI</Text>
        </View>
        <Text style={styles.courseHeaderTitle}>{course.name}</Text>
        <Text style={styles.courseHeaderSub}>
          {completedLessons} / {totalLessons} dars tugatildi ({percent}%)
        </Text>

        {/* Progress line */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.max(5, percent)}%` }]} />
        </View>
      </View>

      {/* Modules and Duolingo Stepping Path */}
      {modules.map((module: any, mIdx: number) => {
        const lessons = module.lessons || [];

        return (
          <View key={module._id} style={styles.moduleSection}>
            {/* Duolingo Unit Banner Header */}
            <View style={styles.unitBanner}>
              <View style={styles.unitBannerLeft}>
                <Text style={styles.unitBannerSub}>BOB {mIdx + 1}</Text>
                <Text style={styles.unitBannerTitle}>{module.title}</Text>
              </View>
              <View style={styles.unitCrownBadge}>
                <BookOpen size={18} color="#FFFFFF" />
              </View>
            </View>

            {/* Stepping Path Node List (Duolingo Zigzag) */}
            <View style={styles.pathNodesWrapper}>
              {lessons.map((lesson: any, lIdx: number) => {
                const isCompleted = lesson.status === 'COMPLETED' || lesson.isCompleted;
                const isLocked = lesson.status === 'LOCKED' || (!lesson.isUnlocked && lesson.status === undefined);
                const isCurrent = !isLocked && !isCompleted;
                const offsetX = getZigzagOffset(lIdx);

                return (
                  <View key={lesson._id} style={[styles.nodeRow, { transform: [{ translateX: offsetX }] }]}>
                    {/* Node Connecting Line */}
                    {lIdx > 0 && <View style={[styles.connectingLine, isCompleted && styles.connectingLineActive]} />}

                    {/* Stepping Round Button */}
                    <TouchableOpacity
                      disabled={isLocked}
                      onPress={() => onSelectLesson(lesson._id)}
                      activeOpacity={0.8}
                      style={[
                        styles.nodeCircleBase,
                        isCompleted
                          ? styles.nodeCircleCompleted
                          : isCurrent
                          ? styles.nodeCircleCurrent
                          : styles.nodeCircleLocked,
                      ]}
                    >
                      {/* Inner 3D Layer */}
                      <View
                        style={[
                          styles.nodeInnerCircle,
                          isCompleted
                            ? styles.nodeInnerCompleted
                            : isCurrent
                            ? styles.nodeInnerCurrent
                            : styles.nodeInnerLocked,
                        ]}
                      >
                        {isCompleted ? (
                          <Check size={26} color="#FFFFFF" strokeWidth={3.5} />
                        ) : isCurrent ? (
                          <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
                        ) : (
                          <Lock size={20} color="#71717A" />
                        )}
                      </View>

                      {/* Current Floating Indicator */}
                      {isCurrent && (
                        <View style={styles.currentFloatPill}>
                          <Text style={styles.currentFloatText}>BOSHLASH</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Lesson Label Under Node */}
                    <View style={styles.nodeLabelBox}>
                      <Text
                        style={[
                          styles.nodeTitleText,
                          isCompleted && styles.nodeTitleCompleted,
                          isCurrent && styles.nodeTitleCurrent,
                          isLocked && styles.nodeTitleLocked,
                        ]}
                        numberOfLines={1}
                      >
                        {lesson.order || lIdx + 1}. {lesson.title}
                      </Text>
                      <Text style={styles.nodeXpText}>+{lesson.xpReward || 50} XP</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090B',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '600',
  },

  /* Top Stats Bar */
  topStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Course Banner */
  courseHeaderBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#18181B',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 0.8,
  },
  courseHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  courseHeaderSub: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#30D158',
    borderRadius: 4,
  },

  /* Duolingo Unit Section */
  moduleSection: {
    marginBottom: 28,
  },
  unitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF9500',
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  unitBannerLeft: {
    flex: 1,
  },
  unitBannerSub: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.65)',
    letterSpacing: 0.8,
  },
  unitBannerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.3,
  },
  unitCrownBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Stepping Nodes Path */
  pathNodesWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  nodeRow: {
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    top: -24,
    width: 6,
    height: 24,
    backgroundColor: '#27272A',
    borderRadius: 3,
    zIndex: -1,
  },
  connectingLineActive: {
    backgroundColor: '#30D158',
  },

  /* Node 3D Button Styles */
  nodeCircleBase: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  nodeInnerCircle: {
    width: 74,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* State: Completed */
  nodeCircleCompleted: {
    backgroundColor: '#249C42', // Darker bottom 3D shadow
  },
  nodeInnerCompleted: {
    backgroundColor: '#30D158', // Duolingo Vibrant Green
  },

  /* State: Current Active */
  nodeCircleCurrent: {
    backgroundColor: '#CC7700', // Darker orange 3D shadow
  },
  nodeInnerCurrent: {
    backgroundColor: '#FF9500', // Vibrant Active Orange
  },

  /* State: Locked */
  nodeCircleLocked: {
    backgroundColor: '#1E1E22',
  },
  nodeInnerLocked: {
    backgroundColor: '#27272A',
  },

  /* Floating "START" Pill */
  currentFloatPill: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  currentFloatText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF9500',
    letterSpacing: 0.5,
  },

  /* Labels */
  nodeLabelBox: {
    alignItems: 'center',
    marginTop: 8,
    maxWidth: 160,
  },
  nodeTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  nodeTitleCompleted: {
    color: '#30D158',
  },
  nodeTitleCurrent: {
    color: '#FF9500',
    fontWeight: '800',
  },
  nodeTitleLocked: {
    color: '#71717A',
  },
  nodeXpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    marginTop: 1,
  },
});
