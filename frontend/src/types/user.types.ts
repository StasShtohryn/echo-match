export interface AuthUser {
    id: string;
    email: string;
    token: string;
    name?: string;
    picture?: string;
    provider?: "local" | "google";
}

export interface GoogleUser {
    email: string;
    name: string;
    picture: string;
}

export interface RegularUser {
    id: string;
    email: string;
    token: string;
    name?: string;
    picture?: string;
    provider?: "local" | "google";
}