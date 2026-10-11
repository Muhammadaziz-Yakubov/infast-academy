import React, { useState } from 'react';
import { View, StyleSheet, Text, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CurriculumScreen from './src/screens/CurriculumScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/constants/theme';
import BottomNavBar, { TabType } from './src/components/BottomNavBar';

function MainAppContent() {
  const { token, loading } = useAuth();
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
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

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
          />
        )}

        {activeTab === 'learning' && (
          <CurriculumScreen onSelectLesson={(lessonId) => setSelectedLessonId(lessonId)} />
        )}

        {activeTab === 'leaderboard' && <LeaderboardScreen />}

        {activeTab === 'shop' && <ShopScreen />}

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
    backgroundColor: COLORS.background, // iOS #F2F2F7
  },
  screenWrapper: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
