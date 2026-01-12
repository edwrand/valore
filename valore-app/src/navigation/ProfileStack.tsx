import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyProfileScreen from '../screens/profile/MyProfile';
import EditProfileScreen from '../screens/profile/EditProfile';
import MyReviewsScreen from '../screens/profile/MyReviews';
import SettingsScreen from '../screens/profile/Settings';
import FollowersListScreen from '../screens/profile/FollowersList';
import FollowingListScreen from '../screens/profile/FollowingList';
import HotelDetailScreen from '../screens/explore/HotelDetail';
import SavedListsScreen from '../screens/saved/SavedLists';
import ListDetailScreen from '../screens/saved/ListDetail';

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  MyReviews: undefined;
  Settings: undefined;
  HotelDetail: { hotelId: string };
  SavedLists: undefined;
  ListDetail: { listId: string };
  FollowersList: { userId: string };
  FollowingList: { userId: string };
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
      <Stack.Screen name="SavedLists" component={SavedListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} />
      <Stack.Screen name="FollowingList" component={FollowingListScreen} />
    </Stack.Navigator>
  );
}
