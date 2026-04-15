import { NextResponse } from "next/server";

const WEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";
const AIR_API_BASE = "https://api.openweathermap.org/data/2.5";

type OpenWeatherCurrent = {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    description: string;
  }>;
};

type OpenWeatherAir = {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      pm2_5: number;
      pm10: number;
    };
  }>;
};

type OpenWeatherForecast = {
  list: Array<{
    dt_txt: string;
    main: {
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      description: string;
    }>;
  }>;
};

function getDailyForecast(items: OpenWeatherForecast["list"]) {
  const days = new Map<
    string,
    {
      date: string;
      min: number;
      max: number;
      description: string;
    }
  >();

  for (const item of items) {
    const date = item.dt_txt.split(" ")[0];
    const current = days.get(date);

    if (!current) {
      days.set(date, {
        date,
        min: item.main.temp_min,
        max: item.main.temp_max,
        description: item.weather[0]?.description ?? "설명 없음"
      });
      continue;
    }

    current.min = Math.min(current.min, item.main.temp_min);
    current.max = Math.max(current.max, item.main.temp_max);

    if (item.dt_txt.includes("12:00:00")) {
      current.description = item.weather[0]?.description ?? current.description;
    }
  }

  return Array.from(days.values()).slice(0, 5).map((day) => ({
    ...day,
    min: Math.round(day.min),
    max: Math.round(day.max)
  }));
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    next: {
      revalidate: 600
    }
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    const openWeatherMessage = errorBody?.message
      ? ` OpenWeather 메시지: ${errorBody.message}`
      : "";

    if (response.status === 401) {
      throw new Error(
        `OpenWeather 인증에 실패했습니다.${openWeatherMessage} API 키가 정확한지 확인해 주세요.`
      );
    }

    throw new Error(
      `OpenWeather 요청에 실패했습니다. 상태 코드: ${response.status}.${openWeatherMessage}`
    );
  }

  return response.json() as Promise<T>;
}

function buildOpenWeatherUrl(baseUrl: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `${baseUrl}?${searchParams.toString()}`;
}

function requiredParam(url: URL, name: string) {
  const value = url.searchParams.get(name);

  if (!value) {
    throw new Error(`${name} 값이 없습니다.`);
  }

  return value;
}

export async function GET(request: Request) {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "환경 변수 OPENWEATHER_API_KEY가 없습니다." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(request.url);
    const lat = requiredParam(url, "lat");
    const lon = requiredParam(url, "lon");

    const [current, forecast, airResult] = await Promise.all([
      fetchJson<OpenWeatherCurrent>(
        buildOpenWeatherUrl(`${WEATHER_API_BASE}/weather`, {
          lat,
          lon,
          appid: apiKey,
          units: "metric",
          lang: "kr"
        })
      ),
      fetchJson<OpenWeatherForecast>(
        buildOpenWeatherUrl(`${WEATHER_API_BASE}/forecast`, {
          lat,
          lon,
          appid: apiKey,
          units: "metric",
          lang: "kr"
        })
      ),
      fetchJson<OpenWeatherAir>(
        buildOpenWeatherUrl(`${AIR_API_BASE}/air_pollution`, {
          lat,
          lon,
          appid: apiKey
        })
      ).catch(() => null)
    ]);

    const airQuality = airResult?.list[0];

    return NextResponse.json({
      current: {
        temperature: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        windSpeed: current.wind.speed,
        description: current.weather[0]?.description ?? "설명 없음"
      },
      airQuality: {
        aqi: airQuality?.main.aqi ?? null,
        pm25: airQuality?.components.pm2_5 ?? null,
        pm10: airQuality?.components.pm10 ?? null
      },
      forecast: getDailyForecast(forecast.list)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
