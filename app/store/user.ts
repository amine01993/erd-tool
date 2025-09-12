import { Amplify, ResourcesConfig } from "aws-amplify";
import {
    autoSignIn,
    confirmSignUp,
    fetchAuthSession,
    resendSignUpCode,
    signIn,
    signOut,
    signUp,
    UpdateUserAttributesOutput,
} from "@aws-amplify/auth";
import { Sha256 } from "@aws-crypto/sha256-js";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { create } from "zustand";
import { UseMutationResult } from "@tanstack/react-query";
import { DiagramsAuthStack } from "../../outputs.json";
import useDiagramStore from "./diagram";
import { queryClient } from "../helper/variables";

const host = "9nnhrbiki6.execute-api.us-east-1.amazonaws.com";
const url = `https://${host}/prod/diagrams`;
const feedbackHost = "1qb3r4fde3.execute-api.us-east-1.amazonaws.com";
const feedbackUrl = `https://${feedbackHost}/prod/feedback`;

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: DiagramsAuthStack.DiagramsUserPoolId,
            userPoolClientId: DiagramsAuthStack.DiagramsUserPoolClientId,
            identityPoolId: DiagramsAuthStack.DiagramsIdentityPoolId,
            allowGuestAccess: true,
        },
    },
} as ResourcesConfig);

export type AppTheme = "system" | "dark" | "light";
export type AuthType = "login" | "register" | "confirm_sign_up";
type UpdateUserAttributeMutation = UseMutationResult<
    UpdateUserAttributesOutput,
    Error,
    {
        attribute: string;
        value: string;
    },
    unknown
>;

export interface UserState {
    offLine: boolean;
    fullscreenMode: boolean;
    fetchingSession: boolean;
    isThemeMenuOpen: boolean;
    isSettingsMenuOpen: boolean;
    isAuthModalOpen: boolean;
    isConfirmModalOpen: boolean;
    isReadOnlyModalOpen: boolean;
    isAiPromptOpen: boolean;
    isFeedbackModalOpen: boolean;
    isExportModalOpen: boolean;
    isLeftPanelOpen: boolean;
    isRightPanelOpen: boolean;
    isNavigationOpen: boolean;
    authType: AuthType;
    authDetail: any;
    isGuest: boolean;
    credentials: any;
    authData: any;
    jwtToken: string | "";
    setOffLine: (offline: boolean) => void;
    setFullscreenMode: (fullscreen: boolean) => void;
    setFetchingSession: (fetching: boolean) => void;
    handleCachedMutationsForUserAttributes(attribute: string): void;
    setTheme: (theme: AppTheme, mutation: UpdateUserAttributeMutation) => void;
    toggleThemeMenu: () => void;
    openThemeMenu: () => void;
    closeThemeMenu: () => void;
    toggleSettingsMenu: () => void;
    openSettingsMenu: () => void;
    closeSettingsMenu: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    openConfirmModal: () => void;
    closeConfirmModal: () => void;
    openReadOnlyModal: () => void;
    closeReadOnlyModal: () => void;
    openAiPrompt: () => void;
    closeAiPrompt: () => void;
    openFeedbackModal: () => void;
    closeFeedbackModal: () => void;
    openExportModal: () => void;
    closeExportModal: () => void;
    openLeftPanel: () => void;
    closeLeftPanel: () => void;
    openRightPanel: () => void;
    closeRightPanel: () => void;
    openNavigation: () => void;
    closeNavigation: () => void;
    toggleAiSuggestions: (mutation: UpdateUserAttributeMutation) => void;
    setAuthType: (authType: AuthType) => void;
    login: (userName: string, password: string) => Promise<void>;
    signup: (
        userName: string,
        password: string,
        fullName: string
    ) => Promise<void>;
    confirmSignUp: (code: string) => void;
    resendCode: () => void;
    getAuthData: () => { credentials: any; authData: any; jwtToken: string };
    retrieveAuthData: () => Promise<{
        credentials: any;
        authData: any;
        jwtToken: string;
    }>;
    logOut: () => void;
    emptyAuthData: () => void;
    apiCall: (props: ApiCallProps) => Promise<any>;
    feedbackApiCall: (props: ApiCallProps) => Promise<any>;
}

