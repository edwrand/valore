import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStartScreen from '../screens/auth/AuthStart';
import AuthVerifyScreen from '../screens/auth/AuthVerify';
import OnboardingScreen from '../screens/auth/Onboarding';

export type AuthStackParamList = {
  AuthStart: undefined;
  AuthVerify: { email: string };
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AuthStart" component={AuthStartScreen} />
      <Stack.Screen name="AuthVerify" component={AuthVerifyScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}
