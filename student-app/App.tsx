import React, { useState } from 'react';
import { View, StyleSheet, Text, StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CurriculumScreen from './src/screens/CurriculumScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ShopScreen from './src/screens/ShopScreen';
import EventsScreen from './src/screens/EventsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DebtLockScreen from './src/screens/DebtLockScreen';
import { COLORS } from './src/constants/theme';
import BottomNavBar, { TabType } from './src/components/BottomNavBar';

function MainAppContent() {
  const { token, student, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
        <LoginScreen />
      </View>
    );
  }

  // Agar o'quvchining statusi qarzdor yoki bloklangan bo'lsa, ilovani to'sib DebtLockScreen ko'rsatiladi
  const isDebtor =
    student?.status?.toUpperCase() === 'BLOCKED' ||
    student?.status?.toUpperCase() === 'BLOCK' ||
    student?.status?.toUpperCase() === 'QARZDOR' ||
    student?.status?.toUpperCase() === 'OVERDUE' ||
    student?.paymentStatus?.toUpperCase() === 'OVERDUE' ||
    (typeof student?.totalDebt === 'number' && student.totalDebt > 0) ||
    student?.isDebtor === true;

  if (isDebtor) {
    return (
      <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <DebtLockScreen />
      </View>
    );
  }

  // If a lesson is currently open (Theory / Test / Activity)
  if (selectedLessonId) {
    return (
      <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LessonDetailScreen
          lessonId={selectedLessonId}
          onBack={() => setSelectedLessonId(null)}
          onLessonCompleted={() => {
            setSelectedLessonId(null);
            setActiveTab('home');
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Main Screen Content */}
      <View style={styles.screenWrapper}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToLearning={(lessonId) => {
              if (lessonId) {
                setSelectedLessonId(lessonId);
              } else {
                setActiveTab('learning');
              }
            }}
            onNavigateToShop={() => setActiveTab('shop')}
            onNavigateToEvents={() => setActiveTab('events')}
          />
        )}

        {activeTab === 'learning' && (
          <CurriculumScreen onSelectLesson={(lessonId) => setSelectedLessonId(lessonId)} />
        )}

        {activeTab === 'leaderboard' && <LeaderboardScreen />}

        {activeTab === 'shop' && <ShopScreen />}

        {activeTab === 'events' && (
          <EventsScreen onBack={() => setActiveTab('home')} />
        )}

        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Apple Human Interface Guidelines Bottom Tab Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedLessonId(null);
          setActiveTab(tab);
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenWrapper: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
});
