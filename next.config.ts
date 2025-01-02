import { NextConfig } from "next";
import withPWA from "next-pwa"; // next-pwa import

const nextConfig: NextConfig = {
  /* 다른 Next.js 옵션 추가 가능 */
};

export default withPWA({
  ...nextConfig, // 기존 설정 확장
    dest: "public", // PWA 파일의 출력 경로
    register: true, // 서비스 워커 자동 등록
    skipWaiting: true, // 이전 서비스 워커를 건너뛰고 새로운 서비스 워커를 활성화
});
