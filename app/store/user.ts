import { Amplify } from "aws-amplify";
import {
    autoSignIn,
    confirmSignUp,
    fetchAuthSession,
    resendSignUpCode,
    signIn,
    signOut,
    signUp,
} from "@aws-amplify/auth";
import { create } from "zustand";
import { DiagramsAuthStack } from "../../outputs.json";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: DiagramsAuthStack.DiagramsUserPoolId,
            userPoolClientId: DiagramsAuthStack.DiagramsUserPoolClientId,
            identityPoolId: DiagramsAuthStack.DiagramsIdentityPoolId,
            signUpVerificationMethod: "code",
        },
    },
});

export type AppTheme = "system" | "dark" | "light";
export type AuthType = "login" | "register" | "confirm_sign_up";

export interface UserState {
    theme: AppTheme;
    isThemeMenuOpen: boolean;
    isSettingsMenuOpen: boolean;
    isAuthModalOpen: boolean;
    authType: AuthType;
    authDetail: any;
    authData: any;
    jwtToken: string | "";
    setTheme: (theme: AppTheme) => void;
    toggleThemeMenu: () => void;
    openThemeMenu: () => void;
    closeThemeMenu: () => void;
    toggleSettingsMenu: () => void;
    openSettingsMenu: () => void;
    closeSettingsMenu: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    setAuthType: (authType: AuthType) => void;
    login: (userName: string, password: string) => Promise<void>;
    signup: (
        userName: string,
        password: string,
        fullName: string
    ) => Promise<void>;
    confirmSignUp: (code: string) => void;
    resendCode: () => void;
    setAuthData: () => void;
    logOut: () => void;
    emptyAuthData: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
    theme: "system",
    isThemeMenuOpen: false,
    isSettingsMenuOpen: false,
    isAuthModalOpen: false,
    authType: "login",
    authDetail: null,
    authData: null,
    jwtToken: "",
    setTheme(theme: AppTheme) {
        set({ theme });
    },
    toggleThemeMenu() {
        set({
            isThemeMenuOpen: !get().isThemeMenuOpen,
        });
    },
    openThemeMenu() {
        set({
            isThemeMenuOpen: true,
        });
    },
    closeThemeMenu() {
        set({
            isThemeMenuOpen: false,
        });
    },
    toggleSettingsMenu() {
        set({
            isSettingsMenuOpen: !get().isSettingsMenuOpen,
        });
    },
    openSettingsMenu() {
        set({
            isSettingsMenuOpen: true,
        });
    },
    closeSettingsMenu() {
        set({
            isSettingsMenuOpen: false,
        });
    },
    openAuthModal() {
        set({
            isAuthModalOpen: true,
        });
    },
    closeAuthModal() {
        set({
            isAuthModalOpen: false,
        });
    },
    setAuthType(authType: AuthType) {
        set({
            authType,
        });
    },
    async login(userName: string, password: string) {
        const user = await signIn({
            username: userName,
            password,
        });

        if (user.nextStep.signInStep === "DONE") {
            set({ isAuthModalOpen: false });
        }
    },
    async signup(userName: string, password: string, fullName: string) {
        const { nextStep: signUpNextStep } = await signUp({
            username: userName,
            password: password,
            options: {
                userAttributes: {
                    email: userName,
                    name: fullName,
                },
                autoSignIn: {
                    authFlowType: "USER_PASSWORD_AUTH",
                },
            },
        });

        if (signUpNextStep.signUpStep === "CONFIRM_SIGN_UP") {
            (signUpNextStep as any).email = userName;
            set({
                authDetail: signUpNextStep,
                authType: "confirm_sign_up",
            });
        }
    },
    async confirmSignUp(code: string) {
        const { authDetail } = get();
        const { nextStep } = await confirmSignUp({
            username: authDetail.email,
            confirmationCode: code,
        });

        if (nextStep.signUpStep === "DONE") {
            set({ isAuthModalOpen: false });
        } else if (nextStep.signUpStep === "COMPLETE_AUTO_SIGN_IN") {
            const { nextStep: autoNextStep } = await autoSignIn();

            if (autoNextStep.signInStep === "DONE") {
                set({ isAuthModalOpen: false });
            }
        }
    },
    async resendCode() {
        const { authDetail } = get();
        const output = await resendSignUpCode({
            username: authDetail.email,
        });
    },
    async logOut() {
        const { emptyAuthData } = get();

        await signOut();

        emptyAuthData();
    },
    async setAuthData() {
        const { authData, emptyAuthData } = get();
        // only retreive session if it's been more than half an hour since authentication
        if (
            authData &&
            Date.now() - (authData.auth_time * 1000) / 1000 / 60 > 30
        ) {
            return;
        }
        try {
            const session = await fetchAuthSession({ forceRefresh: true });
            set({
                authData: session.tokens?.idToken?.payload,
                jwtToken: session.tokens?.idToken?.toString(),
            });
        } catch (error) {
            console.error("Error fetching auth session:", error);
            emptyAuthData();
        }
    },
    async emptyAuthData() {
        // when logging out

        set({
            authData: null,
            jwtToken: "",
        });
    },
}));

export default useUserStore;
