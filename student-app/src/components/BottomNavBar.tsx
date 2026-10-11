import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  // Safe margin so icons never collide with gesture pill or navigation bar
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
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <IconComponent
                  size={22}
                  color={isActive ? COLORS.primary : '#8E8E93'}
                  strokeWidth={isActive ? 2.4 : 1.8}
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
    backgroundColor: '#121214', // Apple Dark Frosted Surface
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
  },
  iconContainer: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)', // Glowing subtle orange halo
  },
  label: {
    fontSize: 10,
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
    right: 2,
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
