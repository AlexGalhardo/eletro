import { type ReactNode, useEffect, useState } from "react";
import { Switch } from "#lib/admin-ui/ui/switch.tsx";
import { BROWSER_FLAGS, type BrowserFlag, browserFlag, setBrowserFlag } from "#lib/flags.ts";

const names = Object.keys(BROWSER_FLAGS) as BrowserFlag[];

/** Per-browser flags (localStorage). The saved value is read after hydration so the server HTML stays neutral. */
export function FlagToggles(): ReactNode {
	const [values, setValues] = useState<Partial<Record<BrowserFlag, boolean>>>({});
	useEffect(() => setValues(Object.fromEntries(names.map((name) => [name, browserFlag(name)]))), []);
	return (
		<>
			{names.map((name) => (
				<div key={name} className="mt-3 flex items-center gap-3 text-sm">
					<Switch
						id={`flag-${name}`}
						checked={values[name] ?? false}
						onCheckedChange={(checked) => {
							setBrowserFlag(name, checked);
							setValues((current) => ({ ...current, [name]: checked }));
						}}
					/>
					<label htmlFor={`flag-${name}`}>{BROWSER_FLAGS[name]}</label>
				</div>
			))}
		</>
	);
}
