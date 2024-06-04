import React from 'react';
import { View } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons, Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import ImageGenerator from './ImageGenerator';
import SearchStack from './SearchStack';
import PrincipalScreen from './Principal';
import ProfileScreen from './Profile';
import ChatStack from './ChatStack';

const Tab = createMaterialBottomTabNavigator();

const HomeScreen = () => {
    return (
        <Tab.Navigator
            barStyle={{ backgroundColor: 'black', height: 30, justifyContent: 'center', alignItems: 'center' }} 
            activeColor="#0096FF" 
            inactiveColor="gray" 
            labeled={false} 
            shifting={false} 
            screenOptions={{
                tabBarIconStyle: {
                    backgroundColor: '#0096FF', 
                },
            }}
        >
            <Tab.Screen 
                name="Principal" 
                component={PrincipalScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="Search" 
                component={SearchStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="search"
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="ImagePost" 
                component={ImageGenerator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather
                            name="plus-square"
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="Direct" 
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Entypo
                            name="direction"
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome
                            name="user-circle-o"
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default HomeScreen;
