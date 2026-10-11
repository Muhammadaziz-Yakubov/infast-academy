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
import { Home, BookOpen, Trophy, ShoppingBag, User } from 'lucide-react-native';

type TabType = 'home' | 'learning' | 'leaderboard' | 'shop' | 'profile';

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

      {/* Bottom Navigation Bar (Matching reference app layout) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Home
            size={22}
            color={activeTab === 'home' ? COLORS.primary : COLORS.textMuted}
            strokeWidth={activeTab === 'home' ? 2.5 : 2}
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            Bosh sahifa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('learning')}
          activeOpacity={0.7}
        >
          <BookOpen
            size={22}
            color={activeTab === 'learning' ? COLORS.primary : COLORS.textMuted}
            strokeWidth={activeTab === 'learning' ? 2.5 : 2}
          />
          <Text style={[styles.navText, activeTab === 'learning' && styles.navTextActive]}>
            Ta'lim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('leaderboard')}
          activeOpacity={0.7}
        >
          <Trophy
            size={22}
            color={activeTab === 'leaderboard' ? COLORS.primary : COLORS.textMuted}
            strokeWidth={activeTab === 'leaderboard' ? 2.5 : 2}
          />
          <Text style={[styles.navText, activeTab === 'leaderboard' && styles.navTextActive]}>
            Reyting
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('shop')}
          activeOpacity={0.7}
        >
          <ShoppingBag
            size={22}
            color={activeTab === 'shop' ? COLORS.primary : COLORS.textMuted}
            strokeWidth={activeTab === 'shop' ? 2.5 : 2}
          />
          <Text style={[styles.navText, activeTab === 'shop' && styles.navTextActive]}>
            Do'kon
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <User
            size={22}
            color={activeTab === 'profile' ? COLORS.primary : COLORS.textMuted}
            strokeWidth={activeTab === 'profile' ? 2.5 : 2}
          />
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
            Profil
          </Text>
        </TouchableOpacity>
      </View>
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  navTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
