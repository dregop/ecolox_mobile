import { User } from "./user";

export class UserFeatures {
    public start_challenges?: Date;
    public level?: any;
    public pourcent_lvl?: any;
    public pourcent_health?: any;
    public last_watering?: any;
    public deplacement?: any;
    public achats?: any;
    public maison?: any;
    public internet?: any;
    public created_at?: any
    
    constructor(start_challenges?: Date, level?: string, deplacement?: number, achats?: number, maison?: number, internet?: number, pourcent_lvl?: number, pourcent_health?: number, last_watering?: Date, created_at?: Date) {
        this.start_challenges = start_challenges;
        this.level = level;
        this.pourcent_lvl = pourcent_lvl;
        this.pourcent_health = pourcent_health;
        this.last_watering = last_watering;
        this.deplacement = deplacement;
        this.achats = achats;
        this.maison = maison;
        this.internet = internet;
        this.created_at = created_at;
    }
}