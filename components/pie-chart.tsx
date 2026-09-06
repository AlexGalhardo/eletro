"use client";

import { useState } from "react";

type PieChartProps = {
	data: {
		id: string;
		name: string;
		value: number;
		color: string;
		percentage?: string;
	}[];
	size?: number;
	className?: string;
};

export function PieChart({ data, size = 200, className = "" }: PieChartProps) {
	const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
	const total = data.reduce((sum, item) => sum + item.value, 0);

	if (data.length === 0 || total === 0) {
		return (
			<div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
				<p className="text-sm text-slate-500">No data found</p>
			</div>
		);
	}

	let currentAngle = 0;

	return (
		<div className={`relative ${className}`} style={{ width: size, height: size }}>
			<svg viewBox="0 0 100 100" className="w-full h-full">
				{data.map((item) => {
					const percentage = (item.value / total) * 100;
					const startAngle = currentAngle;
					const endAngle = startAngle + (percentage / 100) * 360;

					const colorClass = item.color.replace("bg-", "");
					let fillColor = "";

					switch (colorClass) {
						case "red-500":
							fillColor = "#ef4444";
							break;
						case "blue-500":
							fillColor = "#3b82f6";
							break;
						case "green-500":
							fillColor = "#22c55e";
							break;
						case "purple-500":
							fillColor = "#a855f7";
							break;
						case "yellow-500":
							fillColor = "#eab308";
							break;
						case "indigo-500":
							fillColor = "#6366f1";
							break;
						case "orange-500":
							fillColor = "#f97316";
							break;
						case "teal-500":
							fillColor = "#14b8a6";
							break;
						case "pink-500":
							fillColor = "#ec4899";
							break;
						case "amber-500":
							fillColor = "#f59e0b";
							break;
						case "rose-500":
							fillColor = "#f43f5e";
							break;
						case "cyan-500":
							fillColor = "#06b6d4";
							break;
						case "lime-500":
							fillColor = "#84cc16";
							break;
						case "emerald-500":
							fillColor = "#10b981";
							break;
						case "sky-500":
							fillColor = "#0ea5e9";
							break;
						case "fuchsia-500":
							fillColor = "#d946ef";
							break;
						default:
							fillColor = "#9ca3af";
					}

					currentAngle = endAngle;

					// Caso especial: 100%
					if (percentage === 100) {
						return (
							<circle
								key={item.id}
								cx="50"
								cy="50"
								r="50"
								fill={fillColor}
								className="hover:opacity-80 transition-opacity cursor-pointer"
								onMouseEnter={() => setHoveredSegment(item.id)}
								onMouseLeave={() => setHoveredSegment(null)}
							/>
						);
					}

					const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
					const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
					const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
					const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
					const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

					return (
						<path
							key={item.id}
							d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
							fill={fillColor}
							className="hover:opacity-80 transition-opacity cursor-pointer"
							onMouseEnter={() => setHoveredSegment(item.id)}
							onMouseLeave={() => setHoveredSegment(null)}
						/>
					);
				})}
			</svg>

			{hoveredSegment && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="bg-background dark:bg-slate-800 px-3 py-1.5 rounded-md shadow-md text-sm font-medium">
						{data.find((item) => item.id === hoveredSegment)?.name}{" "}
						{data.find((item) => item.id === hoveredSegment)?.percentage}%
					</div>
				</div>
			)}
		</div>
	);
}
