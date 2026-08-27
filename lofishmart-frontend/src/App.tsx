import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { PaymentProvider } from './context/PaymentContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	context: {
		auth: undefined!, // This will be provided by inner component
	},
});

// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
	return (
		<AuthProvider>
			<PaymentProvider>
				<InnerApp />
			</PaymentProvider>
		</AuthProvider>
	);
}

export default App;
