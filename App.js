import * as Location from 'expo-location';
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';

import { Fontisto } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "8fcb2ae7c4c69ab4acbb63914d027c77";
const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snowflake",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};


export default function App() {
  const [city, setCity] = useState("Loading...");
  const [ok, setOk] = useState(true);
  const [days, setDays] = useState([]);

  const getWeather = async() => {
    // 1. 위치 permission 요청
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if(!granted) {
      setOk(false);
    }

    // 2. 현재 lat,long 구하기 -> reverse로 city name 구하기
    const {coords: { latitude, longitude }} = await Location.getCurrentPositionAsync({accuracy: 5});
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude }, 
      {useGoogleMaps: false}
    );
    setCity(location[0].city);

    // 3. api 호출
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`);
    const json = await response.json();
    setDays(json.daily); // 7일간의 기상정보
  };

  useEffect(() => {
    getWeather();
  }, [])

  return (
    <View style={sytles.container}>
      <View style={sytles.city}>
        <Text style={sytles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sytles.weather}
      >
        {days.length === 0 ? (
        <View style={{ ...sytles.day, alignItems: "center" }}>
          <ActivityIndicator 
          color="white" 
          size="large" 
          style={{ marginTop: 10}}/>
        </View>
        ) : (
          days.map((day, index) => 
          <View key={index} style={sytles.day}>
              <Text style={sytles.date}>{new Date(day.dt*1000).toString().substring(0,10)}</Text>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "flex-start", 
                justifyContent: "space-between",
                width: "100%",
              }}>
                <Text style={sytles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Fontisto name={icons[day.weather[0].main]} size={68} color="white" />
              </View>
              <Text style={sytles.description}>{day.weather[0].main}</Text>
              <Text style={sytles.tinyText}>{day.weather[0].description}</Text>
          </View>)
        )}
      </ScrollView>
      <StatusBar style="black" />
    </View>
  );
}

const sytles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffa801",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center"
  },
  cityName: {
    color: "#1e272e",
    fontSize: 58,
    fontWeight: "500",
    marginTop: 30,
  },
  weather: {

  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },

  date: {
    marginTop: 80,
    fontSize: 30,
    color: "#1e272e",
    fontWeight: "500",
  },
  temp: {
    fontWeight: "600",
    fontSize: 90,
    color: "#1e272e",
  },
  description: {
    marginTop: -10,
    fontSize: 30,
    color: "#1e272e",
    fontWeight: "500",
  },
  tinyText: {
    marginTop: -5,
    fontSize: 25,
    color: "#1e272e",
    fontWeight: "500",
  },

})

// react native의 모든 view : flex 기본 값 column
// 부모에 flex 1을 주면, 자식은 부모의 몇 배라는걸 알 수있음

// scroll view는 contentContainerStyle을 써야함
// scroll view에는 flex를 주면 안된다!