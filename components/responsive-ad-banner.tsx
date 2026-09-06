"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { AdBannerSquare } from "./ad-banner-square";
import AdBannerHorizontal from "./ad-banner-horizontal";

interface ResponsiveAdBannerProps {
	className?: string;
}

export default function ResponsiveAdBanner({ className = "" }: ResponsiveAdBannerProps) {
	const isMobile = useIsMobile();

	return (
		<div className={`w-full flex justify-center mb-6 mt-9 ${className}`}>
			{!isMobile ? (
				<div className="w-full max-w-[728px] px-2">
					<AdBannerHorizontal centered />
				</div>
			) : (
				<div className="w-full max-w-[300px] px-2">
					<AdBannerSquare />
				</div>
			)}
		</div>
	);
}
