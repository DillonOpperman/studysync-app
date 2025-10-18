// src/components/AppLogo.tsx
import React from 'react';
import Svg, { Path, Rect, G, Defs, ClipPath } from 'react-native-svg';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 80, style }) => {
  return (
    <View style={[styles.container, style, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background rounded square */}
        <Rect
          x="10"
          y="10"
          width="180"
          height="180"
          rx="30"
          fill="#8b4513"
        />
        
        {/* Open book - left page */}
        <Path
          d="M 60 70 Q 60 75 65 80 L 65 140 Q 60 145 60 150 L 60 70 Z"
          fill="#f5f5dc"
          stroke="#d4c4a8"
          strokeWidth="2"
        />
        <Path
          d="M 65 80 L 95 75 L 95 145 L 65 140 Z"
          fill="#faf8f6"
          stroke="#d4c4a8"
          strokeWidth="1"
        />
        
        {/* Open book - right page */}
        <Path
          d="M 140 70 Q 140 75 135 80 L 135 140 Q 140 145 140 150 L 140 70 Z"
          fill="#f5f5dc"
          stroke="#d4c4a8"
          strokeWidth="2"
        />
        <Path
          d="M 135 80 L 105 75 L 105 145 L 135 140 Z"
          fill="#faf8f6"
          stroke="#d4c4a8"
          strokeWidth="1"
        />
        
        {/* Book spine/center */}
        <Rect
          x="98"
          y="70"
          width="4"
          height="80"
          fill="#8b4513"
        />
        
        {/* Bookmark ribbon */}
        <Rect
          x="97"
          y="60"
          width="6"
          height="50"
          fill="#d2691e"
        />
        
        {/* Text lines on left page */}
        <Rect x="70" y="85" width="20" height="2" fill="#d4c4a8" opacity="0.6" />
        <Rect x="70" y="92" width="18" height="2" fill="#d4c4a8" opacity="0.6" />
        <Rect x="70" y="99" width="20" height="2" fill="#d4c4a8" opacity="0.6" />
        <Rect x="70" y="106" width="17" height="2" fill="#d4c4a8" opacity="0.6" />
        
        {/* Text lines on right page */}
        <Rect x="110" y="85" width="20" height="2" fill="#d4c4a8" opacity="0.6" />
        <Rect x="110" y="92" width="18" height="2" fill="#d4c4a8" opacity="0.6" />
        <Rect x="110" y="99" width="20" height="2" fill="#d4c4a8" opacity="0.6" />
        <Rect x="110" y="106" width="17" height="2" fill="#d4c4a8" opacity="0.6" />
        
        {/* Glasses */}
        {/* Left lens */}
        <G>
          <Path
            d="M 65 110 A 10 10 0 1 1 65 109.9"
            fill="none"
            stroke="#5d4e37"
            strokeWidth="3"
          />
          {/* Right lens */}
          <Path
            d="M 135 110 A 10 10 0 1 1 135 109.9"
            fill="none"
            stroke="#5d4e37"
            strokeWidth="3"
          />
          {/* Bridge */}
          <Path
            d="M 75 110 L 125 110"
            stroke="#5d4e37"
            strokeWidth="2"
          />
          {/* Left temple */}
          <Path
            d="M 55 110 L 45 108"
            stroke="#5d4e37"
            strokeWidth="2"
          />
          {/* Right temple */}
          <Path
            d="M 145 110 L 155 108"
            stroke="#5d4e37"
            strokeWidth="2"
          />
        </G>
        
        {/* Quill pen */}
        <G transform="translate(145, 155) rotate(-25)">
          {/* Quill feather */}
          <Path
            d="M 0 0 Q 2 -15 0 -25 Q -2 -15 0 0"
            fill="#f5f5dc"
            stroke="#d4c4a8"
            strokeWidth="1"
          />
          {/* Quill tip */}
          <Path
            d="M 0 0 L -1 5 L 1 5 Z"
            fill="#5d4e37"
          />
        </G>
        
        {/* Decorative scroll icon */}
        <G transform="translate(148, 172)">
          <Path
            d="M 0 0 Q -3 -2 -3 -5 Q -3 -8 0 -10"
            fill="none"
            stroke="#d4c4a8"
            strokeWidth="1.5"
          />
          <Path
            d="M 0 0 Q 3 -2 3 -5 Q 3 -8 0 -10"
            fill="none"
            stroke="#d4c4a8"
            strokeWidth="1.5"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
});