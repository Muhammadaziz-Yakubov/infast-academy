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
  XCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Flame,
  Check,
  ChevronRight,
  ChevronLeft,
  Target,
  HelpCircle,
  Zap,
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

  // Test state: single question step-by-step
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);

  // Interactive Practice State (Blind Matching - no immediate right/wrong clues)
  // student picks pairs and binds them silently into connections
  const [selectedLeftIdx, setSelectedLeftIdx] = useState<number | null>(null);
  const [userPairs, setUserPairs] = useState<Record<number, number>>({}); // leftIdx -> rightIdx
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/student/lessons/${lessonId}`);
      if (res.success) {
        setData(res);
        const qCount = res.lesson?.testQuestions?.length || 9;
        setSelectedAnswers(new Array(qCount).fill(-1));
        setCurrentQuestionIdx(0);
        setTestCompleted(false);
        setTestResult(null);
        if (res.userState?.testPassed) {
          setTestCompleted(true);
          const savedResult = res.userState.testResultDetails || {
            score: res.userState.testScore || 0,
            maxScore: qCount,
            percentage: Math.round(((res.userState.testScore || 0) / qCount) * 100),
            details: (res.lesson?.testQuestions || []).map((q: any, idx: number) => ({
              questionIndex: idx,
              isCorrect: true,
              explanation: q.explanation || '',
            })),
          };
          setTestResult(savedResult);
          if (Array.isArray(res.userState.testAnswers) && res.userState.testAnswers.length > 0) {
            setSelectedAnswers(res.userState.testAnswers);
          }
        }

        if (res.userState?.practiceCompleted) {
          setActiveTab('activity');
          setPracticeCompleted(true);
        } else if (res.userState?.testPassed) {
          setActiveTab('test'); // O'quvchi test natijasini (overall ball) ko'rishi uchun
        } else if (res.userState?.theoryRead) {
          setActiveTab('test');
        } else {
          setActiveTab('theory');
        }
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

  const handleSelectAnswer = (optIndex: number) => {
    if (testCompleted) return; // Qayta o'zgartirish yoki qayta ishlash mumkin emas
    const updated = [...selectedAnswers];
    updated[currentQuestionIdx] = optIndex;
    setSelectedAnswers(updated);
  };

  const handleSubmitTest = async () => {
    const unanswered = selectedAnswers.findIndex((a) => a === -1);
    if (unanswered !== -1) {
      Alert.alert(
        'Eslatma',
        `#${unanswered + 1}-savolga javob belgilanmagan. Iltimos, barcha savollarga javob belgilang.`,
        [{ text: 'Savolga o‘tish', onPress: () => setCurrentQuestionIdx(unanswered) }]
      );
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
        setTestCompleted(true);
        setData((prev: any) => ({
          ...prev,
          userState: { ...prev.userState, testPassed: true, testScore: res.testResult.score },
        }));
      }
    } catch (e: any) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Practice: Pair Selection without revealing correct/wrong
  const handleSelectLeft = (idx: number) => {
    if (practiceCompleted) return;
    setSelectedLeftIdx(idx);
  };

  const handleSelectRight = (rightIdx: number) => {
    if (practiceCompleted) return;
    if (selectedLeftIdx === null) {
      Alert.alert('Diqqat', 'Avval chap ustundan bitta tushunchani tanlang.');
      return;
    }
    // Bind them together silently (no correct/incorrect alert)
    setUserPairs((prev) => ({
      ...prev,
      [selectedLeftIdx]: rightIdx,
    }));
    setSelectedLeftIdx(null);
  };

  const handleRemovePair = (leftIdx: number) => {
    if (practiceCompleted) return;
    setUserPairs((prev) => {
      const copy = { ...prev };
      delete copy[leftIdx];
      return copy;
    });
  };

  const handleFinishPractice = async () => {
    try {
      setSubmitting(true);
      const res = await apiRequest('/api/student/submit-progress', {
        method: 'POST',
        body: { lessonId, interactiveSubmission: JSON.stringify(userPairs) },
      });

      if (res.success) {
        setPracticeCompleted(true);
        setData((prev: any) => ({
          ...prev,
          userState: { ...prev.userState, practiceCompleted: true, status: 'COMPLETED' },
        }));
        Alert.alert(
          '🏆 Dars Muvaffaqiyatli Yakunlandi!',
          `Barcha bosqichlar to'liq bajarildi va profilingizga ballar yozildi!\nNavbatdagi dars ochildi.`,
          [{ text: 'Davom etish', onPress: onLessonCompleted }]
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
  const questions = lesson.testQuestions || [];
  const totalQ = questions.length || 9;
  const currentQ = questions[currentQuestionIdx];
  const activity = lesson.interactiveActivity || {};
  const pairs = activity.pairs || [
    { left: 'const', right: "O'zgarmas qiymat saqlash" },
    { left: 'let', right: "O'zgaruvchan qiymat saqlash" },
    { left: 'function', right: "Qayta ishlatiluvchi mantiq" },
  ];

  const currentAnswer = selectedAnswers[currentQuestionIdx];
  const answeredCount = selectedAnswers.filter((a) => a !== -1).length;
  const connectedPairsCount = Object.keys(userPairs).length;

  return (
    <View style={styles.container}>
      {/* Premium Minimal Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerBadge}>{lesson.order}-DARS</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>

        <View style={styles.xpPill}>
          <Zap size={14} color="#FF9500" fill="#FF9500" />
          <Text style={styles.xpPillText}>+{lesson.xpReward || 50} XP</Text>
        </View>
      </View>

      {/* Segmented Step Switcher (Apple/Duolingo style) */}
      <View style={styles.navSegmentsContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'theory' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('theory')}
          activeOpacity={0.8}
        >
          <BookOpen
            size={15}
            color={activeTab === 'theory' ? '#FF9500' : '#8E8E93'}
          />
          <Text style={[styles.segmentText, activeTab === 'theory' && styles.segmentTextActive]}>
            Nazariya
          </Text>
          {userState.theoryRead && <View style={styles.tinyDoneDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'test' && styles.segmentBtnActive]}
          onPress={() => {
            if (!userState.theoryRead) {
              Alert.alert('Diqqat', 'Avval dars nazariyasini o‘qib chiqing.');
              return;
            }
            setActiveTab('test');
          }}
          activeOpacity={0.8}
        >
          <ClipboardCheck
            size={15}
            color={activeTab === 'test' ? '#FF9500' : '#8E8E93'}
          />
          <Text style={[styles.segmentText, activeTab === 'test' && styles.segmentTextActive]}>
            Test (9 ta)
          </Text>
          {(testCompleted || userState.testPassed) && <View style={styles.tinyDoneDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'activity' && styles.segmentBtnActive]}
          onPress={() => {
            if (!userState.testPassed && !testCompleted) {
              Alert.alert('Diqqat', 'Avval testni yakunlang.');
              return;
            }
            setActiveTab('activity');
          }}
          activeOpacity={0.8}
        >
          <Gamepad2
            size={15}
            color={activeTab === 'activity' ? '#5E5CE6' : '#8E8E93'}
          />
          <Text style={[styles.segmentText, activeTab === 'activity' && styles.segmentTextActive]}>
            Amaliyot
          </Text>
          {(practiceCompleted || userState.practiceCompleted) && <View style={styles.tinyDoneDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* ========================================================= */}
        {/* TAB 1: NAZARIYA                                           */}
        {/* ========================================================= */}
        {activeTab === 'theory' && (
          <View style={styles.tabSection}>
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderTop}>
                <View style={styles.sectionTag}>
                  <Text style={styles.sectionTagText}>1-BOSQICH</Text>
                </View>
                <Text style={styles.readTimeText}>~3 daqiqa</Text>
              </View>

              <Text style={styles.cleanCardHeading}>{lesson.title}</Text>
              {lesson.description ? (
                <Text style={styles.cleanCardSub}>{lesson.description}</Text>
              ) : null}

              <View style={styles.theoryBox}>
                <Text style={styles.theoryText}>
                  {lesson.theoryContent || "Nazariy ma'lumot tez orada joylanadi."}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.bottomPrimaryBtn, submitting && { opacity: 0.6 }]}
              onPress={handleMarkTheoryRead}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.bottomPrimaryBtnText}>
                    {userState.theoryRead ? "Testga O'tish" : "Nazariyani O'qidim"}
                  </Text>
                  <ArrowRight size={18} color="#000000" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TEST (STEP-BY-STEP, OXIRIDA OVERALL BALL VA XP)    */}
        {/* ========================================================= */}
        {activeTab === 'test' && (
          <View style={styles.tabSection}>
            {/* AGAR TEST TOPSHIRILGAN BO'LSA - OXIRIDA NATIJA VA BALL KO'RINADI */}
            {testCompleted && testResult ? (
              <View style={styles.resultsWrapper}>
                {/* Overall Score Card */}
                <View style={styles.scoreHeroCard}>
                  <View style={styles.scoreIconCircle}>
                    <Award size={36} color="#FF9500" />
                  </View>

                  <Text style={styles.scoreHeroTitle}>Test Yakunlandi!</Text>
                  <Text style={styles.scoreBigText}>
                    {testResult.score} / {testResult.maxScore}
                  </Text>
                  <Text style={styles.scorePercentLabel}>
                    To'g'rilik ko'rsatkichi: {testResult.percentage || Math.round((testResult.score / testResult.maxScore) * 100)}%
                  </Text>

                  {/* XP & Coin Earned based on score */}
                  <View style={styles.earnedRewardsBox}>
                    <View style={styles.rewardCol}>
                      <Text style={styles.rewardNum}>+{testResult.earnedXp || 0} XP</Text>
                      <Text style={styles.rewardTitle}>To'plangan XP</Text>
                    </View>
                    <View style={styles.rewardDivider} />
                    <View style={styles.rewardCol}>
                      <Text style={styles.rewardNum}>+{testResult.earnedXcoin || 0}</Text>
                      <Text style={styles.rewardTitle}>XCoin</Text>
                    </View>
                  </View>

                  <Text style={styles.scoreNote}>
                    Ballaringiz hisobga olindi va profilingizga qo'shildi. Testni qayta ishlash mumkin emas. Endi amaliy mashg'ulotga o'tishingiz mumkin!
                  </Text>
                </View>

                {/* Savollar Tahlili: Talaba ko'radi qaysi to'g'ri, qaysi noto'g'ri */}
                <View style={styles.answersAnalysisCard}>
                  <Text style={styles.analysisHeader}>Savollar bo'yicha hisobot:</Text>

                  {testResult.details?.map((det: any, idx: number) => {
                    const qObj = questions[idx];
                    const studentPick = selectedAnswers[idx];
                    const isCorrect = det.isCorrect;

                    return (
                      <View
                        key={idx}
                        style={[
                          styles.analysisItem,
                          isCorrect ? styles.itemCorrectBorder : styles.itemWrongBorder,
                        ]}
                      >
                        <View style={styles.analysisTopLine}>
                          <Text style={styles.analysisQNumber}>#{idx + 1}-savol</Text>
                          <View
                            style={[
                              styles.statusTag,
                              isCorrect ? styles.statusTagCorrect : styles.statusTagWrong,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusTagText,
                                isCorrect ? { color: '#30D158' } : { color: '#FF453A' },
                              ]}
                            >
                              {isCorrect ? "To'g'ri (+XP)" : "Noto'g'ri"}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.analysisQText}>{qObj?.question}</Text>

                        <Text style={styles.analysisPickedLine}>
                          Sizning javobingiz:{' '}
                          <Text style={{ fontWeight: '700', color: isCorrect ? '#30D158' : '#FF453A' }}>
                            {studentPick !== -1 ? qObj?.options[studentPick] : "Javob berilmagan"}
                          </Text>
                        </Text>

                        {!isCorrect && det.correctAnswerIndex !== undefined && (
                          <Text style={styles.analysisCorrectLine}>
                            To'g'ri javob:{' '}
                            <Text style={{ fontWeight: '700', color: '#30D158' }}>
                              {qObj?.options[det.correctAnswerIndex]}
                            </Text>
                          </Text>
                        )}

                        {det.explanation ? (
                          <Text style={styles.analysisExplanation}>💡 {det.explanation}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>

                {/* Davom etish tugmasi */}
                <TouchableOpacity
                  style={[styles.bottomPrimaryBtn, styles.greenBtn]}
                  onPress={() => setActiveTab('activity')}
                  activeOpacity={0.85}
                >
                  <View style={styles.btnRow}>
                    <Text style={styles.bottomPrimaryBtnText}>Amaliy Mashg'ulotga O'tish</Text>
                    <ArrowRight size={18} color="#000000" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* TEST ISHLANAYOTGAN PAYT: Step-by-Step, to'g'ri/noto'g'ri bildirilmaydi */
              <View>
                {/* Progress bar */}
                <View style={styles.testProgressHeader}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${((currentQuestionIdx + 1) / totalQ) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressCounter}>
                    {currentQuestionIdx + 1} / {totalQ}
                  </Text>
                </View>

                {/* Duolingo Question Card */}
                {currentQ && (
                  <View style={styles.questionCardMain}>
                    <View style={styles.qMetaRow}>
                      <Text style={styles.qOrderBadge}>SAVOL #{currentQuestionIdx + 1}</Text>
                      <Text style={styles.qRemainBadge}>
                        Javob berildi: {answeredCount}/{totalQ}
                      </Text>
                    </View>

                    <Text style={styles.qQuestionText}>{currentQ.question}</Text>

                    {/* 4 Variant */}
                    <View style={styles.optionsList}>
                      {currentQ.options?.map((opt: string, optIdx: number) => {
                        const isSelected = currentAnswer === optIdx;

                        return (
                          <TouchableOpacity
                            key={optIdx}
                            style={[
                              styles.optionCard,
                              isSelected && styles.optionCardSelected,
                            ]}
                            onPress={() => handleSelectAnswer(optIdx)}
                            activeOpacity={0.8}
                          >
                            <View
                              style={[
                                styles.optionCircle,
                                isSelected && styles.optionCircleSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.optionLetter,
                                  isSelected && styles.optionLetterSelected,
                                ]}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </Text>
                            </View>

                            <Text
                              style={[
                                styles.optionLabel,
                                isSelected && styles.optionLabelSelected,
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Oldingi / Keyingi / Yakunlash tugmalari */}
                <View style={styles.testNavButtons}>
                  <TouchableOpacity
                    style={[
                      styles.secondaryNavBtn,
                      currentQuestionIdx === 0 && { opacity: 0.35 },
                    ]}
                    disabled={currentQuestionIdx === 0}
                    onPress={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={18} color="#FFFFFF" />
                    <Text style={styles.secondaryNavText}>Oldingi</Text>
                  </TouchableOpacity>

                  {currentQuestionIdx < totalQ - 1 ? (
                    <TouchableOpacity
                      style={[
                        styles.primaryNavBtn,
                        currentAnswer === -1 && { opacity: 0.5 },
                      ]}
                      onPress={() => setCurrentQuestionIdx((p) => p + 1)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryNavText}>Keyingi</Text>
                      <ChevronRight size={18} color="#000000" strokeWidth={2.5} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.primaryNavBtn,
                        styles.submitTestBtn,
                        (answeredCount < totalQ || submitting) && { opacity: 0.6 },
                      ]}
                      disabled={submitting}
                      onPress={handleSubmitTest}
                      activeOpacity={0.85}
                    >
                      {submitting ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <View style={styles.btnRow}>
                          <Text style={styles.primaryNavText}>Testni Yakunlash</Text>
                          <Check size={18} color="#000000" strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* Raqamli navigatsiya */}
                <View style={styles.dotsRow}>
                  {questions.map((_: any, idx: number) => {
                    const isAnswered = selectedAnswers[idx] !== -1;
                    const isCurrent = currentQuestionIdx === idx;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.dotButton,
                          isAnswered && styles.dotButtonAnswered,
                          isCurrent && styles.dotButtonCurrent,
                        ]}
                        onPress={() => setCurrentQuestionIdx(idx)}
                      >
                        <Text
                          style={[
                            styles.dotNumber,
                            (isAnswered || isCurrent) && styles.dotNumberActive,
                          ]}
                        >
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AMALIYOT (JUFTLIKNI TANLASH - TO'G'RI/NOTO'G'RI   */}
        {/* BILINMASIN, TALABA ERKIN MOSLASHTIRIB TOPSHIRADI)        */}
        {/* ========================================================= */}
        {activeTab === 'activity' && (
          <View style={styles.tabSection}>
            <View style={styles.cleanCard}>
              <View style={styles.cardHeaderTop}>
                <View style={[styles.sectionTag, { backgroundColor: 'rgba(94, 92, 230, 0.2)' }]}>
                  <Text style={[styles.sectionTagText, { color: '#5E5CE6' }]}>3-BOSQICH: AMALIYOT</Text>
                </View>
                {(practiceCompleted || userState.practiceCompleted) && (
                  <View style={styles.completedBadge}>
                    <Check size={12} color="#30D158" strokeWidth={3} />
                    <Text style={styles.completedBadgeText}>Bajarildi</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cleanCardHeading}>
                {activity.title || "Tushunchalar Juftligini Moslashtiring"}
              </Text>
              <Text style={styles.cleanCardSub}>
                {activity.instructions ||
                  "Chap tomondagi tushunchani bosing va o‘ng tomondagi mos deb hisoblagan ta'rif bilan tutashtiring."}
              </Text>

              {/* 2 Ustunli Juftlash (To'g'ri/Noto'g'ri javob oldindan aytilmaydi) */}
              <View style={styles.pairsLayoutRow}>
                {/* Chap ustun */}
                <View style={styles.columnBox}>
                  <Text style={styles.colTitle}>Tushuncha</Text>
                  {pairs.map((p: any, idx: number) => {
                    const isSelected = selectedLeftIdx === idx;
                    const isBound = userPairs[idx] !== undefined;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.pairItemBtn,
                          isSelected && styles.pairItemBtnSelected,
                          isBound && styles.pairItemBtnBound,
                        ]}
                        onPress={() => handleSelectLeft(idx)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.pairItemText,
                            isSelected && { color: '#FFFFFF', fontWeight: '800' },
                            isBound && { color: '#FF9500' },
                          ]}
                        >
                          {p.left}
                        </Text>
                        {isBound && (
                          <TouchableOpacity
                            onPress={() => handleRemovePair(idx)}
                            style={styles.removePairBtn}
                          >
                            <Text style={styles.removePairText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* O'ng ustun */}
                <View style={styles.columnBox}>
                  <Text style={styles.colTitle}>Ta'rif / Natija</Text>
                  {pairs.map((p: any, rIdx: number) => {
                    // Tekshirish: o'ng tomondagi element qaysi chap elementga bog'langan
                    const boundLeft = Object.entries(userPairs).find(([_, v]) => v === rIdx);
                    const isBound = !!boundLeft;

                    return (
                      <TouchableOpacity
                        key={rIdx}
                        style={[
                          styles.pairItemBtn,
                          isBound && styles.pairItemBtnBound,
                        ]}
                        onPress={() => handleSelectRight(rIdx)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.pairItemText,
                            isBound && { color: '#FF9500', fontWeight: '700' },
                          ]}
                        >
                          {p.right}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.pairCountRow}>
                <Text style={styles.pairCountText}>
                  Ulandi: {connectedPairsCount} / {pairs.length} juftlik
                </Text>
              </View>
            </View>

            {/* Yakunlash tugmasi */}
            <TouchableOpacity
              style={[
                styles.bottomPrimaryBtn,
                styles.greenBtn,
                submitting && { opacity: 0.6 },
              ]}
              disabled={submitting}
              onPress={handleFinishPractice}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.bottomPrimaryBtnText}>
                    {userState.practiceCompleted
                      ? "Dars To'liq Bajarilgan"
                      : "Mashg'ulotni Yakunlash va Darsni Tugatish"}
                  </Text>
                  <Award size={18} color="#000000" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B', // Premium sleek dark AMOLED
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

  /* Top Clean Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
  },
  xpPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9500',
  },

  /* Segmented Nav Bar */
  navSegmentsContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    position: 'relative',
  },
  segmentBtnActive: {
    backgroundColor: '#27272A',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tinyDoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },

  /* Scroll Body */
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  tabSection: {
    gap: 16,
  },

  /* Clean Premium Cards */
  cleanCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTag: {
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 0.5,
  },
  readTimeText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  cleanCardHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  cleanCardSub: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 18,
    marginBottom: 16,
  },
  theoryBox: {
    backgroundColor: '#09090B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  theoryText: {
    fontSize: 14,
    lineHeight: 23,
    color: '#E4E4E7',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  /* Bottom Primary Action Button */
  bottomPrimaryBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  greenBtn: {
    backgroundColor: '#30D158',
    shadowColor: '#30D158',
  },
  bottomPrimaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* Test Progress Header */
  testProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#27272A',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 5,
  },
  progressCounter: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Test Question Card */
  questionCardMain: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  qMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qOrderBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 0.8,
  },
  qRemainBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
  },
  qQuestionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderColor: '#FF9500',
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionCircleSelected: {
    backgroundColor: '#FF9500',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A1A1AA',
  },
  optionLetterSelected: {
    color: '#000000',
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E4E7',
    lineHeight: 20,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Test Navigation */
  testNavButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  secondaryNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#27272A',
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryNavText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryNavBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitTestBtn: {
    backgroundColor: '#30D158',
  },
  primaryNavText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dotButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotButtonAnswered: {
    backgroundColor: 'rgba(255, 149, 0, 0.25)',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  dotButtonCurrent: {
    backgroundColor: '#FF9500',
  },
  dotNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  dotNumberActive: {
    color: '#000000',
    fontWeight: '800',
  },

  /* Score Hero Card (After Test) */
  resultsWrapper: {
    gap: 16,
  },
  scoreHeroCard: {
    backgroundColor: '#18181B',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  scoreBigText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FF9500',
    marginVertical: 4,
  },
  scorePercentLabel: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '600',
    marginBottom: 16,
  },
  earnedRewardsBox: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  rewardCol: {
    flex: 1,
    alignItems: 'center',
  },
  rewardNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rewardTitle: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
    fontWeight: '600',
  },
  rewardDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scoreNote: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Answers Review */
  answersAnalysisCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  analysisHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisItem: {
    backgroundColor: '#27272A',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
  },
  itemCorrectBorder: {
    borderLeftColor: '#30D158',
  },
  itemWrongBorder: {
    borderLeftColor: '#FF453A',
  },
  analysisTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  analysisQNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717A',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagCorrect: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  statusTagWrong: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  analysisQText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  analysisPickedLine: {
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 3,
  },
  analysisCorrectLine: {
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 3,
  },
  analysisExplanation: {
    fontSize: 12,
    color: '#FFD60A',
    marginTop: 6,
    fontStyle: 'italic',
  },

  /* Activity Matching Styles */
  pairsLayoutRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  columnBox: {
    flex: 1,
    gap: 8,
  },
  colTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717A',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pairItemBtn: {
    backgroundColor: '#27272A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pairItemBtnSelected: {
    backgroundColor: 'rgba(94, 92, 230, 0.25)',
    borderColor: '#5E5CE6',
  },
  pairItemBtnBound: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderColor: '#FF9500',
  },
  pairItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  removePairBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  removePairText: {
    fontSize: 10,
    color: '#FF453A',
    fontWeight: '800',
  },
  pairCountRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  pairCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedBadgeText: {
    color: '#30D158',
    fontSize: 11,
    fontWeight: '700',
  },
});
