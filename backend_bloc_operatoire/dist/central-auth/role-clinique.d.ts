export declare enum RoleClinique {
    RESPONSABLE_CPA = "RESPONSABLE_CPA",
    ANESTHESISTE = "ANESTHESISTE",
    CHIRURGIEN = "CHIRURGIEN",
    IBODE = "IBODE",
    MAJOR = "MAJOR"
}
export declare function matchRoleClinique(roleName: string | undefined | null): RoleClinique | null;
