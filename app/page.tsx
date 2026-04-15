"use client";

import { useMemo, useState } from "react";
import { golfCourses } from "@/data/golfCourses";

type WeatherData = {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
  };
  airQuality: {
    aqi: number | null;
    pm25: number | null;
    pm10: number | null;
  };
  forecast: Array<{
    date: string;
    min: number;
    max: number;
    description: string;
  }>;
};

const aqiLabels: Record<number, string> = {
  1: "좋음",
  2: "보통",
  3: "주의",
  4: "나쁨",
  5: "매우 나쁨"
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export default function Home() {
  const [selectedId, setSelectedId] = useState(golfCourses[0].id);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCourse = useMemo(
    () => golfCourses.find((course) => course.id === selectedId) ?? golfCourses[0],
    [selectedId]
  );

  async function loadWeather() {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        lat: String(selectedCourse.latitude),
        lon: String(selectedCourse.longitude)
      });
      const response = await fetch(`/api/weather?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "날씨 정보를 불러오지 못했습니다.");
      }

      setWeather(data);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "날씨 정보를 불러오지 못했습니다.";
      setWeather(null);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="header">
        <div className="header-inner">
          <p className="eyebrow">골프 날씨 도우미</p>
          <h1>서울 근교 라운딩 날씨를 확인하세요.</h1>
          <p className="intro">
            골프장을 선택하면 현재 날씨, 대기질, 5일 예보를 한눈에 볼 수 있습니다.
            티타임을 예약하기 전에 간단히 확인해 보세요.
          </p>
        </div>
      </section>

      <section className="main">
        <div className="selector-row">
          <div>
            <label htmlFor="course">골프장</label>
            <select
              id="course"
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setWeather(null);
                setError("");
              }}
            >
              {golfCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.region}
                </option>
              ))}
            </select>
          </div>
          <button className="button" disabled={isLoading} onClick={loadWeather}>
            {isLoading ? "불러오는 중..." : "날씨 확인"}
          </button>
        </div>

        {!weather && !error ? (
          <p className="status">골프장을 선택한 뒤 최신 날씨를 불러오세요.</p>
        ) : null}

        {error ? <div className="error">{error}</div> : null}

        {weather ? (
          <>
            <section className="summary">
              <h2>{selectedCourse.name}</h2>
              <p>{selectedCourse.region}</p>
            </section>

            <section className="grid">
              <article className="card">
                <h3>현재 날씨</h3>
                <div className="big-number">{weather.current.temperature}°C</div>
                <dl className="details">
                  <div>
                    <dt>상태</dt>
                    <dd>{weather.current.description}</dd>
                  </div>
                  <div>
                    <dt>체감 온도</dt>
                    <dd>{weather.current.feelsLike}°C</dd>
                  </div>
                  <div>
                    <dt>습도</dt>
                    <dd>{weather.current.humidity}%</dd>
                  </div>
                  <div>
                    <dt>바람</dt>
                    <dd>{weather.current.windSpeed} m/s</dd>
                  </div>
                </dl>
              </article>

              <article className="card">
                <h3>대기질</h3>
                <div className="big-number">
                  {weather.airQuality.aqi
                    ? `${weather.airQuality.aqi} - ${aqiLabels[weather.airQuality.aqi]}`
                    : "정보 없음"}
                </div>
                <dl className="details">
                  <div>
                    <dt>PM2.5</dt>
                    <dd>
                      {weather.airQuality.pm25 === null
                        ? "정보 없음"
                        : `${weather.airQuality.pm25} ㎍/㎥`}
                    </dd>
                  </div>
                  <div>
                    <dt>PM10</dt>
                    <dd>
                      {weather.airQuality.pm10 === null
                        ? "정보 없음"
                        : `${weather.airQuality.pm10} ㎍/㎥`}
                    </dd>
                  </div>
                </dl>
              </article>
            </section>

            <section className="forecast">
              <h3>5일 예보</h3>
              <div className="forecast-list">
                {weather.forecast.map((day) => (
                  <div className="forecast-item" key={day.date}>
                    <div>
                      <strong>{formatDate(day.date)}</strong>
                      <div className="forecast-date">{day.date}</div>
                    </div>
                    <div className="forecast-text">
                      <span className="forecast-temp">
                        {day.min}°C / {day.max}°C
                      </span>{" "}
                      {day.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
