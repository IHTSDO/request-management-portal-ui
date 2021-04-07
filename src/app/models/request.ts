export class Request {
    constructor(
        public summary: string,
        public justification: string,
        public reference: string,
        public newFSN?: string,
        public newPreferredTerm?: string,
        public synonyms?: string,
        public parentConcept?: string,
        public concept?: string,
        public conceptId?: string,
        public conceptName?: string,
        public newRelationship?: string,
        public relationshipType?: string,
        public newDescription?: string,
        public existingRelationship?: string,
        public destinationConcept?: string,
        public existingDescription?: string,
        public language?: string,
        public context?: string) {
    }
}
