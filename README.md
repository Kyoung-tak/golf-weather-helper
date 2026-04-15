# 골프 날씨 도우미

서울과 경기 근교 골프장의 날씨와 대기질을 확인하는 간단한 Next.js 앱입니다.

## 주요 기능

- 골프장 드롭다운 선택
- 현재 날씨 확인
- 대기질 확인: AQI, PM2.5, PM10
- 5일 날씨 예보 확인
- 골프장 데이터는 로컬 파일에서 관리
- OpenWeather 요청은 서버 API 라우트에서 처리

## OpenWeather API 키 설정

1. OpenWeather 사이트에서 계정을 만들고 API 키를 발급받습니다.

2. 프로젝트 루트에 `.env.local` 파일을 만듭니다.

프로젝트 루트는 `package.json` 파일이 있는 폴더입니다.

3. `.env.local` 파일에 아래처럼 입력합니다.

```bash
OPENWEATHER_API_KEY=여기에_내_API_키를_넣기
```

예를 들어 API 키가 `abc123`이라면 이렇게 씁니다.

```bash
OPENWEATHER_API_KEY=abc123
```

따옴표는 넣지 않아도 됩니다. `=` 앞뒤에 공백도 넣지 않는 것이 좋습니다.

4. 개발 서버를 다시 시작합니다.

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열면 됩니다.

## 사용 중인 무료 OpenWeather API

이 프로젝트는 서버 API 라우트인 `app/api/weather/route.ts`에서 OpenWeather를 호출합니다.

- 현재 날씨: Current Weather API
- 5일 예보: 5 Day / 3 Hour Forecast API
- 대기질, PM2.5, PM10: Air Pollution API

One Call API 3.0은 사용하지 않습니다.

브라우저에서 API 키를 직접 쓰지 않고 서버 라우트에서만 사용하므로 더 안전합니다.

## 중요한 파일

- `data/golfCourses.ts`: 골프장 이름, 지역, 위도, 경도 데이터
- `app/api/weather/route.ts`: OpenWeather를 호출하는 서버 API 라우트
- `app/page.tsx`: 화면 UI
- `.env.example`: 환경 변수 작성 예시
- `.env.local`: 실제 API 키를 넣는 로컬 전용 파일

## 실행 전 확인

```bash
npm install
npm run lint
npm run build
```