const useUserStore = create<UserState>((set, get) => ({
    offLine: false,
    fullscreenMode: false,
    fetchingSession: false,
    isThemeMenuOpen: false,
    isSettingsMenuOpen: false,
    isAuthModalOpen: false,
    isConfirmModalOpen: false,
    isReadOnlyModalOpen: false,
    isAiPromptOpen: false,
    isFeedbackModalOpen: false,
    isExportModalOpen: false,
    isLeftPanelOpen: false,
    isRightPanelOpen: false,
    isNavigationOpen: false,
    authType: "login",
    authDetail: null,
    isGuest: true,
    credentials: null,
    authData: null,
    jwtToken: "",
    setOffLine: (offline: boolean) => {
        set({ offLine: offline });
    },
    setFullscreenMode: (fullscreen: boolean) => {
        set({ fullscreenMode: fullscreen });
    },
    setFetchingSession(fetching: boolean) {
        set({ fetchingSession: fetching });
    },
    handleCachedMutationsForUserAttributes(attribute: string) {
        const mutationCache = queryClient.getMutationCache();
        const mutations = mutationCache.getAll();

        // Remove previous mutations for the same attribute
        mutations.forEach((m) => {
            const { mutationKey } = m.options;
            const data = m.state.variables as any;

            if (
                mutationKey?.[0] === "update-user-attribute" &&
                data.attribute === attribute
            ) {
                mutationCache.remove(m);
            }
        });
    },
    setTheme(theme: AppTheme, mutation: UpdateUserAttributeMutation) {
        const { isGuest, authData, handleCachedMutationsForUserAttributes } = get();
        let updatedAuthData = { ...authData, ["custom:theme"]: theme };
        set({ authData: updatedAuthData });

        localStorage.setItem("authData", JSON.stringify(updatedAuthData));

        handleCachedMutationsForUserAttributes("custom:theme");

        if (!isGuest) {
            mutation.mutate(
                {
                    attribute: "custom:theme",
                    value: theme,
                },
                {
                    onSuccess(data, variables, context) {
                        console.log("Successfully updated user attribute", data);
                    },
                    onError(error, variables, context) {
                        console.error("Failed to update user attribute", error);
                    },
                }
            );
        }
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
    openConfirmModal() {
        set({
            isConfirmModalOpen: true,
        });
    },
    closeConfirmModal() {
        set({
            isConfirmModalOpen: false,
        });
    },
    openReadOnlyModal() {
        set({
            isReadOnlyModalOpen: true,
        });
    },
    closeReadOnlyModal() {
        set({
            isReadOnlyModalOpen: false,
        });
    },
    openAiPrompt() {
        set({
            isAiPromptOpen: true,
        });
    },
    closeAiPrompt() {
        set({
            isAiPromptOpen: false,
        });
    },
    openFeedbackModal() {
        set({
            isFeedbackModalOpen: true,
        });
    },
    closeFeedbackModal() {
        set({
            isFeedbackModalOpen: false,
        });
    },
    openExportModal() {
        set({
            isExportModalOpen: true,
        });
    },
    closeExportModal() {
        set({
            isExportModalOpen: false,
        });
    },
    openLeftPanel() {
        set({
            isLeftPanelOpen: true,
        });
    },
    closeLeftPanel() {
        set({
            isLeftPanelOpen: false,
        });
    },
    openRightPanel() {
        set({
            isRightPanelOpen: true,
        });
    },
    closeRightPanel() {
        set({
            isRightPanelOpen: false,
        });
    },
    openNavigation() {
        set({
            isNavigationOpen: true,
        });
    },
    closeNavigation() {
        set({
            isNavigationOpen: false,
        });
    },
    toggleAiSuggestions(mutation: UpdateUserAttributeMutation) {
        const { isGuest, authData, handleCachedMutationsForUserAttributes } = get();
        let aiSuggestionsEnabled =
            authData?.["custom:aiSuggestionsEnabled"] === "false"
                ? false
                : true;
        let updatedAuthData = {
            ...authData,
            ["custom:aiSuggestionsEnabled"]: String(!aiSuggestionsEnabled),
        };
        set({ authData: updatedAuthData });
        localStorage.setItem("authData", JSON.stringify(updatedAuthData));

        handleCachedMutationsForUserAttributes("custom:aiSuggestionsEnabled");

        if(!isGuest) {
            mutation.mutate(
                {
                    attribute: "custom:aiSuggestionsEnabled",
                    value: String(!aiSuggestionsEnabled),
                },
                {
                    onSuccess(data, variables, context) {
                        console.log("Successfully updated user attribute", data);
                    },
                    onError(error, variables, context) {
                        console.error("Failed to update user attribute", error);
                    },
                }
            );
        }
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
                    "custom:theme": "system",
                    "custom:aiSuggestionsEnabled": "true",
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
        await signOut();
    },
    getAuthData() {
        const { isGuest, credentials, authData, jwtToken } = get();

        if ((isGuest && !credentials) || (!isGuest && !jwtToken)) {
            let creds = localStorage.getItem("credentials");
            let token = localStorage.getItem("jwtToken");
            let payload = localStorage.getItem("authData");

            const parsedCredentials = creds ? JSON.parse(creds) : null;
            const parsedPayload = payload ? JSON.parse(payload) : null;

            set({
                isGuest: Boolean(!token),
                credentials: parsedCredentials,
                authData: parsedPayload,
                jwtToken: token ?? "",
            });

            return {
                credentials: parsedCredentials,
                authData: parsedPayload,
                jwtToken: token ?? "",
            };
        }

        return { credentials, authData, jwtToken };
    },
    /**
     * Gets auth data from the store,
     * if not present, it tries to fetch it from localStorage.
     * If localStorage is empty or auth data is expired, it fetches a new session.
     */
    async retrieveAuthData() {
        const { getAuthData } = get();

        const { credentials, authData, jwtToken } = getAuthData();

        // only fetch new session when credentials are expired
        if (credentials && new Date(credentials.expiration) > new Date()) {
            return { credentials, authData, jwtToken };
        }

        set({ fetchingSession: true });
        const session = await fetchAuthSession({ forceRefresh: true });

        const sessionCreds = {
            ...session.credentials,
            expiration: session.credentials?.expiration?.toISOString(),
        };

        const payload = session.tokens?.idToken?.payload;
        const token = session.tokens?.idToken?.toString();

        set({
            isGuest: Boolean(!token),
            credentials: sessionCreds ?? null,
            authData: payload ?? null,
            jwtToken: token ?? "",
            fetchingSession: false,
        });

        if (sessionCreds)
            localStorage.setItem("credentials", JSON.stringify(sessionCreds));
        if (payload) localStorage.setItem("authData", JSON.stringify(payload));
        if (token) localStorage.setItem("jwtToken", token ?? "");

        return {
            credentials: sessionCreds,
            authData: payload ?? null,
            jwtToken: token ?? "",
        };
    },
    async emptyAuthData() {
        const { emptyDiagrams } = useDiagramStore.getState();
        set({
            credentials: null,
            authData: null,
            jwtToken: "",
        });
        emptyDiagrams();

        localStorage.removeItem("credentials");
        localStorage.removeItem("authData");
        localStorage.removeItem("jwtToken");
    },
    async apiCall({ method = "GET", query, body }: ApiCallProps) {
        const { isGuest, retrieveAuthData } = get();

        const { jwtToken, credentials } = await retrieveAuthData();

        let queryString = "";
        if (query) {
            const searchParams = new URLSearchParams(query);
            queryString = `?${searchParams.toString()}`;
        }

        let response;

        if (isGuest) {
            const request = new HttpRequest({
                method,
                protocol: "https:",
                path: "/prod/diagramsForGuests",
                headers: {
                    host,
                },
                hostname: host,
                query,
                body: body ? JSON.stringify(body) : undefined,
            });

            const signer = new SignatureV4({
                credentials: credentials,
                service: "execute-api",
                region: "us-east-1",
                sha256: Sha256,
            });

            const signedRequest = await signer.sign(request);

            response = await fetch(
                `https://${signedRequest.hostname}${signedRequest.path}${queryString}`,
                {
                    method: signedRequest.method,
                    headers: signedRequest.headers,
                    body: signedRequest.body,
                }
            );
        } else {
            response = await fetch(`${url}${queryString}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: body ? JSON.stringify(body) : undefined,
            });
        }

        return response;
    },
    async feedbackApiCall({
        method = "POST",
        query,
        body,
        controller,
    }: ApiCallProps) {
        const { isGuest, retrieveAuthData } = get();

        const { jwtToken, credentials } = await retrieveAuthData();

        let queryString = "";
        if (query) {
            const searchParams = new URLSearchParams(query);
            queryString = `?${searchParams.toString()}`;
        }

        let response;
        if (isGuest) {
            const request = new HttpRequest({
                method,
                protocol: "https:",
                path: "/prod/feedbackForGuests",
                headers: {
                    host: feedbackHost,
                },
                hostname: feedbackHost,
                query,
                body: body ? JSON.stringify(body) : undefined,
            });

            const signer = new SignatureV4({
                credentials: credentials,
                service: "execute-api",
                region: "us-east-1",
                sha256: Sha256,
            });

            const signedRequest = await signer.sign(request);

            response = await fetch(
                `https://${signedRequest.hostname}${signedRequest.path}${queryString}`,
                {
                    method: signedRequest.method,
                    headers: signedRequest.headers,
                    body: signedRequest.body,
                    signal: controller?.signal,
                }
            );
        } else {
            response = await fetch(`${feedbackUrl}${queryString}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller?.signal,
            });
        }

        return response;
    },
}));

interface ApiCallProps {
    method?: string;
    query?: Record<string, string>;
    body?: Record<string, any>;
    token?: string;
    creds?: any;
    controller?: AbortController;
}

export default useUserStore;

const isModalOpenSelector = (state: UserState) =>
    state.isAuthModalOpen ||
    state.isConfirmModalOpen ||
    state.isReadOnlyModalOpen ||
    state.isAiPromptOpen ||
    state.isFeedbackModalOpen ||
    state.isExportModalOpen;

const isMenuOpenSelector = (state: UserState) =>
    state.isThemeMenuOpen || state.isSettingsMenuOpen;

export const isAnyModalOrMenuOpenSelector = (state: UserState) =>
    isModalOpenSelector(state) || isMenuOpenSelector(state);

export const themeSelector = (state: UserState) =>
    String(state.authData?.["custom:theme"] ?? "system") as AppTheme;

export const aiSuggestionsEnabledSelector = (state: UserState) =>
    state.authData?.["custom:aiSuggestionsEnabled"] === "false" ? false : true;
