'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

export default function NewAirplanePage() {
	return (
		<div className="min-h-screen bg-aero-900 flex flex-col">
			<nav className="flex items-center gap-4 px-4 py-3 bg-aero-900/80 backdrop-blur border-b border-aero-700">
				<Link
					href="/"
					className={clsx(
						'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-mono',
						'text-slate-400 hover:text-white hover:bg-white/5 transition-colors'
					)}
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</Link>
			</nav>

			<div className="flex-1 flex items-center justify-center">
				<span className="text-white font-mono text-lg">New Airplane</span>
			</div>
		</div>
	);
}
