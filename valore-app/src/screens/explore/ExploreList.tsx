import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme';
import SearchBar from '../../components/SearchBar';
import HotelCard from '../../components/HotelCard';
import TagPill from '../../components/TagPill';
import { useHotels, useTags } from '../../hooks/useHotels';
import { useToggleSave, useIsHotelSaved } from '../../hooks/useSaveHotel';
import type { ExploreStackParamList } from '../../navigation/ExploreStack';
import type { HotelWithDetails } from '../../types/models';

type Props = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'ExploreList'>;
};

export default function ExploreListScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: hotels, isLoading, refetch, isRefetching } = useHotels({
    query: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  const { data: tags } = useTags();
  const toggleSave = useToggleSave();

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleHotelPress = (hotelId: string) => {
    navigation.navigate('HotelDetail', { hotelId });
  };

  const handleSave = (hotelId: string) => {
    toggleSave.mutate({ hotelId });
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search hotels, cities..."
      />

      {/* Tags filter */}
      {tags && tags.length > 0 && (
        <FlatList
          horizontal
          data={tags}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          renderItem={({ item }) => (
            <TagPill
              label={item.name}
              selected={selectedTags.includes(item.id)}
              onPress={() => toggleTag(item.id)}
              variant="outline"
            />
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );

  const renderItem = ({ item }: { item: HotelWithDetails }) => (
    <View style={styles.cardWrapper}>
      <HotelCard
        hotel={item}
        onPress={() => handleHotelPress(item.id)}
        onSave={() => handleSave(item.id)}
        isSaved={item.is_saved}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {searchQuery || selectedTags.length > 0
          ? 'No hotels match your search'
          : 'No hotels found'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      {isLoading && !hotels ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={hotels}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  tagsContainer: {
    gap: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
