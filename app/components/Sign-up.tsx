// "use client";

// import { signIn, signUp } from "@/lib/auth-client";

// export function GoogleSignUp() {
// 	return (
// 		<button
// 			className="bg-blue-500 text-white px-4 py-2 rounded-md"
// 			onClick={async () => {
// 				await signIn.social({
// 					provider: "google",
// 					callbackURL: "/",
// 				});
// 			}}
// 		>
// 			Sign up with Google
// 		</button>
// 	);
// }

// export function GithubSignUp() {
// 	return (
// 		<button
// 			className="bg-blue-500 text-white px-4 py-2 rounded-md"
// 			onClick={async () => {
// 				await signIn.social({
// 					provider: "github",
// 					callbackURL: "/",
// 				});
// 			}}
// 		>
// 			Sign up with Github
// 		</button>
// 	);
// }

// export function EmailSignUp(email: string, name: string, password: string) {
// 	return (
// 		<button
// 			className="bg-blue-500 text-white px-4 py-2 rounded-md"
// 			onClick={async () => {
// 				await signUp.email({
// 					email: email,
// 					name: name,
// 					password: password,
// 				});
// 			}}
// 		>
// 			Sign up with Email
// 		</button>
// 	);
// }

// export function SignIn(email: string, password: string) {
// 	return (
// 		<button className="bg-blue-500 text-white px-4 py-2 rounded-md"
// 			onClick={async () => {
// 				await signIn.email({
// 					email: email,
// 					password: password,
// 				});
// 			}}
// 		>Sign in</button>
// 	);
// }
