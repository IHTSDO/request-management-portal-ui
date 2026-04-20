export class Request {
    constructor(
        public id: number,
        public type: string,
        public status: string,
        public country: string,
        public reporter: string,
        public assignee: string,
        public summary: string,
        public languageRefset: string,
        public contextRefset: string,
        public concept: string,
        public conceptId: string,
        public conceptName: string,
        public relationshipType: string,
        public relationshipTarget: string,
        public existingRelationship: string,
        public memberConceptIds: string,
        public eclQuery: string,
        public existingDescription: string,
        public newDescription: string,
        public newFSN: string,
        public newPT: string,
        public newSynonyms: string,
        public parentConcept: string,
        public justification: string,
        public reference: string,
        public created: number,
        public updated: number,
        public additionalInformation: string,
        public sourceId: string,
        public destinationId: string,
        public characteristicTypeId: string,
        public memberId: string
    ) {}
}

export class RequestComment {
    constructor(
        public id: number,
        public body: string,
        public user?: string,
        public created?: number,
        public updated?: number
    ) {}
}

/** Metadata for a file linked to an RMP task (shape may vary by API). */
export interface RequestAttachment {
    id: number | string;
    fileName: string;
    sizeBytes?: number;
    created?: number;
    /** Absolute URL or path returned by the API, if any */
    downloadUrl?: string;
}
