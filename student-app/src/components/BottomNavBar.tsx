import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, BookOpen, Trophy, ShoppingBag, User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export type TabType = 'home' | 'learning' | 'leaderboard' | 'shop' | 'profile';

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
  { id: 'profile', label: 'Profil', IconComponent: User },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  shopBadge,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
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
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <IconComponent
                  size={22}
                  color={isActive ? COLORS.primary : '#94A3B8'}
                  strokeWidth={isActive ? 2.5 : 2}
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

              {isActive ? (
                <View style={styles.activeIndicatorDot} />
              ) : (
                <View style={styles.inactiveIndicatorDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.12)', // Light InFast orange tint
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 3,
  },
  inactiveIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});

export default BottomNavBar;
