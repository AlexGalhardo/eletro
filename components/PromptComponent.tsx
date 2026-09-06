import React from "react";

interface PromptBoxProps {
	type: string;
	content: string;
	icon: string;
	iconColor: string;
	label: string;
}

interface PromptProps {
	badPrompt?: string;
	regularPrompt?: string;
	excellentPrompt?: string;
}

const PromptBox: React.FC<PromptBoxProps> = ({ type, content, icon, iconColor, label }) => {
	if (!content) return null;

	return (
		<div className="mb-6">
			<div className="flex items-center gap-2 mb-3">
				<span className={`text-2xl ${iconColor}`}>{icon}</span>
				<span className="font-bold text-lg text-black dark:text-white">{label}</span>
			</div>
			<div className="bg-black dark:bg-black text-white font-inter text-[21px] p-4 rounded-md overflow-x-auto whitespace-pre-wrap leading-relaxed">
				{content
					.trim()
					.split("\n")
					.map((line: string, i: number) => (
						<div key={i}>{line || <>&nbsp;</>}</div>
					))}
			</div>
		</div>
	);
};

export default function PromptComponent({ badPrompt, regularPrompt, excellentPrompt }: PromptProps) {
	return (
		<div className="my-8">
			{badPrompt && (
				<PromptBox type="bad" content={badPrompt} icon="❌" iconColor="text-red-500" label="Prompt Ruim:" />
			)}

			{regularPrompt && (
				<PromptBox
					type="regular"
					content={regularPrompt}
					icon="✅"
					iconColor="text-green-500"
					label="Prompt Bom:"
				/>
			)}

			{excellentPrompt && (
				<PromptBox
					type="excellent"
					content={excellentPrompt}
					icon="⭐"
					iconColor="text-yellow-500"
					label="Prompt Excelente:"
				/>
			)}
		</div>
	);
}
