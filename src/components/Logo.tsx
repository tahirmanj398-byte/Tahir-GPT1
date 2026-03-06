import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-[spin_30s_linear_infinite]"
      >
        <path
          d="M50 50L50 10M50 50L85 30M50 50L85 70M50 50L50 90M50 50L15 70M50 50L15 30"
          className="stroke-current"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M50 10C65 10 85 25 85 30C85 35 65 50 50 50C35 50 15 35 15 30C15 25 35 10 50 10Z"
          className="stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M85 30C85 45 70 65 65 70C60 75 50 65 50 50C50 35 60 25 65 20C70 15 85 15 85 30Z"
          className="stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M85 70C70 70 50 85 50 90C50 95 35 85 30 70C25 55 35 45 50 50C65 55 85 55 85 70Z"
          className="stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M50 90C35 90 15 75 15 70C15 65 35 50 50 50C65 50 85 65 85 70C85 75 65 90 50 90Z"
          className="stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M15 70C15 55 30 35 35 30C40 25 50 35 50 50C50 65 40 75 35 80C30 85 15 85 15 70Z"
          className="stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M15 30C30 30 50 15 50 10C50 5 65 15 70 30C75 45 65 55 50 50C35 45 15 45 15 30Z"
          className="stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
