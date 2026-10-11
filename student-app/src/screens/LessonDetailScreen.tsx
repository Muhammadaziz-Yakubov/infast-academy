import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING } from '../constants/theme';
import {
  BookOpen,
  ClipboardCheck,
  Gamepad2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  RefreshCw,
  AlertCircle,
} from 'lucide-react-native';

interface LessonDetailScreenProps {
  lessonId: string;
  onBack: () => void;
  onLessonCompleted: () => void;
}

export default function LessonDetailScreen({
  lessonId,
  onBack,
  onLessonCompleted,
}: LessonDetailScreenProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'theory' | 'test' | 'activity'>('theory');
  const [submitting, setSubmitting] = useState(false);

  // Test state: array of 9 selected option indexes (0-3)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(9).fill(-1));
  const [currentTestRound, setCurrentTestRound] = useState<number>(1);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Interactive Activity State (Match Pairs)
  const [selectedLeftIdx, setSelectedLeftIdx] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [activityFinished, setActivityFinished] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/student/lessons/${lessonId}`);
      if (res.success) {
        setData(res);
      }
    } catch (e: any) {
      Alert.alert('Xatolik', e.message || 'Darsni ochib bo‘lmadi', [{ text: 'OK', onPress: onBack }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTheoryRead = async () => {
    try {
      setSubmitting(true);
      const res = await apiRequest('/api/student/submit-progress', {
        method: 'POST',
        body: { lessonId, markTheoryRead: true },
      });
      if (res.success) {
        setData((prev: any) => ({
          ...prev,
          userState: { ...prev.userState, theoryRead: true },
        }));
        setActiveTab('test');
      }
    } catch (e: any) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    const updated = [...selectedAnswers];
    updated[qIndex] = optIndex;
    setSelectedAnswers(updated);
  };

  const handleSubmitTest = async () => {
    // Verify all 9 answered
    const unanswered = selectedAnswers.findIndex((a) => a === -1);
    if (unanswered !== -1) {
      Alert.alert('Diqqat', `#${unanswered + 1}-savolga javob tanlanmadi. Barcha 9 ta savolga javob bering.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest('/api/student/submit-progress', {
        method: 'POST',
        body: { lessonId, testAnswers: selectedAnswers },
      });

      if (res.success && res.testResult) {
        setTestResult(res.testResult);
        if (res.testResult.passed) {
          setData((prev: any) => ({
            ...prev,
            userState: { ...prev.userState, testPassed: true, testScore: res.testResult.score },
          }));
          Alert.alert(
            '🎉 Tabriklaymiz!',
            `Testdan muvaffaqiyatli o'tdingiz! Natija: ${res.testResult.score}/9. Endi interaktiv mashg'ulotga o'tishingiz mumkin!`,
            [{ text: 'Mashg‘ulotga o‘tish', onPress: () => setActiveTab('activity') }]
          );
        } else {
          Alert.alert(
            'Yetarli emas',
            `Natija: ${res.testResult.score}/9. O'tish uchun kamida 8/9 to'g'ri javob talab etiladi. Qayta urinib ko'ring.`
          );
        }
      }
    } catch (e: any) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInteractiveActivity = async () => {
    try {
      setSubmitting(true);
      const res = await apiRequest('/api/student/submit-progress', {
        method: 'POST',
        body: { lessonId, interactiveSubmission: 'Muvaffaqiyatli bajarildi' },
      });

      if (res.success) {
        setActivityFinished(true);
        Alert.alert(
          '🏆 Dars To‘liq Yakunlandi!',
          `Barcha 3 bosqichni muvaffaqiyatli yakunladingiz! Sizga dars yakuniy mukofotlari berildi.`,
          [{ text: 'Ajoyib!', onPress: onLessonCompleted }]
        );
      }
    } catch (e: any) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Dars yuklanmoqda...</Text>
      </View>
    );
  }

  const lesson = data.lesson;
  const userState = data.userState;
  const activity = lesson.interactiveActivity;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.sm }}>
          <Text style={styles.lessonOrderText}>{lesson.order}-Dars</Text>
          <Text style={styles.lessonHeadingText} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
        <View style={styles.rewardChip}>
          <Award size={14} color="#EA580C" />
          <Text style={styles.rewardChipText}>+{lesson.xpReward} XP</Text>
        </View>
      </View>

      {/* 3 Steps Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'theory' && styles.tabButtonActive]}
          onPress={() => setActiveTab('theory')}
        >
          <BookOpen size={16} color={activeTab === 'theory' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'theory' && styles.tabTextActive]}>
            1. Nazariya
          </Text>
          {userState.theoryRead && <CheckCircle2 size={12} color={COLORS.accentGreen} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'test' && styles.tabButtonActive]}
          onPress={() => setActiveTab('test')}
        >
          <ClipboardCheck size={16} color={activeTab === 'test' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'test' && styles.tabTextActive]}>
            2. Test (9 ta)
          </Text>
          {userState.testPassed && <CheckCircle2 size={12} color={COLORS.accentGreen} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activity' && styles.tabButtonActive]}
          onPress={() => setActiveTab('activity')}
        >
          <Gamepad2 size={16} color={activeTab === 'activity' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
            3. Mashg'ulot
          </Text>
          {userState.practiceCompleted && <CheckCircle2 size={12} color={COLORS.accentGreen} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.bodyScroll}>
        {/* TAB 1: THEORY */}
        {activeTab === 'theory' && (
          <View style={styles.theoryContainer}>
            <View style={styles.cardBox}>
              <Text style={styles.contentTitle}>Dars Nazariy Materiali</Text>
              <Text style={styles.theoryText}>{lesson.theoryContent}</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, submitting && { opacity: 0.7 }]}
              onPress={handleMarkTheoryRead}
              disabled={submitting}
            >
              <Text style={styles.actionBtnText}>
                {userState.theoryRead ? "Test Bosqichiga O'tish &rarr;" : "Nazariyani O'qidim &rarr;"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: TEST (9 QUESTIONS) */}
        {activeTab === 'test' && (
          <View style={styles.testContainer}>
            <View style={styles.roundSelectorRow}>
              {[1, 2, 3].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roundChip, currentTestRound === r && styles.roundChipActive]}
                  onPress={() => setCurrentTestRound(r)}
                >
                  <Text style={[styles.roundChipText, currentTestRound === r && styles.roundChipTextActive]}>
                    {r}-Bosqich
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {lesson.testQuestions.map((q: any, qIdx: number) => {
              const qRound = q.round || Math.floor(qIdx / 3) + 1;
              if (qRound !== currentTestRound) return null;

              return (
                <View key={qIdx} style={styles.questionCard}>
                  <Text style={styles.questionNumberText}>#{qIdx + 1}-Savol</Text>
                  <Text style={styles.questionText}>{q.question}</Text>

                  <View style={styles.optionsCol}>
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;

                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                          onPress={() => handleSelectAnswer(qIdx, optIdx)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.optionLetterBadge, isSelected && styles.optionLetterBadgeSelected]}>
                            <Text style={[styles.optionLetterText, isSelected && { color: '#FFFFFF' }]}>
                              {String.fromCharCode(65 + optIdx)}
                            </Text>
                          </View>
                          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.actionBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmitTest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionBtnText}>Testni Tekshirish (Server)</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: INTERACTIVE ACTIVITY (MATCH PAIRS) */}
        {activeTab === 'activity' && (
          <View style={styles.activityContainer}>
            <View style={styles.activityHeaderBox}>
              <Text style={styles.activityTitle}>{activity.title || "Tushunchalar Juftligini Toping"}</Text>
              <Text style={styles.activityInstructions}>
                {activity.instructions || "Chap tomondagi tushunchani o'ng tomondagi mos ta'rif bilan tutashtiring."}
              </Text>
            </View>

            {/* Pair matching interactive puzzle */}
            <View style={styles.pairsColumnsRow}>
              {/* Left concepts */}
              <View style={styles.pairCol}>
                <Text style={styles.colHeader}>Tushuncha</Text>
                {(activity.pairs || []).map((p: any, idx: number) => {
                  const isMatched = matchedPairs.includes(idx);
                  const isSelected = selectedLeftIdx === idx;

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={isMatched}
                      style={[
                        styles.pairCard,
                        isSelected && styles.pairCardSelected,
                        isMatched && styles.pairCardMatched,
                      ]}
                      onPress={() => setSelectedLeftIdx(idx)}
                    >
                      <Text style={[styles.pairText, isSelected && { color: '#FFFFFF' }]}>
                        {p.left}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Right definitions */}
              <View style={styles.pairCol}>
                <Text style={styles.colHeader}>Ta'rif / Natija</Text>
                {(activity.pairs || []).map((p: any, idx: number) => {
                  const isMatched = matchedPairs.includes(idx);

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={isMatched}
                      style={[styles.pairCard, isMatched && styles.pairCardMatched]}
                      onPress={() => {
                        if (selectedLeftIdx === null) {
                          Alert.alert('Diqqat', 'Avval chap tomondagi tushunchani tanlang');
                          return;
                        }
                        if (selectedLeftIdx === idx) {
                          // Correct match!
                          const next = [...matchedPairs, idx];
                          setMatchedPairs(next);
                          setSelectedLeftIdx(null);
                          if (next.length === (activity.pairs || []).length) {
                            Alert.alert('🎉 Ajoyib!', 'Barcha juftliklarni to‘g‘ri topdingiz!');
                          }
                        } else {
                          Alert.alert('Noto‘g‘ri', 'Juftlik mos kelmadi, qayta urinib ko‘ring');
                        }
                      }}
                    >
                      <Text style={styles.pairText}>{p.right}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnFinish,
                (submitting || matchedPairs.length < (activity.pairs?.length || 1)) && { opacity: 0.6 },
              ]}
              onPress={handleFinishInteractiveActivity}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionBtnText}>Mashg'ulotni Yakunlash va Mukofotni Olish</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 6,
  },
  lessonOrderText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  lessonHeadingText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rewardChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636366',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  bodyScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  theoryContainer: {
    gap: SPACING.lg,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  theoryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3C3C43',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnFinish: {
    backgroundColor: '#34C759',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  testContainer: {
    gap: 12,
  },
  roundSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roundChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E5E5EA',
  },
  roundChipActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  roundChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636366',
  },
  roundChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 8,
    letterSpacing: -0.2,
  },
  optionsCol: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
  },
  optionRowSelected: {
    backgroundColor: '#FFF4E6',
    borderWidth: 1.5,
    borderColor: '#FF9500',
  },
  optionLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionLetterBadgeSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionLetterText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  activityContainer: {
    gap: SPACING.lg,
  },
  activityHeaderBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#312E81',
    marginBottom: 4,
  },
  activityInstructions: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
  pairsColumnsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pairCol: {
    flex: 1,
    gap: SPACING.sm,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pairCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 54,
    justifyContent: 'center',
  },
  pairCardSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  pairCardMatched: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    opacity: 0.6,
  },
  pairText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
