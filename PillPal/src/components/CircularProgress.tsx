import React from 'react';
import Svg, { Circle, Text } from 'react-native-svg';
import { View } from 'react-native';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  textColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 200,
  strokeWidth = 20,
  backgroundColor = '#e6e6e6',
  progressColor = '#4CAF50',
  textColor = '#333',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke={progressColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
        />
        <Text
          x={size / 2}
          y={size / 2}
          fontSize="24"
          fill={textColor}
          textAnchor="middle"
          dy=".3em"
        >
          {`${Math.round(progress)}%`}
        </Text>
      </Svg>
    </View>
  );
};

export default CircularProgress; 