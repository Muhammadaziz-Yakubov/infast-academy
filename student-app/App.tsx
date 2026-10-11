import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth } from './src/context/AuthContext';
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
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  if (!token) {
    return <LoginScreen />;
  }

  // If a lesson is currently active in Learning tab
  if (selectedLessonId) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LessonDetailScreen
          lessonId={selectedLessonId}
          onBack={() => setSelectedLessonId(null)}
          onLessonCompleted={() => {
            setSelectedLessonId(null);
            setActiveTab('home');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.mainArea}>
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

      {/* Modern Dedicated Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedLessonId(null);
          setActiveTab(tab);
        }}
      />
    </SafeAreaView>
  );
}

import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  mainArea: {
    flex: 1,
  },
});
