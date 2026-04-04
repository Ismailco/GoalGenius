'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckIn } from '@/app/types';
import { getCheckIns, deleteCheckIn } from '@/lib/storage';
import CreateCheckInModal from '@/components/app/checkins/CreateCheckInModal';
import { format, eachDayOfInterval, isSameDay, isToday, subWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns';
import AlertModal from '@/components/common/AlertModal';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

function parseJsonArray(value: string[] | string | undefined | null): string[] {
	if (!value) return [];

	// If it's already an array, return it
	if (Array.isArray(value)) return value;

	// If it's a string, try to parse it
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		console.error('Error parsing JSON array:', e);
		return [];
	}
}

export default function CheckInsPage() {
	const [mounted, setMounted] = useState(false);
	const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | undefined>();
	const [selectedDate, setSelectedDate] = useState<string | undefined>();
	const [alert, setAlert] = useState<{
		show: boolean;
		title: string;
		message: string;
		type: 'info' | 'success' | 'warning' | 'error';
		isConfirmation?: boolean;
		onConfirm?: () => void;
	}>({
		show: false,
		title: '',
		message: '',
		type: 'info',
	});
	const [yearStartDate] = useState(() => {
		const today = new Date();
		return startOfWeek(subWeeks(today, 51));
	});
	const calendarRef = useRef<HTMLDivElement>(null);

	// const accomplishments = useMemo(() => parseJsonArray(selectedCheckIn?.accomplishments), [selectedCheckIn?.accomplishments]);
	// const challenges = useMemo(() => parseJsonArray(selectedCheckIn?.challenges), [selectedCheckIn?.challenges]);
	// const goals = useMemo(() => parseJsonArray(selectedCheckIn?.goals), [selectedCheckIn?.goals]);

	useEffect(() => {
		const loadCheckIns = async () => {
			try {
				setMounted(true);
				const loadedCheckIns = await getCheckIns();
				setCheckIns(loadedCheckIns);
			} catch (error) {
				console.error('Error loading check-ins:', error);
				setAlert({
					show: true,
					title: 'Error',
					message: 'Failed to load check-ins',
					type: 'error',
				});
			}
		};

		loadCheckIns();
	}, []);

	useEffect(() => {
		if (mounted && calendarRef.current) {
			calendarRef.current.scrollLeft = calendarRef.current.scrollWidth;
		}
	}, [mounted]);

	// Don't render anything until mounted to prevent hydration errors
	if (!mounted) {
		return (
			<AppPage>
				<div className="page-skeleton animate-pulse p-6">
					<div className="h-3 w-24 rounded-full bg-white/10" />
					<div className="mt-4 h-10 w-2/5 rounded-2xl bg-white/10" />
					<div className="mt-3 h-4 w-1/3 rounded-full bg-white/5" />
				</div>
			</AppPage>
		);
	}

	const handleSaveCheckIn = async () => {
		try {
			const updatedCheckIns = await getCheckIns();
			setCheckIns(updatedCheckIns);
		} catch (error) {
			console.error('Error refreshing check-ins:', error);
			setAlert({
				show: true,
				title: 'Error',
				message: 'Failed to refresh check-ins',
				type: 'error',
			});
		}
	};

	const handleEditCheckIn = (checkIn: CheckIn) => {
		setSelectedCheckIn(checkIn);
		setIsModalOpen(true);
	};

	const handleDeleteCheckIn = (id: string) => {
		setAlert({
			show: true,
			title: 'Confirm Deletion',
			message: 'Are you sure you want to delete this check-in?',
			type: 'warning',
			isConfirmation: true,
			onConfirm: async () => {
				try {
					await deleteCheckIn(id);
					const updatedCheckIns = await getCheckIns();
					setCheckIns(updatedCheckIns);
				} catch (error) {
					console.error('Error deleting check-in:', error);
					setAlert({
						show: true,
						title: 'Error',
						message: 'Failed to delete check-in',
						type: 'error',
					});
				}
			},
		});
	};

	const getMoodEmoji = (mood: string) => {
		switch (mood) {
			case 'great':
				return '😄';
			case 'good':
				return '🙂';
			case 'okay':
				return '😐';
			case 'bad':
				return '😕';
			case 'terrible':
				return '😢';
			default:
				return '🙂';
		}
	};

	const getEnergyIcon = (energy: string) => {
		switch (energy) {
			case 'high':
				return '⚡️';
			case 'medium':
				return '✨';
			case 'low':
				return '🔋';
			default:
				return '✨';
		}
	};

	const getCheckInForDate = (date: Date) => {
		return checkIns.find((checkIn) => isSameDay(new Date(checkIn.date), date));
	};

	return (
		<AppPage>
			<AppPageHeader
				eyebrow="Check-ins"
				title="Review the days behind you"
				description="Track consistency, mood, and energy without turning reflection into noise."
				action={
					<button
						onClick={() => {
							setSelectedCheckIn(undefined);
							setSelectedDate(undefined);
							setIsModalOpen(true);
						}}
						className="app-button"
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						New Check-in
					</button>
				}
			/>

			<div className="surface-panel p-6">
					<div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
						<div className="flex flex-col items-center md:items-start">
							<h2 className="text-xl font-semibold text-white">Progress & Growth Timeline</h2>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">Track your daily journey and personal development</p>
						</div>
						<div className="mt-4 flex justify-end md:self-end">
							<p className="text-xs text-[var(--text-muted)]">
								{format(yearStartDate, 'MMM d, yyyy')} — {format(new Date(), 'MMM d, yyyy')}
							</p>
						</div>
					</div>

					<div className="flex mt-6">
						{/* Days of week labels */}
						<div className="flex flex-col pr-4">
							{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
								<div key={day} className="h-7 flex items-center">
									<span className="w-10 text-xs font-medium text-[var(--text-muted)]">{day}</span>
								</div>
							))}
						</div>

						{/* Scrollable calendar area */}
						<div ref={calendarRef} className="overflow-x-auto flex-grow scrollbar-hide max-w-[calc(100vw-140px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
							<div className="flex min-w-max pb-2">
								{/* Calendar grid */}
								<div className="flex">
									{Array.from({ length: 52 }, (_, weekIndex) => {
										const weekStart = addDays(yearStartDate, weekIndex * 7);
										const weekDays = eachDayOfInterval({
											start: weekStart,
											end: endOfWeek(weekStart),
										});

										return (
											<div key={weekIndex} className="flex flex-col">
												{weekDays.map((date) => {
													const checkIn = getCheckInForDate(date);
													const isCurrentDay = isToday(date);

													// Get mood-based color
													let moodColor = 'bg-white/5';
													if (checkIn) {
														switch (checkIn.mood) {
															case 'terrible':
																moodColor = 'bg-red-500/30 hover:bg-red-500/40';
																break;
															case 'bad':
																moodColor = 'bg-orange-500/30 hover:bg-orange-500/40';
																break;
															case 'okay':
																moodColor = 'bg-yellow-500/30 hover:bg-yellow-500/40';
																break;
															case 'good':
																moodColor = 'bg-lime-500/30 hover:bg-lime-500/40';
																break;
															case 'great':
																moodColor = 'bg-green-500/30 hover:bg-green-500/40';
																break;
														}
													}

													return (
														<button
															key={date.toISOString()}
															onClick={() => {
																if (checkIn) {
																	setSelectedCheckIn(checkIn);
																	setSelectedDate(undefined);
																} else {
																	setSelectedCheckIn(undefined);
																	setSelectedDate(format(date, 'yyyy-MM-dd'));
																}
																setIsModalOpen(true);
															}}
															className={`group relative flex h-7 w-7 flex-col items-center justify-center transition-all ${isCurrentDay ? 'bg-[rgba(93,166,255,0.18)] ring-1 ring-[rgba(93,166,255,0.38)]' : `${moodColor} ring-1 ${checkIn ? 'ring-white/20' : 'ring-white/10'} hover:ring-white/30`}`}
														>
															<div className="text-[10px] font-medium text-[var(--text-secondary)]">{format(date, 'd')}</div>
															{checkIn && (
																<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
																	<span className="text-[10px]" title={`${checkIn.mood} / ${checkIn.energy}`}>
																		{getMoodEmoji(checkIn.mood)}
																	</span>
																</div>
															)}
														</button>
													);
												})}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
			</div>

			<div className="space-y-3">
					{checkIns
						.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
						.map((checkIn) => {
							const checkInAccomplishments = parseJsonArray(checkIn.accomplishments);
							const checkInChallenges = parseJsonArray(checkIn.challenges);
							const checkInGoals = parseJsonArray(checkIn.goals);

							return (
								<details key={checkIn.id} className="group surface-card rounded-[20px]">
									<summary className="flex items-center justify-between p-4 cursor-pointer list-none">
										<div className="flex items-center gap-3">
											<span className="text-2xl" title={`Mood: ${checkIn.mood}`}>
												{getMoodEmoji(checkIn.mood)}
											</span>
											<span className="text-2xl" title={`Energy: ${checkIn.energy}`}>
												{getEnergyIcon(checkIn.energy)}
											</span>
											<span className="text-lg font-medium text-white">{format(new Date(checkIn.date), 'MMMM d, yyyy')}</span>
										</div>
										<div className="flex items-center gap-4">
											<button
												onClick={(e) => {
													e.preventDefault();
													handleEditCheckIn(checkIn);
												}}
												className="text-sm text-[var(--accent)] transition-colors hover:text-white"
											>
												Edit
											</button>
											<button
												onClick={(e) => {
													e.preventDefault();
													handleDeleteCheckIn(checkIn.id);
												}}
												className="text-sm text-[rgb(255,220,226)] transition-colors hover:text-white"
											>
												Delete
											</button>
											<svg className="w-5 h-5 transform text-[var(--text-secondary)] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</summary>
									<div className="border-t border-white/10 px-4 pb-4 pt-2">
										<div className="space-y-4">
											{checkInAccomplishments.length > 0 && (
												<div className="space-y-2">
													<h3 className="text-sm font-medium text-[var(--text-secondary)]">Accomplishments</h3>
													<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
														{checkInAccomplishments.map((item: string, index: number) => (
															<li key={index} className="flex items-start gap-2 text-[var(--text-secondary)]">
																<span className="text-green-400 mt-1">✓</span>
																{item}
															</li>
														))}
													</ul>
												</div>
											)}

											{checkInChallenges.length > 0 && (
												<div className="space-y-2">
													<h3 className="text-sm font-medium text-[var(--text-secondary)]">Challenges</h3>
													<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
														{checkInChallenges.map((item: string, index: number) => (
															<li key={index} className="flex items-start gap-2 text-[var(--text-secondary)]">
																<span className="text-yellow-400 mt-1">!</span>
																{item}
															</li>
														))}
													</ul>
												</div>
											)}

											{checkInGoals.length > 0 && (
												<div className="space-y-2">
													<h3 className="text-sm font-medium text-[var(--text-secondary)]">Goals for Tomorrow</h3>
													<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
														{checkInGoals.map((item: string, index: number) => (
															<li key={index} className="flex items-start gap-2 text-[var(--text-secondary)]">
																<span className="text-blue-400 mt-1">○</span>
																{item}
															</li>
														))}
													</ul>
												</div>
											)}

											{checkIn.notes && (
												<div className="space-y-2">
													<h3 className="text-sm font-medium text-[var(--text-secondary)]">Additional Notes</h3>
													<p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-[var(--text-secondary)]">{checkIn.notes}</p>
												</div>
											)}
										</div>
									</div>
								</details>
							);
						})}

					{checkIns.length === 0 && (
						<div className="surface-empty rounded-[20px] p-12 text-center">
							<p className="text-lg">No check-ins yet. Start tracking your daily progress!</p>
						</div>
					)}
			</div>

				<CreateCheckInModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedCheckIn(undefined);
						setSelectedDate(undefined);
					}}
					existingCheckIn={selectedCheckIn}
					defaultDate={selectedDate}
					onSave={handleSaveCheckIn}
				/>

				{alert.show && <AlertModal title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} isConfirmation={alert.isConfirmation} onConfirm={alert.onConfirm} />}
		</AppPage>
	);
}
