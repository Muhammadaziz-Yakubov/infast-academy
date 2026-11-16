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
import { StatusBar } from 'expo-status-bar';
import { apiRequest } from '../services/api';
import {
  Check,
  Lock,
  Play,
  Flame,
  Coins,
  BookOpen,
} from 'lucide-react-native';

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
        <ActivityIndicator size="small" color="#FF9500" />
        <Text style={styles.loadingText}>O'quv xaritasi yuklanmoqda...</Text>
      </View>
    );
  }

  const course = data?.course || {
    name: 'Dasturlash kursi',
    description: "Zamonaviy IT ta'limi",
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
    if (cycle === 1) return 44;
    if (cycle === 2) return 0;
    return -44;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Apple Native Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <Text style={styles.navCategory}>TA'LIM</Text>
          <Text style={styles.navTitle} numberOfLines={1}>{course.name}</Text>
          <Text style={styles.navSub}>
            {completedLessons} / {totalLessons} dars • {percent}%
          </Text>
        </View>

        <View style={styles.navStatsCapsule}>
          <View style={styles.navStatItem}>
            <Flame size={13} color="#FF9500" />
            <Text style={styles.navStatValue}>{progressInfo.xp || 0}</Text>
          </View>
          <View style={styles.navStatDivider} />
          <View style={styles.navStatItem}>
            <Coins size={13} color="#FFD60A" />
            <Text style={[styles.navStatValue, { color: '#FFD60A' }]}>{progressInfo.xcoin || 0}</Text>
          </View>
        </View>
      </View>

      {/* Slim Integrated Apple Progress Line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(4, percent)}%` }]} />
      </View>

      <ScrollView
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
        {/* Modules and Duolingo Stepping Path */}
        {modules.length === 0 ? (
          <View style={styles.emptyCard}>
            <BookOpen size={32} color="#FF9500" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Darslar kiritilmoqda</Text>
            <Text style={styles.emptyDesc}>
              Ushbu kurs uchun darslar tez orada yuklanadi.
            </Text>
          </View>
        ) : (
          modules.map((module: any, mIdx: number) => {
            const lessons = module.lessons || [];

            return (
              <View key={module._id} style={styles.moduleSection}>
                {/* Clean Apple Unit Header */}
                <View style={styles.unitHeader}>
                  <Text style={styles.unitOrder}>BOB {mIdx + 1}</Text>
                  <Text style={styles.unitTitle}>{module.title}</Text>
                </View>

                {/* Stepping Path Node List */}
                <View style={styles.pathNodesWrapper}>
                  {lessons.map((lesson: any, lIdx: number) => {
                    const isCompleted = lesson.status === 'COMPLETED' || lesson.isCompleted;
                    const isLocked = lesson.status === 'LOCKED' || (!lesson.isUnlocked && lesson.status === undefined);
                    const isCurrent = !isLocked && !isCompleted;
                    const offsetX = getZigzagOffset(lIdx);

                    return (
                      <View key={lesson._id} style={[styles.nodeRow, { transform: [{ translateX: offsetX }] }]}>
                        {/* Connecting Line */}
                        {lIdx > 0 && (
                          <View style={[styles.connectingLine, isCompleted && styles.connectingLineActive]} />
                        )}

                        {/* Node Round Button */}
                        <TouchableOpacity
                          disabled={isLocked}
                          onPress={() => onSelectLesson(lesson._id)}
                          activeOpacity={0.85}
                          style={[
                            styles.nodeCircle,
                            isCompleted
                              ? styles.nodeCompleted
                              : isCurrent
                              ? styles.nodeCurrent
                              : styles.nodeLocked,
                          ]}
                        >
                          {isCompleted ? (
                            <Check size={22} color="#FFFFFF" strokeWidth={3} />
                          ) : isCurrent ? (
                            <Play size={18} color="#000000" fill="#000000" />
                          ) : (
                            <Lock size={16} color="#636366" />
                          )}

                          {isCurrent && (
                            <View style={styles.startBadge}>
                              <Text style={styles.startBadgeText}>DAVOM</Text>
                            </View>
                          )}
                        </TouchableOpacity>

                        {/* Lesson Label Under Node */}
                        <View style={styles.nodeLabelBox}>
                          <Text
                            style={[
                              styles.nodeLabelOrder,
                              isCurrent && styles.nodeLabelOrderActive,
                            ]}
                            numberOfLines={1}
                          >
                            {lesson.order || lIdx + 1}-dars
                          </Text>
                          <Text
                            style={[
                              styles.nodeLabelTitle,
                              isCompleted && styles.nodeLabelTitleDone,
                              isLocked && styles.nodeLabelTitleLocked,
                            ]}
                            numberOfLines={1}
                          >
                            {lesson.title}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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

  /* Apple Style Navigation Bar */
  navBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
  },
  navLeft: {
    flex: 1,
    marginRight: 12,
  },
  navCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  navSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  navStatsCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  navStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  navStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressTrack: {
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
  },

  /* Scroll Content */
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 95,
  },

  /* Module Section */
  moduleSection: {
    marginBottom: 32,
  },
  unitHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  unitOrder: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  /* Path nodes */
  pathNodesWrapper: {
    alignItems: 'center',
  },
  nodeRow: {
    alignItems: 'center',
    marginBottom: 26,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    top: -26,
    width: 4,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  connectingLineActive: {
    backgroundColor: '#30D158',
  },
  nodeCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: '#30D158',
  },
  nodeCurrent: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nodeLocked: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  startBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#FF9500',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  startBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nodeLabelBox: {
    alignItems: 'center',
    marginTop: 6,
    maxWidth: 160,
  },
  nodeLabelOrder: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  nodeLabelOrderActive: {
    color: '#FF9500',
    fontWeight: '700',
  },
  nodeLabelTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E5E5EA',
    marginTop: 1,
    textAlign: 'center',
  },
  nodeLabelTitleDone: {
    color: '#8E8E93',
  },
  nodeLabelTitleLocked: {
    color: '#545458',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
    backgroundColor: '#161618',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
