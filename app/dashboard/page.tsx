"use client";

import { useSession } from '@/lib/auth/auth-client';
import PractitionerDashboard from '@/components/practitioner/PractitionerDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ClientDashboard from '@/components/client/ClientDashboard';
import { redirect } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';

export default function Dashboard() {
	const { data: session, isPending: isSessionLoading } = useSession();
	const { role, isLoading: isRoleLoading } = useUserRole();

	// Show loading state while session or role is loading
	if (isSessionLoading || isRoleLoading) {
		return <div className="flex h-screen items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
		</div>;
	}

	// Redirect to sign in if no session
	if (!session) {
		redirect('/auth/signin');
		return null;
	}

	// Use the fetched role or default to 'client'
	const userRole = role || 'client';

	switch (userRole) {
		case 'admin':
			return <AdminDashboard user={session.user} />;
		case 'practitioner':
			return <PractitionerDashboard user={session.user} />;
		case 'client':
			return <ClientDashboard user={session.user} />;
		default:
			return <p className="p-6 text-center">Unauthorized access</p>;
	}
}
