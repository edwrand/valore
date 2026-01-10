import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyProfileScreen from '../screens/profile/MyProfile';
import EditProfileScreen from '../screens/profile/EditProfile';
import MyReviewsScreen from '../screens/profile/MyReviews';
import SettingsScreen from '../screens/profile/Settings';
import HotelDetailScreen from '../screens/explore/HotelDetail';

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  MyReviews: undefined;
  Settings: undefined;
  HotelDetail: { hotelId: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
    </Stack.Navigator>
  );
}
