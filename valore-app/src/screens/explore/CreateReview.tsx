import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ChevronLeft, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';
import RatingStars from '../../components/RatingStars';
import TagPill from '../../components/TagPill';
import PrimaryButton from '../../components/PrimaryButton';
import { useHotel } from '../../hooks/useHotels';
import { useCreateReview } from '../../hooks/useReviews';
import type { ExploreStackParamList } from '../../navigation/ExploreStack';
import type { TripType } from '../../types/db';

type Props = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'CreateReview'>;
  route: RouteProp<ExploreStackParamList, 'CreateReview'>;
};

const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'couples', label: 'Couples' },
  { value: 'solo', label: 'Solo' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
  { value: 'girls_trip', label: 'Girls Trip' },
  { value: 'work', label: 'Business' },
];

export default function CreateReviewScreen({ navigation, route }: Props) {
  const { hotelId } = route.params;
  const { data: hotel } = useHotel(hotelId);
  const createReview = useCreateReview();

  const [ratingOverall, setRatingOverall] = useState(0);
  const [ratingAesthetic, setRatingAesthetic] = useState(0);
  const [ratingService, setRatingService] = useState(0);
  const [ratingAmenities, setRatingAmenities] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tripType, setTripType] = useState<TripType | null>(null);

  const handleSubmit = async () => {
    if (ratingOverall === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating');
      return;
    }

    try {
      await createReview.mutateAsync({
        hotelId,
        ratingOverall,
        ratingAesthetic: ratingAesthetic || undefined,
        ratingService: ratingService || undefined,
        ratingAmenities: ratingAmenities || undefined,
        title: title || undefined,
        body: body || undefined,
        tripType: tripType || undefined,
      });

      Alert.alert('Success', 'Your review has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hotel name */}
          <Text style={styles.hotelName}>{hotel?.name || 'Hotel'}</Text>

          {/* Overall rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Rating *</Text>
            <RatingStars
              rating={ratingOverall}
              onChange={setRatingOverall}
              interactive
              size="lg"
            />
          </View>

          {/* Detailed ratings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Ratings (Optional)</Text>
            <View style={styles.detailedRatings}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Aesthetic</Text>
                <RatingStars
                  rating={ratingAesthetic}
                  onChange={setRatingAesthetic}
                  interactive
                  size="md"
                />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Service</Text>
                <RatingStars
                  rating={ratingService}
                  onChange={setRatingService}
                  interactive
                  size="md"
                />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Amenities</Text>
                <RatingStars
                  rating={ratingAmenities}
                  onChange={setRatingAmenities}
                  interactive
                  size="md"
                />
              </View>
            </View>
          </View>

          {/* Trip type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Type (Optional)</Text>
            <View style={styles.tripTypes}>
              {TRIP_TYPES.map((type) => (
                <TagPill
                  key={type.value}
                  label={type.label}
                  selected={tripType === type.value}
                  onPress={() =>
                    setTripType(tripType === type.value ? null : type.value)
                  }
                  variant="outline"
                />
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title (Optional)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Summarize your stay"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Review body */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Review (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={setBody}
              placeholder="Share details about your experience..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Submit button */}
          <PrimaryButton
            title="Submit Review"
            onPress={handleSubmit}
            loading={createReview.isPending}
            fullWidth
            disabled={ratingOverall === 0}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  hotelName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  detailedRatings: {
    gap: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tripTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
});
