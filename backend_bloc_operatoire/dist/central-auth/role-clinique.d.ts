export declare enum RoleClinique {
    RESPONSABLE_CPA = "RESPONSABLE_CPA",
    ANESTHESISTE = "ANESTHESISTE",
    IBODE = "IBODE",
    MAJOR = "MAJOR"
}
export declare function matchRoleClinique(roleName: string | undefined | null): RoleClinique | null;
export declare function agitCommeAnesthesiste(role: RoleClinique | null | undefined): boolean;
