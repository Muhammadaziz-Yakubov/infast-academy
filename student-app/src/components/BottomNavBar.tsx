import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Trophy, ShoppingBag, User } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export type TabType = 'home' | 'learning' | 'leaderboard' | 'shop' | 'events' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  shopBadge?: number;
}

interface TabItem {
  id: TabType;
  label: string;
  IconComponent: any;
  isProfile?: boolean;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Asosiy', IconComponent: Home },
  { id: 'learning', label: "Ta'lim", IconComponent: BookOpen },
  { id: 'leaderboard', label: 'Reyting', IconComponent: Trophy },
  { id: 'shop', label: "Do'kon", IconComponent: ShoppingBag },
  { id: 'profile', label: 'Profil', IconComponent: User, isProfile: true },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  shopBadge,
}) => {
  const insets = useSafeAreaInsets();
  const { student } = useAuth();
  const bottomMargin = insets.bottom > 0 ? insets.bottom + 4 : 14;

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={[styles.floatingBar, { marginBottom: bottomMargin }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const { IconComponent, isProfile } = tab;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              {...(Platform.OS === 'web'
                ? ({
                    style: [
                      styles.tabItem,
                      isActive && styles.tabItemActive,
                      // @ts-ignore
                      { outline: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' },
                    ],
                  } as any)
                : {})}
            >
              {/* Icon Container */}
              <View style={styles.iconWrapper}>
                {isProfile && student?.avatarUrl ? (
                  <View style={[styles.avatarCircle, isActive && styles.avatarCircleActive]}>
                    <Image source={{ uri: student.avatarUrl }} style={styles.avatarImg} />
                  </View>
                ) : (
                  <IconComponent
                    size={21}
                    color={isActive ? '#FF9500' : '#FFFFFF'}
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                )}

                {tab.id === 'shop' && typeof shopBadge === 'number' && shopBadge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{shopBadge > 9 ? '9+' : shopBadge}</Text>
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Hech qanday qora fon yo'q, to'liq shaffof
    zIndex: 999,
  },
  floatingBar: {
    marginHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 32, 44, 0.82)', // Nafis yarim-shaffof Dark Glass
    borderRadius: 28,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Nozik shisha chegara
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 22,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.18)', // Telegram uslubidagi faol kapsula
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: 2,
  },
  avatarCircle: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarCircleActive: {
    borderColor: '#FF9500',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: '#FF9500',
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF453A',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default BottomNavBar;
