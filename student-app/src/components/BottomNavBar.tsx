import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Trophy, ShoppingBag, Calendar, User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

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
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Bosh sahifa', IconComponent: Home },
  { id: 'learning', label: "Ta'lim", IconComponent: BookOpen },
  { id: 'leaderboard', label: 'Reyting', IconComponent: Trophy },
  { id: 'shop', label: "Do'kon", IconComponent: ShoppingBag },
  { id: 'events', label: 'Tadbirlar', IconComponent: Calendar },
  { id: 'profile', label: 'Profil', IconComponent: User },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  shopBadge,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 6 : 22;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBarRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const { IconComponent } = tab;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              {...(Platform.OS === 'web'
                ? ({
                    style: [
                      styles.tabButton,
                      // @ts-ignore
                      { outline: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' },
                    ],
                  } as any)
                : {})}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  size={21}
                  color={isActive ? COLORS.primary : '#8E8E93'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {tab.id === 'shop' && typeof shopBadge === 'number' && shopBadge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{shopBadge > 9 ? '9+' : shopBadge}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.label, isActive && styles.labelActive]}>
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
  container: {
    backgroundColor: '#121214',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 0,
    backgroundColor: '#FF453A',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#121214',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default BottomNavBar;
