/**
 * GestionRFQ API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Statut } from './statut';


export interface RFQDetailsDto { 
    codeRFQ?: number;
    quoteName?: string | null;
    numRefQuoted?: number;
    sopDate?: string | null;
    maxV?: number;
    estV?: number;
    koDate?: string | null;
    customerDataDate?: string | null;
    mdDate?: string | null;
    mrDate?: string | null;
    tdDate?: string | null;
    trDate?: string | null;
    ldDate?: string | null;
    lrDate?: string | null;
    cdDate?: string | null;
    approvalDate?: string | null;
    dateCreation?: string;
    statut?: Statut;
    materialLeader?: string | null;
    testLeader?: string | null;
    marketSegment?: string | null;
    ingenieurRFQ?: string | null;
    validateur?: string | null;
    client?: string | null;
    valide?: boolean;
    rejete?: boolean;
}
export namespace RFQDetailsDto {
}


